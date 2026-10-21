import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { COLORS } from '../components/ui/Theme';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import { selfUpdater } from '../services/updater';
import { APP_CONFIG } from '../config';
import type { UpdateCheckResult } from '../types';
import { UpdateModal } from '../components/UpdateModal';

export const SettingsScreen: React.FC = () => {
  const { user, apiUrl, updateApiUrl, logout } = useAuth();
  const { pendingMutationsCount, syncOfflineQueue } = useDiary();

  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [urlSaved, setUrlSaved] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) return;
    await updateApiUrl(inputUrl.trim());
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2500);
  };

  const currentVersion = selfUpdater.getCurrentVersion();

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await selfUpdater.checkForUpdates();
      setUpdateResult(res);
      setUpdateModalVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query GitHub Releases.';
      setUpdateResult({
        updateAvailable: false,
        currentVersion: currentVersion,
        latestVersion: currentVersion,
        releaseName: 'Update Check Failed',
        releaseNotes: msg,
        publishedAt: '',
      });
      setUpdateModalVisible(true);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await syncOfflineQueue();
      setSyncStatus('✓ Sync complete! Local state synchronized with API.');
    } catch {
      setSyncStatus('Sync attempt finished with pending items remaining.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Account Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.accountRow}>
            <View>
              <Text style={styles.userName}>{user?.name || 'Logged In User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
            <Badge label="Authenticated" variant="success" />
          </View>
        </Card>

        {/* Server Connection URL */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>API Server Endpoint</Text>
          <Text style={styles.cardDesc}>
            Configure the backend Laravel REST API address. Default: https://kcal.holako.dev
          </Text>

          <Input
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="https://kcal.holako.dev"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {urlSaved && <Text style={styles.savedNotice}>✓ Server URL saved.</Text>}

          <Button
            title="Save Server URL"
            variant="secondary"
            size="sm"
            onPress={handleSaveUrl}
          />
        </Card>

        {/* GitHub Releases Self-Update (ADR 0006) */}
        <Card style={styles.card}>
          <View style={styles.updateHeader}>
            <View>
              <Text style={styles.cardTitle}>App Version & Distribution</Text>
              <Text style={styles.versionText}>
                Installed: v{currentVersion} ({APP_CONFIG.REPOSITORY_FULL_NAME})
              </Text>
            </View>
            <Badge label="ADR-0006" variant="outline" />
          </View>

          <Text style={styles.cardDesc}>
            Checks GitHub Releases for verified APK downloads and cryptographically validates the published SHA-256 hash before installation.
          </Text>

          <Button
            title="Check for Updates"
            variant="primary"
            onPress={handleCheckUpdate}
            loading={checkingUpdate}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Offline Cache & Queue */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Offline Data & Synchronization</Text>
          <Text style={styles.cardDesc}>
            Pending mutations: {pendingMutationsCount} items queued for background retry.
          </Text>

          {syncStatus && <Text style={styles.syncStatusText}>{syncStatus}</Text>}

          <Button
            title="Force Synchronize Now"
            variant="secondary"
            size="sm"
            onPress={handleManualSync}
            loading={isSyncing}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Log Out & Revoke Token"
          variant="destructive"
          size="lg"
          onPress={logout}
          style={styles.logoutButton}
        />

        {/* Self-Update Dialog */}
        <UpdateModal
          visible={updateModalVisible}
          updateInfo={updateResult}
          onClose={() => setUpdateModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  savedNotice: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginBottom: 8,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  syncStatusText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    marginVertical: 6,
  },
  logoutButton: {
    marginTop: 8,
  },
});
