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
  const renderMacroCard = (
    label: string,
    consumed: number,
    target: number,
    color: string,
    bgColor: string
  ) => {
    const roundedConsumed = Math.round(consumed);
    const roundedTarget = Math.round(target);
    const remaining = Math.max(0, roundedTarget - roundedConsumed);
    const percentage = roundedTarget > 0 ? Math.min(100, Math.round((roundedConsumed / roundedTarget) * 100)) : 0;
    const isGoalMet = roundedTarget > 0 && roundedConsumed >= roundedTarget;

    return (
      <View style={styles.macroCard} key={label}>
        <View style={styles.macroHeaderRow}>
          {/* Left: Indicator dot + Macro Label */}
          <View style={styles.macroTitleGroup}>
            <View style={[styles.macroDot, { backgroundColor: color }]} />
            <Text style={styles.macroName}>{label}</Text>
          </View>

          {/* Right: Ratio & Status */}
          <View style={styles.macroValuesGroup}>
            <Text style={styles.macroConsumedText}>
              <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>
                {roundedConsumed}
              </Text>
              <Text style={{ color: COLORS.textMuted }}> / {roundedTarget}g</Text>
            </Text>
            <Text style={[styles.macroStatusText, isGoalMet && { color: COLORS.accentGreen }]}>
              {isGoalMet ? '✓ Goal met' : `${remaining}g left`}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar
          value={roundedConsumed}
          max={roundedTarget}
          color={color}
          trackColor="#202026"
          height={7}
          style={styles.progressBar}
        />
      </View>
    );
  };

  const totalMacroCalories = Math.round(
    consumedProtein * 4 + consumedCarbs * 4 + consumedFat * 9
  );

  return (
    <Card style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>
        <Text style={styles.macroCalsSubtext}>
          {totalMacroCalories > 0 ? `${totalMacroCalories} kcal logged` : '0 kcal logged'}
        </Text>
      </View>

      <View style={styles.macroStack}>
        {renderMacroCard(
          'Protein',
          consumedProtein,
          targetProtein,
          COLORS.accentBlue,
          COLORS.accentBlueMuted
        )}
        {renderMacroCard(
          'Carbohydrates',
          consumedCarbs,
          targetCarbs,
          COLORS.accentAmber,
          COLORS.accentAmberMuted
        )}
        {renderMacroCard(
          'Fat',
          consumedFat,
          targetFat,
          COLORS.accentPurple,
          COLORS.accentPurpleMuted
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  macroCalsSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  macroStack: {
    gap: 12,
  },
  macroCard: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
  },
  macroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  macroValuesGroup: {
    alignItems: 'flex-end',
  },
  macroConsumedText: {
    fontSize: 13,
  },
  macroStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  progressBar: {
    marginTop: 2,
  },
});
