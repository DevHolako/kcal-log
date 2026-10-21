import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { COLORS } from './ui/Theme';

interface MacroProgressProps {
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
}

export const MacroProgressSection: React.FC<MacroProgressProps> = ({
  consumedProtein,
  targetProtein,
  consumedCarbs,
  targetCarbs,
  consumedFat,
  targetFat,
}) => {
  const renderMacro = (
    label: string,
    consumed: number,
    target: number,
    color: string
  ) => {
    const roundedConsumed = Math.round(consumed);
    const roundedTarget = Math.round(target);
    const remaining = Math.max(0, roundedTarget - roundedConsumed);

    return (
      <View style={styles.macroItem} key={label}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>
            {roundedConsumed} / {roundedTarget}g
          </Text>
        </View>

        <ProgressBar
          value={roundedConsumed}
          max={roundedTarget}
          color={color}
          height={6}
          style={styles.progressBar}
        />

        <Text style={styles.macroRemaining}>
          {remaining > 0 ? `${remaining}g left` : 'Goal met'}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.sectionTitle}>Macronutrients</Text>
      <View style={styles.macroGrid}>
        {renderMacro('Carbohydrates', consumedCarbs, targetCarbs, COLORS.accentAmber)}
        {renderMacro('Protein', consumedProtein, targetProtein, COLORS.accentBlue)}
        {renderMacro('Fat', consumedFat, targetFat, COLORS.accentPurple)}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  macroGrid: {
    gap: 12,
  },
  macroItem: {
    marginBottom: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  macroValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressBar: {
    marginVertical: 4,
  },
  macroRemaining: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
});
