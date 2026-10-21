import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!updateInfo) return null;

  const handleInstall = async () => {
    if (!updateInfo.apkAsset) {
      setErrorMessage('No APK binary asset attached to this GitHub release.');
      return;
    }

    if (!updateInfo.expectedSha256) {
      setErrorMessage(
        'Warning: No published SHA-256 checksum found in release metadata or .sha256 file. ADR-0006 forbids installing unverified binaries.'
      );
      return;
    }

    setDownloading(true);
    setErrorMessage(null);
    setStatusMessage('Downloading APK binary...');

    try {
      setStatusMessage('Verifying cryptographic SHA-256 hash against published release checksum...');
      await selfUpdater.verifyAndValidateUpdate(
        updateInfo.apkAsset.browser_download_url,
        updateInfo.expectedSha256
      );

      setStatusMessage('SHA-256 verified! Launching package installer...');
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update installation failed.';
      setErrorMessage(msg);
      setStatusMessage(null);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Update Available</Text>
              <Text style={styles.versionRow}>
                Current: v{updateInfo.currentVersion} → <Text style={{ color: COLORS.accentGreen }}>{updateInfo.latestVersion}</Text>
              </Text>
            </View>
            <Badge label="GitHub Release" variant="success" />
          </View>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.releaseName}>{updateInfo.releaseName}</Text>
            {updateInfo.releaseNotes ? (
              <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
            ) : null}

            {updateInfo.expectedSha256 ? (
              <View style={styles.checksumBox}>
                <Text style={styles.checksumLabel}>Expected SHA-256 Digest:</Text>
                <Text style={styles.checksumText}>{updateInfo.expectedSha256}</Text>
              </View>
            ) : (
              <Text style={styles.checksumWarning}>
                ⚠️ No SHA-256 digest declared in release.
              </Text>
            )}

            {statusMessage ? (
              <View style={styles.statusBox}>
                <ActivityIndicator size="small" color={COLORS.accentGreen} style={{ marginRight: 8 }} />
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
                  ✓ APK Verified! Android FileProvider intent dispatched.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button
              title="Later"
              variant="outline"
              onPress={onClose}
              disabled={downloading}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={downloading ? 'Verifying...' : 'Download & Install'}
              variant="primary"
              onPress={handleInstall}
              loading={downloading}
              disabled={downloading || success}
              style={{ flex: 1 }}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  versionRow: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollArea: {
    marginVertical: 12,
  },
  releaseName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginVertical: 8,
  },
  checksumLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  checksumText: {
    fontSize: 10,
    color: COLORS.accentGreen,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  checksumWarning: {
    fontSize: 12,
    color: COLORS.accentAmber,
    marginVertical: 8,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.accentRed,
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
