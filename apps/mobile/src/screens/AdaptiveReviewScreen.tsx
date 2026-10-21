import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { COLORS } from '../components/ui/Theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AdaptiveAdjustment } from '@kcal-log/types';

export const AdaptiveReviewScreen: React.FC = () => {
  const { activeTarget, refreshProfile } = useAuth();
  const [adjustment, setAdjustment] = useState<AdaptiveAdjustment | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const [recommendationText, setRecommendationText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAdjustment = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await api.getCurrentAdaptiveAdjustment();
      setAdjustment(res.adjustment);
      setHasPending(res.hasPending);
      setRecommendationText(res.recommendationText ?? null);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustment();
  }, []);

  const handleAccept = async () => {
    if (!adjustment) return;
    setIsProcessing(true);
    try {
      await api.acceptAdaptiveAdjustment(adjustment.id);
      setActionMessage('✓ Adjustment accepted! New nutritional targets activated.');
      setHasPending(false);
      await refreshProfile();
      await loadAdjustment();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept adjustment.';
      setActionMessage(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adjustment) return;
    setIsProcessing(true);
    try {
      await api.rejectAdaptiveAdjustment(adjustment.id);
      setActionMessage('Adjustment postponed. Current targets maintained.');
      setHasPending(false);
      await loadAdjustment();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject adjustment.';
      setActionMessage(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Adaptive Strategy</Text>
        <Text style={styles.headerSubtitle}>
          Weekly metabolic feedback based on smoothed EWMA bodyweight vs actual logged calories.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.accentGreen} style={{ marginVertical: 40 }} />
        ) : hasPending && adjustment ? (
          <>
            {/* Pending Brief Card */}
            <Card style={styles.briefCard}>
              <View style={styles.briefHeader}>
                <Text style={styles.briefTitle}>Weekly Checkpoint Brief</Text>
                <Badge label="Decision Required" variant="warning" />
              </View>

              <Text style={styles.briefReason}>{adjustment.reason}</Text>

              {/* Metabolic Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>
                    {Math.round(adjustment.averageDailyIntakeKcal)} kcal
                  </Text>
                  <Text style={styles.metricLabel}>7-Day Avg Intake</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricVal,
                      adjustment.smoothedWeightChangeKg < 0
                        ? { color: COLORS.accentGreen }
                        : { color: COLORS.accentAmber },
                    ]}
                  >
                    {adjustment.smoothedWeightChangeKg > 0 ? '+' : ''}
                    {adjustment.smoothedWeightChangeKg} kg
                  </Text>
                  <Text style={styles.metricLabel}>14-Day EWMA Rate</Text>
                </View>
              </View>

              {/* Target Comparison */}
              <View style={styles.comparisonTable}>
                <Text style={styles.tableHeader}>Proposed Plan Adjustment</Text>

                <View style={styles.comparisonRow}>
                  <Text style={styles.compLabel}>Daily Calories</Text>
                  <Text style={styles.compOld}>{activeTarget?.targetCalories ?? 2000} kcal</Text>
                  <Text style={styles.arrowText}>→</Text>
                  <Text style={styles.compNew}>
                    {(activeTarget?.targetCalories ?? 2000) + adjustment.proposedCalorieDelta} kcal (
                    {adjustment.proposedCalorieDelta > 0 ? '+' : ''}
                    {adjustment.proposedCalorieDelta})
                  </Text>
                </View>

                <View style={styles.comparisonRow}>
                  <Text style={styles.compLabel}>Protein</Text>
                  <Text style={styles.compOld}>{activeTarget?.targetProteinG ?? 150}g</Text>
                  <Text style={styles.arrowText}>→</Text>
                  <Text style={styles.compNew}>{adjustment.proposedProteinG}g</Text>
                </View>

                <View style={styles.comparisonRow}>
                  <Text style={styles.compLabel}>Carbohydrates</Text>
                  <Text style={styles.compOld}>{activeTarget?.targetCarbsG ?? 200}g</Text>
                  <Text style={styles.arrowText}>→</Text>
                  <Text style={styles.compNew}>{adjustment.proposedCarbsG}g</Text>
                </View>

                <View style={styles.comparisonRow}>
                  <Text style={styles.compLabel}>Fat</Text>
                  <Text style={styles.compOld}>{activeTarget?.targetFatG ?? 65}g</Text>
                  <Text style={styles.arrowText}>→</Text>
                  <Text style={styles.compNew}>{adjustment.proposedFatG}g</Text>
                </View>
              </View>

              {actionMessage && (
                <Text style={styles.actionText}>{actionMessage}</Text>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <Button
                  title="Decline"
                  variant="outline"
                  onPress={handleReject}
                  disabled={isProcessing}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Accept Adjustment"
                  variant="primary"
                  onPress={handleAccept}
                  loading={isProcessing}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </>
        ) : (
          /* Active Target Baseline Card */
          <Card style={styles.steadyCard}>
            <View style={styles.steadyHeader}>
              <Text style={styles.steadyTitle}>Targets On Track</Text>
              <Badge label="Active Profile" variant="success" />
            </View>
            <Text style={styles.steadyText}>
              {recommendationText ||
                'No adjustment pending. Your metabolism and caloric adherence are aligned with your goal rate.'}
            </Text>

            {activeTarget ? (
              <View style={styles.activeTargetSummary}>
                <Text style={styles.targetHeading}>Current Daily Targets:</Text>
                <Text style={styles.targetLine}>• Calories: {activeTarget.targetCalories} kcal</Text>
                <Text style={styles.targetLine}>• Protein: {activeTarget.targetProteinG}g</Text>
                <Text style={styles.targetLine}>• Carbs: {activeTarget.targetCarbsG}g</Text>
                <Text style={styles.targetLine}>• Fat: {activeTarget.targetFatG}g</Text>
              </View>
            ) : null}

            <Button
              title="Refresh Strategy Status"
              variant="secondary"
              size="sm"
              onPress={loadAdjustment}
              style={{ marginTop: 14 }}
            />
          </Card>
        )}
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
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  briefCard: {
    borderColor: COLORS.accentAmber,
    padding: 18,
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  briefTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  briefReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  comparisonTable: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.cardBorder,
  },
  compLabel: {
    flex: 1.2,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  compOld: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  arrowText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  compNew: {
    flex: 1.5,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textAlign: 'right',
  },
  actionText: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
  },
  steadyCard: {
    padding: 18,
  },
  steadyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  steadyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  steadyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  activeTargetSummary: {
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 8,
    marginTop: 14,
  },
  targetHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  targetLine: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});
