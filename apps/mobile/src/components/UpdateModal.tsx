import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { COLORS } from './ui/Theme';
import { selfUpdater } from '../services/updater';
import type { UpdateCheckResult } from '../types';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateCheckResult | null;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!updateInfo) return null;

  // Case 1: App is already up to date!
  if (!updateInfo.updateAvailable) {
    return (
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.upToDateContainer}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.title}>You're Up to Date</Text>
              <Text style={styles.upToDateSub}>
                kcal-log <Text style={{ color: COLORS.accentGreen, fontWeight: '700' }}>v{updateInfo.currentVersion}</Text> is currently the newest version.
              </Text>
              <Text style={styles.upToDateDesc}>
                No new updates are available on GitHub Releases at this time.
              </Text>
            </View>

            <Button
              title="OK"
              variant="primary"
              size="lg"
              onPress={onClose}
              style={{ width: '100%', marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Case 2: New update is genuinely available!
  const handleInstall = async () => {
    if (!updateInfo.apkAsset) {
      setErrorMessage('No APK binary asset attached to this GitHub release.');
      return;
    }

    setDownloading(true);
    setDownloadPercent(0);
    setErrorMessage(null);
    setStatusMessage('Connecting to GitHub Releases CDN...');

    try {
      await selfUpdater.downloadAndInstallApk(
        updateInfo.apkAsset.browser_download_url,
        percent => {
          setDownloadPercent(percent);
          setStatusMessage(`Downloading APK (${percent}%)...`);
        }
      );

      setStatusMessage('✓ Download complete! Launching Android package installer...');
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update installation failed.';
      setErrorMessage(`${msg}\n\nYou can also tap "Direct Download in Browser" below.`);
      setStatusMessage(null);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenBrowser = async () => {
    if (updateInfo.apkAsset?.browser_download_url) {
      await Linking.openURL(updateInfo.apkAsset.browser_download_url);
    } else {
      await Linking.openURL(`https://github.com/DevHolako/kcal-log/releases/latest`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>New Update Available</Text>
              <Text style={styles.versionRow}>
                Current: v{updateInfo.currentVersion} →{' '}
                <Text style={{ color: COLORS.accentGreen, fontWeight: '700' }}>
                  {updateInfo.latestVersion}
                </Text>
              </Text>
            </View>
            <Badge label="New Release" variant="success" />
          </View>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.releaseName}>{updateInfo.releaseName}</Text>
            {updateInfo.releaseNotes ? (
              <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
            ) : null}

            {updateInfo.expectedSha256 ? (
              <View style={styles.checksumBox}>
                <Text style={styles.checksumLabel}>Cryptographic SHA-256 Digest:</Text>
                <Text style={styles.checksumText}>{updateInfo.expectedSha256}</Text>
              </View>
            ) : null}

            {/* Progress Bar during download */}
            {downloading ? (
              <View style={styles.progressContainer}>
                <ProgressBar
                  value={downloadPercent}
                  max={100}
                  color={COLORS.accentGreen}
                  height={8}
                />
                <Text style={styles.percentText}>{downloadPercent}%</Text>
              </View>
            ) : null}

            {statusMessage ? (
              <View style={styles.statusBox}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.accentGreen}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✓ APK Downloaded! Package installer launched. Please follow the on-screen prompt to complete installation.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.buttonStack}>
            <View style={styles.buttonRow}>
              <Button
                title="Later"
                variant="outline"
                onPress={onClose}
                disabled={downloading}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={downloading ? 'Downloading...' : 'Download & Install'}
                variant="primary"
                onPress={handleInstall}
                loading={downloading}
                disabled={downloading || success}
                style={{ flex: 1.5 }}
              />
            </View>

            {/* Fallback Direct Browser Download */}
            <Button
              title="🌐 Direct Download in Browser"
              variant="ghost"
              size="sm"
              onPress={handleOpenBrowser}
              style={{ marginTop: 8 }}
              textStyle={{ color: COLORS.textSecondary, fontSize: 12 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 22,
    maxHeight: '85%',
  },
  upToDateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentGreenMuted,
    borderWidth: 1,
    borderColor: COLORS.accentGreenBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 28,
    color: COLORS.accentGreen,
    fontWeight: '800',
  },
  upToDateSub: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  upToDateDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  versionRow: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  scrollArea: {
    marginVertical: 10,
  },
  releaseName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  checksumBox: {
    backgroundColor: COLORS.inputBackground,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginVertical: 8,
  },
  checksumLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  checksumText: {
    fontSize: 10,
    color: COLORS.accentGreen,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 4,
  },
  percentText: {
    fontSize: 11,
    color: COLORS.accentGreen,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '500',
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.accentRed,
    lineHeight: 16,
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
    lineHeight: 18,
  },
  buttonStack: {
    marginTop: 14,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});
