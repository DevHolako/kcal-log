import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './ui/Button';
import { COLORS } from './ui/Theme';

interface OfflineBannerProps {
  isOffline: boolean;
  pendingCount: number;
  onSync: () => Promise<void>;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  pendingCount,
  onSync,
}) => {
  const [syncing, setSyncing] = useState(false);

  if (!isOffline && pendingCount === 0) {
    return null;
  }

  const handleSyncPress = async () => {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {isOffline ? '⚡ Offline Mode Active' : '🔄 Changes Pending'}
        </Text>
        <Text style={styles.subtitle}>
          {pendingCount > 0
            ? `${pendingCount} mutation${pendingCount > 1 ? 's' : ''} queued locally`
            : 'Using cached diary data'}
        </Text>
      </View>

      <Button
        title="Sync"
        size="sm"
        variant="secondary"
        onPress={handleSyncPress}
        loading={syncing}
        style={styles.syncButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accentAmber,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentAmber,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  syncButton: {
    marginLeft: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accentAmber,
  },
});
