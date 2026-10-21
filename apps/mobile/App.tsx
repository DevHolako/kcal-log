import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { DiaryProvider } from './src/context/DiaryContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { selfUpdater } from './src/services/updater';
import { offlineQueue } from './src/services/offlineQueue';
import { UpdateModal } from './src/components/UpdateModal';
import type { UpdateCheckResult } from './src/types';

export default function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  useEffect(() => {
    // 1. ADR 0006: Check GitHub Releases for self-updates on launch (unauthenticated)
    const checkUpdatesOnLaunch = async () => {
      try {
        const result = await selfUpdater.checkForUpdates();
        if (result.updateAvailable) {
          setUpdateInfo(result);
          setUpdateModalVisible(true);
        }
      } catch {
        // Silent failure on launch update check (e.g. offline)
      }
    };

    // 2. Process offline queue if connectivity exists
    const tryOfflineSync = async () => {
      try {
        await offlineQueue.processQueue();
      } catch {
        // Ignore offline sync errors on startup
      }
    };

    checkUpdatesOnLaunch();
    tryOfflineSync();
  }, []);

  return (
    <AuthProvider>
      <DiaryProvider>
        <StatusBar style="light" backgroundColor="#09090b" />
        <RootNavigator />

        {/* Automatic launch update prompt if newer release detected */}
        <UpdateModal
          visible={updateModalVisible}
          updateInfo={updateInfo}
          onClose={() => setUpdateModalVisible(false)}
        />
      </DiaryProvider>
    </AuthProvider>
  );
}
