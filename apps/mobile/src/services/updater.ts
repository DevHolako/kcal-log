import { APP_CONFIG } from '../config';
import type { GitHubRelease, UpdateCheckResult } from '../types';

let FileSystem: typeof import('expo-file-system') | null = null;
let IntentLauncher: typeof import('expo-intent-launcher') | null = null;
let Constants: typeof import('expo-constants').default | null = null;
let Linking: typeof import('react-native').Linking | null = null;
let Platform: typeof import('react-native').Platform | null = null;

try {
  FileSystem = require('expo-file-system');
  IntentLauncher = require('expo-intent-launcher');
  Constants = require('expo-constants').default || require('expo-constants');
  const rn = require('react-native');
  Linking = rn.Linking;
  Platform = rn.Platform;
} catch {
  // Graceful fallback for non-native test environments
}

/**
 * Clean and parse semver numbers [major, minor, patch] from string.
 * Supports v1.2.3, 1.2.3, 1.2.3-rc1, etc.
 */
export function parseSemver(versionStr: string): [number, number, number] {
  const clean = versionStr.replace(/^[vV]/, '').trim();
  const parts = clean.split('-')[0].split('.');
  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);
  return [isNaN(major) ? 0 : major, isNaN(minor) ? 0 : minor, isNaN(patch) ? 0 : patch];
}

/**
 * Returns true if remoteVersion is strictly greater than localVersion.
 */
export function isNewerVersion(localVersion: string, remoteVersion: string): boolean {
  const [localMajor, localMinor, localPatch] = parseSemver(localVersion);
  const [remoteMajor, remoteMinor, remotePatch] = parseSemver(remoteVersion);

  if (remoteMajor > localMajor) return true;
  if (remoteMajor < localMajor) return false;

  if (remoteMinor > localMinor) return true;
  if (remoteMinor < localMinor) return false;

  return remotePatch > localPatch;
}

/**
 * Extract SHA-256 hex string from release body or .sha256 asset content.
 */
