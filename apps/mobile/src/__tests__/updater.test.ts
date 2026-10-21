import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
  parseSemver,
  isNewerVersion,
  extractSha256Checksum,
  verifySha256,
  computeSha256String,
  SelfUpdateService,
} from '../services/updater';

describe('ADR-0006 Android APK Self-Update Engine', () => {
  describe('Semver Parsing & Comparison', () => {
    it('parses standard semver strings with or without "v" prefix', () => {
      expect(parseSemver('1.2.3')).toEqual([1, 2, 3]);
      expect(parseSemver('v1.2.3')).toEqual([1, 2, 3]);
      expect(parseSemver('V2.0.1-beta')).toEqual([2, 0, 1]);
      expect(parseSemver('0.1.0')).toEqual([0, 1, 0]);
    });

    it('correctly determines when a remote version is strictly newer', () => {
      // Patch update
      expect(isNewerVersion('0.1.0', 'v0.1.1')).toBe(true);
      // Minor update
      expect(isNewerVersion('0.1.0', '0.2.0')).toBe(true);
      // Major update
      expect(isNewerVersion('0.9.9', '1.0.0')).toBe(true);

      // Same version
      expect(isNewerVersion('0.1.0', 'v0.1.0')).toBe(false);
      expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);

      // Downgrade / older
      expect(isNewerVersion('1.2.0', 'v1.1.9')).toBe(false);
      expect(isNewerVersion('2.0.0', '1.9.9')).toBe(false);
    });
  });

  describe('SHA-256 Checksum Handling', () => {
    const validDigest = 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';

    it('extracts SHA-256 digest from release body markdown or sha256 file text', () => {
      const markdown = `
## Release v0.2.0
Bug fixes and improvements.

**Checksums**:
SHA-256: ${validDigest}
      `;
      expect(extractSha256Checksum(markdown)).toBe(validDigest);

      const rawFile = `${validDigest}  kcal-log-release.apk\n`;
      expect(extractSha256Checksum(rawFile)).toBe(validDigest);
    });

    it('returns null when text does not contain a 64-char hex digest', () => {
      expect(extractSha256Checksum('No checksum provided')).toBeNull();
      expect(extractSha256Checksum('short-hash-1234')).toBeNull();
    });

    it('verifies SHA-256 match case-insensitively with trimming', () => {
      expect(verifySha256(validDigest, validDigest.toUpperCase())).toBe(true);
      expect(verifySha256(`  ${validDigest} \n`, validDigest)).toBe(true);
      expect(verifySha256('0000000000000000000000000000000000000000000000000000000000000000', validDigest)).toBe(false);
    });

    it('computes cryptographic SHA-256 string accurately', async () => {
      const data = 'kcal-log-apk-binary-content-test';
      const hash = await computeSha256String(data);
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);

      // Known hash for empty string: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      const emptyHash = await computeSha256String('');
      expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
  });

  describe('SelfUpdateService API Check & Security Verification', () => {
    let service: SelfUpdateService;

    beforeEach(() => {
      service = new SelfUpdateService('https://api.github.com/repos/DevHolako/kcal-log/releases/latest', '0.1.0');
      vi.restoreAllMocks();
    });

    it('identifies update availability and finds APK asset and checksum', async () => {
      const fakeRelease = {
        id: 101,
        tag_name: 'v0.2.0',
        name: 'Release 0.2.0',
        body: 'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nNew features added.',
        published_at: '2026-10-21T10:00:00Z',
        assets: [
          {
            id: 1,
            name: 'kcal-log-v0.2.0.apk',
            size: 25000000,
            browser_download_url: 'https://github.com/DevHolako/kcal-log/releases/download/v0.2.0/kcal-log-v0.2.0.apk',
            content_type: 'application/vnd.android.package-archive',
          },
        ],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => fakeRelease,
      } as Response);

      const result = await service.checkForUpdates();
      expect(result.updateAvailable).toBe(true);
      expect(result.currentVersion).toBe('0.1.0');
      expect(result.latestVersion).toBe('v0.2.0');
      expect(result.apkAsset?.name).toBe('kcal-log-v0.2.0.apk');
      expect(result.expectedSha256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('rejects APK installation and throws error when computed SHA-256 mismatches', async () => {
      const expectedSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      const fakeApkContent = 'malicious-or-corrupted-apk-binary-content';

      const downloadMock = vi.fn().mockResolvedValue({
        content: fakeApkContent,
        uri: 'file:///cache/update.apk',
      });

      await expect(
        service.verifyAndValidateUpdate('https://example.com/fake.apk', expectedSha256, downloadMock)
      ).rejects.toThrow(/Security verification failed/);
    });

    it('successfully validates update when computed SHA-256 matches published digest', async () => {
      const validContent = 'legitimate-android-apk-payload';
      const validHash = await computeSha256String(validContent);

      const downloadMock = vi.fn().mockResolvedValue({
        content: validContent,
        uri: 'file:///cache/update.apk',
      });

      const outcome = await service.verifyAndValidateUpdate(
        'https://example.com/legit.apk',
        validHash,
        downloadMock
      );

      expect(outcome.valid).toBe(true);
      expect(outcome.actualSha256).toBe(validHash);
      expect(outcome.uri).toBe('file:///cache/update.apk');
    });
  });
});
