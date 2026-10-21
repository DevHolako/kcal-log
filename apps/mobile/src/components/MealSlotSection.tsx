import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import type { DiaryEntry, MealSlot } from '@kcal-log/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { COLORS } from './ui/Theme';

interface MealSlotSectionProps {
  slot: MealSlot;
  title: string;
  entries: DiaryEntry[];
  onAddFoodPress: (slot: MealSlot) => void;
  onQuickAdd: (slot: MealSlot, calories: number, name?: string) => Promise<void>;
  onDeleteEntry: (entryId: string | number) => Promise<void>;
}

export const MealSlotSection: React.FC<MealSlotSectionProps> = ({
  slot,
  title,
  entries,
  onAddFoodPress,
  onQuickAdd,
  onDeleteEntry,
}) => {
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  const [quickCalories, setQuickCalories] = useState('');
  const [quickName, setQuickName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotTotalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const handleQuickAddSubmit = async () => {
    const cals = parseFloat(quickCalories);
    if (isNaN(cals) || cals <= 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onQuickAdd(slot, cals, quickName.trim() || undefined);
      setQuickCalories('');
      setQuickName('');
      setQuickAddModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.slotTitle}>{title}</Text>
        <Text style={styles.slotCalories}>{Math.round(slotTotalCalories)} kcal</Text>
      </View>

      {/* Entries List */}
      {entries.length > 0 ? (
        <View style={styles.entriesList}>
          {entries.map(entry => {
            const foodName = entry.food?.name || entry.servingDescription || 'Food Item';
            return (
              <View style={styles.entryRow} key={String(entry.id)}>
                <View style={styles.entryDetails}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {foodName}
                  </Text>
                  <Text style={styles.portionText}>
                    {entry.quantity} {entry.servingDescription || 'serving'} •{' '}
                    P: {Math.round(entry.protein)}g C: {Math.round(entry.carbs)}g F: {Math.round(entry.fat)}g
                  </Text>
                </View>

                <View style={styles.entryRight}>
                  <Text style={styles.entryCalories}>{Math.round(entry.calories)} kcal</Text>
                  <TouchableOpacity
                    onPress={() => onDeleteEntry(entry.id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>No food logged for {title.toLowerCase()} yet.</Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          title="+ Add Food"
          variant="ghost"
          size="sm"
          onPress={() => onAddFoodPress(slot)}
          textStyle={{ color: COLORS.accentGreen }}
        />
        <Button
          title="⚡ Quick Add"
          variant="ghost"
          size="sm"
          onPress={() => setQuickAddModalVisible(true)}
          textStyle={{ color: COLORS.textSecondary }}
        />
      </View>

      {/* Quick Add Modal */}
      <Modal
        visible={quickAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Add to {title}</Text>

            <Input
              label="Calories (kcal)"
              placeholder="e.g. 250"
              keyboardType="numeric"
              value={quickCalories}
              onChangeText={setQuickCalories}
            />

            <Input
              label="Description (Optional)"
              placeholder="e.g. Afternoon snack"
              value={quickName}
              onChangeText={setQuickName}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setQuickAddModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add Calories"
                variant="primary"
                onPress={handleQuickAddSubmit}
                loading={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  slotCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentGreen,
  },
  entriesList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.cardBorder,
  },
  entryDetails: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  portionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