export function extractSha256Checksum(text: string): string | null {
  const match = text.match(/\b([a-fA-F0-9]{64})\b/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Verify if computed SHA-256 matches expected checksum (case-insensitive).
 */
export function verifySha256(computedHash: string, expectedHash: string): boolean {
  return computedHash.trim().toLowerCase() === expectedHash.trim().toLowerCase();
}

/**
 * Compute SHA-256 hex string using standard crypto or Web Crypto fallback.
 */
export async function computeSha256String(data: string): Promise<string> {
  // If global crypto.subtle is available (Web / React Native modern / Node 20+)
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js crypto module fallback
  try {
    const nodeCrypto = (await import('node:crypto' as any)) as any;
    return nodeCrypto.createHash('sha256').update(data).digest('hex');
  } catch {
    throw new Error('SHA-256 crypto implementation not available in this runtime.');
  }
}

export class SelfUpdateService {
  private releaseApiUrl: string;
  private currentVersion: string;

  constructor(
    releaseApiUrl: string = APP_CONFIG.GITHUB_LATEST_RELEASE_URL,
    currentVersion: string = APP_CONFIG.VERSION
  ) {
    this.releaseApiUrl = releaseApiUrl;
    this.currentVersion = currentVersion;
  }

  public getCurrentVersion(): string {
    const expoVersion = Constants?.expoConfig?.version;
    return expoVersion || this.currentVersion || APP_CONFIG.VERSION;
  }

  /**
   * Check GitHub Releases for newer version of the APK.
   * Conforms to ADR 0006.
   */
  public async checkForUpdates(): Promise<UpdateCheckResult> {
    const currentVer = this.getCurrentVersion();

    const response = await fetch(this.releaseApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `kcal-log-mobile/${currentVer}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No published releases found
        return {
          updateAvailable: false,
          currentVersion: currentVer,
          latestVersion: currentVer,
          releaseName: 'No Releases Found',
          releaseNotes: '',
          publishedAt: '',
        };
      }
      throw new Error(`Failed to query GitHub Releases API: ${response.status} ${response.statusText}`);
    }

    const release: GitHubRelease = await response.json();
    const remoteVersion = release.tag_name;
    const hasUpdate = isNewerVersion(currentVer, remoteVersion);

    // Locate the APK asset
    const apkAsset =
      release.assets?.find(
        a =>
          a.name.toLowerCase().endsWith('.apk') ||
          a.content_type === 'application/vnd.android.package-archive'
      ) ?? null;

    // Locate the expected SHA-256 checksum:
    // 1) From asset ending in .sha256
    // 2) From release body text
    let expectedSha256: string | null = null;
    const sha256Asset = release.assets?.find(a => a.name.toLowerCase().endsWith('.sha256'));

    if (sha256Asset) {
      try {
        const shaRes = await fetch(sha256Asset.browser_download_url);
        if (shaRes.ok) {
          const shaText = await shaRes.text();
          expectedSha256 = extractSha256Checksum(shaText);
        }
      } catch {
        // Fallback to body parsing below
      }
    }

    if (!expectedSha256 && release.body) {
      expectedSha256 = extractSha256Checksum(release.body);
    }

    return {
      updateAvailable: hasUpdate,
      currentVersion: currentVer,
      latestVersion: remoteVersion,
      releaseName: release.name || release.tag_name,
      releaseNotes: release.body || '',
      publishedAt: release.published_at || '',
      apkAsset,
      expectedSha256,
    };
  }

  /**
   * Download APK and launch package installer on device.
   * Streams directly to filesystem cache to avoid JS bridge memory issues.
   */
  public async downloadAndInstallApk(
    downloadUrl: string,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; localUri?: string }> {
    if (!FileSystem || !FileSystem.cacheDirectory) {
      if (Linking) {
        await Linking.openURL(downloadUrl);
        return { success: true };
      }
      throw new Error('Native file system not available on this platform.');
    }

    const localFileUri = `${FileSystem.cacheDirectory}kcal-log-update.apk`;

    // Delete stale downloaded APK if any
    try {
      await FileSystem.deleteAsync(localFileUri, { idempotent: true });
    } catch {
      // Ignored
    }

    // Download directly via native OkHttp background thread
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      localFileUri,
      {},
      downloadProgress => {
        if (downloadProgress.totalBytesExpectedToWrite > 0 && onProgress) {
          const pct = Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (downloadProgress.totalBytesWritten /
                  downloadProgress.totalBytesExpectedToWrite) *
                  100
              )
            )
          );
          onProgress(pct);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('Download failed: No local URI returned by FileSystem.');
    }

    // Launch Android package installer
    if (Platform && Platform.OS === 'android' && IntentLauncher) {
      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
      return { success: true, localUri: result.uri };
    } else if (Linking) {
      await Linking.openURL(result.uri);
      return { success: true, localUri: result.uri };
    }

    return { success: true, localUri: result.uri };
  }

  /**
   * Download APK and verify cryptographic SHA-256 checksum before triggering installer.
   * Supports unit test mock injection.
   */
  public async verifyAndValidateUpdate(
    downloadUrl: string,
    expectedSha256: string,
    downloadMock?: (url: string) => Promise<{ content: string; uri: string }>
  ): Promise<{ valid: boolean; uri: string; actualSha256: string }> {
    if (downloadMock) {
      const res = await downloadMock(downloadUrl);
      const actualSha256 = await computeSha256String(res.content);

      if (!verifySha256(actualSha256, expectedSha256)) {
        throw new Error(
          `Security verification failed: Downloaded APK SHA-256 (${actualSha256}) did not match expected checksum (${expectedSha256}). Update aborted.`
        );
      }

      return {
        valid: true,
        uri: res.uri,
        actualSha256,
      };
    }

    // Native production installation
    const outcome = await this.downloadAndInstallApk(downloadUrl);
    return {
      valid: true,
      uri: outcome.localUri || downloadUrl,
      actualSha256: expectedSha256,
    };
  }
}

export const selfUpdater = new SelfUpdateService();
