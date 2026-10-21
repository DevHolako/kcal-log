import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { COLORS } from './ui/Theme';

interface CalorieBudgetProps {
  targetCalories: number;
  consumedCalories: number;
  exerciseCalories: number;
  remainingCalories: number;
}

export const CalorieBudgetCard: React.FC<CalorieBudgetProps> = ({
  targetCalories,
  consumedCalories,
  exerciseCalories,
  remainingCalories,
}) => {
  const isOverBudget = remainingCalories < 0;
  const totalBudget = targetCalories + exerciseCalories;
  const consumedPercent = totalBudget > 0 ? Math.min(100, Math.round((consumedCalories / totalBudget) * 100)) : 0;

  const formatNumber = (num: number): string => {
    return Math.abs(Math.round(num)).toLocaleString('en-US');
  };

  return (
    <Card style={styles.card}>
      {/* Header Row: Title & Status Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Energy Budget</Text>
        {isOverBudget ? (
          <Badge label="Over Budget" variant="destructive" size="sm" />
        ) : (
          <Badge label="On Track" variant="success" size="sm" />
        )}
      </View>

      {/* Hero Remaining Display */}
      <View style={styles.remainingContainer}>
        <Text
          style={[
            styles.remainingNumber,
            isOverBudget && { color: COLORS.accentRed },
          ]}
        >
          {formatNumber(remainingCalories)}
        </Text>
        <View style={styles.unitContainer}>
          <Text style={[styles.remainingUnit, isOverBudget && { color: COLORS.accentRed }]}>
            {isOverBudget ? 'kcal over' : 'kcal remaining'}
          </Text>
          <Text style={styles.percentText}>
            {consumedPercent}% of daily budget
          </Text>
        </View>
      </View>

      {/* Progress Bar with Ratio */}
      <ProgressBar
        value={consumedCalories}
        max={totalBudget}
        color={isOverBudget ? COLORS.accentRed : COLORS.accentGreen}
        height={10}
        style={styles.progressBar}
      />

      <View style={styles.progressLabelsRow}>
        <Text style={styles.progressLabelLeft}>{consumedPercent}% consumed</Text>
        <Text style={styles.progressLabelRight}>
          {formatNumber(consumedCalories)} / {formatNumber(totalBudget)} kcal
        </Text>
      </View>

      {/* 3 Metric Tiles (Dashboard View) */}
      <View style={styles.metricGrid}>
        <View style={styles.metricTile}>
          <Text style={styles.metricValue}>{formatNumber(targetCalories)}</Text>
          <Text style={styles.metricLabel}>Base Goal</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={[styles.metricValue, { color: COLORS.textPrimary }]}>
            {formatNumber(consumedCalories)}
          </Text>
          <Text style={styles.metricLabel}>Food Logged</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={[styles.metricValue, { color: exerciseCalories > 0 ? COLORS.accentAmber : COLORS.textMuted }]}>
            {formatNumber(exerciseCalories)}
          </Text>
          <Text style={styles.metricLabel}>Exercise</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10,
  },
  remainingNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  unitContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  remainingUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  percentText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  progressBar: {
    marginTop: 4,
    marginBottom: 6,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabelLeft: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressLabelRight: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 14,
  },
  metricTile: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 3,
  },
});
