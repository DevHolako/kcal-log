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
    <View style={styles.bannerContainer}>
      <View style={styles.banner}>
        <View style={styles.dot} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOffline ? 'Offline Mode Active' : 'Changes Queued'}
          </Text>
          <Text style={styles.subtitle}>
            {pendingCount > 0
              ? `${pendingCount} mutation${pendingCount > 1 ? 's' : ''} queued locally`
              : 'Displaying cached diary data'}
          </Text>
        </View>

        <Button
          title={syncing ? 'Syncing...' : 'Sync'}
          size="sm"
          variant="secondary"
          onPress={handleSyncPress}
          loading={syncing}
          style={styles.syncButton}
          textStyle={{ color: COLORS.accentAmber, fontWeight: '700' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  banner: {
    backgroundColor: COLORS.accentAmberMuted,
    borderWidth: 1,
    borderColor: COLORS.accentAmberBorder,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentAmber,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentAmber,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  syncButton: {
    marginLeft: 10,
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.accentAmberBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
