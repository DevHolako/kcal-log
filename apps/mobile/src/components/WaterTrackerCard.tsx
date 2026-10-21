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
  totalWaterMl,
  targetWaterMl = 2000,
  onAddWater,
}) => {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

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
      <View style={styles.header}>
        <Text style={styles.title}>Water Tracker</Text>
        <Text style={styles.amountText}>
          {totalWaterMl} / {targetWaterMl} ml
        </Text>
      </View>

      <ProgressBar
        value={totalWaterMl}
        max={targetWaterMl}
        color={COLORS.accentBlue}
        height={8}
        style={styles.progressBar}
      />

      <View style={styles.buttonRow}>
        <Button
          title="+ 250 ml (Cup)"
          variant="secondary"
          size="sm"
          onPress={() => handleAdd(250)}
          loading={loadingAmount === 250}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="+ 500 ml (Bottle)"
          variant="secondary"
          size="sm"
          onPress={() => handleAdd(500)}
          loading={loadingAmount === 500}
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentBlue,
  },
  progressBar: {
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
