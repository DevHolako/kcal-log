import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { COLORS } from './ui/Theme';

interface WaterTrackerCardProps {
  totalWaterMl: number;
  targetWaterMl?: number;
  onAddWater: (amountMl: number) => Promise<void>;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  totalWaterMl = 0,
  targetWaterMl = 2000,
  onAddWater,
}) => {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  const safeTotal = Math.max(0, Number(totalWaterMl) || 0);
  const safeTarget = Math.max(1, Number(targetWaterMl) || 2000);
  const percent = Math.min(100, Math.round((safeTotal / safeTarget) * 100));

  const handleAdd = async (amount: number) => {
    setLoadingAmount(amount);
    try {
      await onAddWater(amount);
    } finally {
      setLoadingAmount(null);
    }
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.waterIcon}>💧</Text>
          <Text style={styles.title}>Water Tracker</Text>
        </View>
        <Text style={styles.amountText}>
          {safeTotal.toLocaleString()} / {safeTarget.toLocaleString()} ml
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        value={safeTotal}
        max={safeTarget}
        color={COLORS.accentBlue}
        trackColor="#1a2333"
        height={8}
        style={styles.progressBar}
      />

      <View style={styles.subtextRow}>
        <Text style={styles.subtextLeft}>{percent}% of daily hydration goal</Text>
        <Text style={styles.subtextRight}>
          {Math.max(0, safeTarget - safeTotal)} ml remaining
        </Text>
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.buttonRow}>
        <Button
          title="+ 250 ml (Glass)"
          variant="secondary"
          size="sm"
          onPress={() => handleAdd(250)}
          loading={loadingAmount === 250}
          style={styles.waterBtn}
          textStyle={{ color: COLORS.accentBlue, fontWeight: '700' }}
        />
        <Button
          title="+ 500 ml (Bottle)"
          variant="secondary"
          size="sm"
          onPress={() => handleAdd(500)}
          loading={loadingAmount === 500}
          style={styles.waterBtn}
          textStyle={{ color: COLORS.accentBlue, fontWeight: '700' }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentBlue,
  },
  progressBar: {
    marginVertical: 6,
  },
  subtextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtextLeft: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  subtextRight: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: '#121824',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
});
