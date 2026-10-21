import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
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

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Calories Remaining</Text>

      {/* Main Big Number */}
      <View style={styles.remainingContainer}>
        <Text
          style={[
            styles.remainingNumber,
            isOverBudget && { color: COLORS.accentRed },
          ]}
        >
          {Math.abs(Math.round(remainingCalories))}
        </Text>
        <Text style={styles.remainingUnit}>
          {isOverBudget ? 'kcal over' : 'kcal remaining'}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        value={consumedCalories}
        max={targetCalories + exerciseCalories}
        color={isOverBudget ? COLORS.accentRed : COLORS.accentGreen}
        height={10}
        style={styles.progressBar}
      />

      {/* Equation Breakdown: Goal - Food + Exercise = Remaining */}
      <View style={styles.equationRow}>
        <View style={styles.equationCol}>
          <Text style={styles.colValue}>{Math.round(targetCalories)}</Text>
          <Text style={styles.colLabel}>Goal</Text>
        </View>

        <Text style={styles.equationOp}>-</Text>

        <View style={styles.equationCol}>
          <Text style={styles.colValue}>{Math.round(consumedCalories)}</Text>
          <Text style={styles.colLabel}>Food</Text>
        </View>

        <Text style={styles.equationOp}>+</Text>

        <View style={styles.equationCol}>
          <Text style={styles.colValue}>{Math.round(exerciseCalories)}</Text>
          <Text style={styles.colLabel}>Exercise</Text>
        </View>

        <Text style={styles.equationOp}>=</Text>

        <View style={styles.equationCol}>
          <Text
            style={[
              styles.colValue,
              isOverBudget && { color: COLORS.accentRed },
            ]}
          >
            {Math.round(remainingCalories)}
          </Text>
          <Text style={styles.colLabel}>Net</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 12,
  },
  remainingNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  remainingUnit: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  progressBar: {
    marginBottom: 16,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 12,
  },
  equationCol: {
    alignItems: 'center',
  },
  colValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  colLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  equationOp: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
