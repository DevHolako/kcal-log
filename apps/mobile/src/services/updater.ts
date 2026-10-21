import { APP_CONFIG } from '../config';
import type { GitHubRelease, UpdateCheckResult } from '../types';

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

  /**
   * Check GitHub Releases for newer version of the APK.
   * Conforms to ADR 0006.
   */
  public async checkForUpdates(): Promise<UpdateCheckResult> {
    const response = await fetch(this.releaseApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `kcal-log-mobile/${this.currentVersion}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No published releases found
        return {
          updateAvailable: false,
          currentVersion: this.currentVersion,
          latestVersion: this.currentVersion,
          releaseName: 'No Releases Found',
          releaseNotes: '',
          publishedAt: '',
        };
      }
      throw new Error(`Failed to query GitHub Releases API: ${response.status} ${response.statusText}`);
    }

    const release: GitHubRelease = await response.json();
    const remoteVersion = release.tag_name;
    const hasUpdate = isNewerVersion(this.currentVersion, remoteVersion);

    // Locate the APK asset
    const apkAsset = release.assets?.find(a =>
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
      currentVersion: this.currentVersion,
      latestVersion: remoteVersion,
      releaseName: release.name || release.tag_name,
      releaseNotes: release.body || '',
      publishedAt: release.published_at || '',
      apkAsset,
      expectedSha256,
    };
  }

  /**
   * Download APK and verify cryptographic SHA-256 checksum before triggering installer.
   */
  public async verifyAndValidateUpdate(
    downloadUrl: string,
    expectedSha256: string,
    downloadMock?: (url: string) => Promise<{ content: string; uri: string }>
  ): Promise<{ valid: boolean; uri: string; actualSha256: string }> {
    let content: string;
    let localUri: string;

    if (downloadMock) {
      const res = await downloadMock(downloadUrl);
      content = res.content;
      localUri = res.uri;
    } else {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to download APK asset: HTTP ${res.status}`);
      }
      content = await res.text();
      localUri = `file:///cache/downloaded_update.apk`;
    }

    const actualSha256 = await computeSha256String(content);

    if (!verifySha256(actualSha256, expectedSha256)) {
      throw new Error(
        `Security verification failed: Downloaded APK SHA-256 (${actualSha256}) did not match expected checksum (${expectedSha256}). Update aborted.`
      );
    }

    return {
      valid: true,
      uri: localUri,
      actualSha256,
    };
  }
}

export const selfUpdater = new SelfUpdateService();
