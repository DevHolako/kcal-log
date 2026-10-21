import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS } from '../components/ui/Theme';
import { useDiary } from '../context/DiaryContext';
import { kgToLbs, lbsToKg } from '@kcal-log/nutrition';

export const WeightLogScreen: React.FC = () => {
  const { diaryDay, logWeight } = useDiary();
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightValue, setWeightValue] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [chest, setChest] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async () => {
    const rawNum = parseFloat(weightValue);
    if (isNaN(rawNum) || rawNum <= 0) {
      return;
    }

    // Convert to kg if entered in lbs
    const weightKg = unit === 'lbs' ? lbsToKg(rawNum) : rawNum;

    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      await logWeight({
        weightKg: Math.round(weightKg * 100) / 100,
        waistCm: waist ? parseFloat(waist) : null,
        hipsCm: hips ? parseFloat(hips) : null,
        chestCm: chest ? parseFloat(chest) : null,
        notes: notes.trim() || null,
      });

      setSavedSuccess(true);
      setWeightValue('');
      setWaist('');
      setHips('');
      setChest('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeightLog = diaryDay?.weightLog;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Unit Selector */}
        <View style={styles.unitSelectorRow}>
          <Text style={styles.sectionHeader}>Morning Weigh-In</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              onPress={() => setUnit('kg')}
              style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
            >
              <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUnit('lbs')}
              style={[styles.unitBtn, unit === 'lbs' && styles.unitBtnActive]}
            >
              <Text style={[styles.unitBtnText, unit === 'lbs' && styles.unitBtnTextActive]}>
                lbs
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Log Card (if already recorded) */}
        {currentWeightLog ? (
          <Card style={styles.currentLogCard}>
            <View style={styles.currentLogRow}>
              <View>
                <Text style={styles.currentLogTitle}>Logged Today</Text>
                <Text style={styles.currentLogWeight}>
                  {unit === 'lbs'
                    ? `${kgToLbs(currentWeightLog.weightKg)} lbs`
                    : `${currentWeightLog.weightKg} kg`}
                </Text>
              </View>
              {currentWeightLog.trendWeightKg ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.trendLabel}>7-Day EWMA Trend</Text>
                  <Text style={styles.trendWeight}>
                    {unit === 'lbs'
                      ? `${kgToLbs(currentWeightLog.trendWeightKg)} lbs`
                      : `${currentWeightLog.trendWeightKg} kg`}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {/* Input Card */}
        <Card style={styles.formCard}>
          <Input
            label={`Weight (${unit})`}
            placeholder={unit === 'kg' ? 'e.g. 74.5' : 'e.g. 164.2'}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
          />

          <Text style={styles.subHeader}>Circumferences (cm, Optional)</Text>
          <View style={styles.circumferencesRow}>
            <Input
              label="Waist"
              placeholder="e.g. 82"
              value={waist}
              onChangeText={setWaist}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Hips"
              placeholder="e.g. 96"
              value={hips}
              onChangeText={setHips}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Chest"
              placeholder="e.g. 100"
              value={chest}
              onChangeText={setChest}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Fasted weigh-in after wake up"
            value={notes}
            onChangeText={setNotes}
          />

          {savedSuccess && (
            <Text style={styles.successText}>✓ Weigh-in recorded successfully!</Text>
          )}

          <Button
            title="Save Weigh-In"
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Educational Card on EWMA Smoothing */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About EWMA Trend Weight</Text>
          <Text style={styles.infoBody}>
            Daily scale weight fluctuates wildly due to hydration, sodium, and carb storage.
            kcal-log uses an Exponentially Weighted Moving Average (EWMA, α = 0.25) to filter out
            water noise and reveal your true fat loss or muscle gain trajectory.
          </Text>
        </Card>
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
  unitSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  unitBtnActive: {
    backgroundColor: COLORS.accentGreen,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unitBtnTextActive: {
    color: '#000000',
  },
  currentLogCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: COLORS.accentGreen,
    padding: 16,
    marginBottom: 16,
  },
  currentLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentLogTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  currentLogWeight: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.accentGreen,
    marginTop: 2,
  },
  trendLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  trendWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  formCard: {
    padding: 18,
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  circumferencesRow: {
    flexDirection: 'row',
  },
  successText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.inputBackground,
    padding: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  infoBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
