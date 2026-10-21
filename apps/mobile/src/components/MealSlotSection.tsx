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

const SLOT_ICONS: Record<MealSlot, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍲',
  snack: '🍎',
};

export const MealSlotSection: React.FC<MealSlotSectionProps> = ({
  slot,
  title,
  entries = [],
  onAddFoodPress,
  onQuickAdd,
  onDeleteEntry,
}) => {
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  const [quickCalories, setQuickCalories] = useState('');
  const [quickName, setQuickName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeEntries = Array.isArray(entries) ? entries : [];
  const slotTotalCalories = safeEntries.reduce((sum, e) => sum + (Number(e?.calories) || 0), 0);
  const slotIcon = SLOT_ICONS[slot] || '🍽️';

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
      {/* Header Row: Title, Calories, and Quick + Add button */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.slotIcon}>{slotIcon}</Text>
          <View>
            <Text style={styles.slotTitle}>{title}</Text>
            <Text style={styles.slotCalories}>
              {Math.round(slotTotalCalories)} kcal
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onAddFoodPress(slot)}
          style={styles.headerAddButton}
          activeOpacity={0.7}
        >
          <Text style={styles.headerAddText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>

      {/* Entries List or Interactive Empty State */}
      {safeEntries.length > 0 ? (
        <View style={styles.entriesList}>
          {safeEntries.map((entry, index) => {
            if (!entry) return null;
            const foodName = entry.food?.name || entry.servingDescription || 'Food Item';
            const portionText = entry.servingDescription || `${entry.quantity || 1} serving`;
            const protein = Math.round(Number(entry.protein) || 0);
            const carbs = Math.round(Number(entry.carbs) || 0);
            const fat = Math.round(Number(entry.fat) || 0);
            const calories = Math.round(Number(entry.calories) || 0);

            return (
              <View
                style={[
                  styles.entryRow,
                  index === safeEntries.length - 1 && { borderBottomWidth: 0 },
                ]}
                key={String(entry.id || `${slot}-${index}`)}
              >
                <View style={styles.entryDetails}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {foodName}
                  </Text>
                  <Text style={styles.portionText} numberOfLines={1}>
                    {portionText}
                  </Text>

                  {/* Micro Macro Badges */}
                  <View style={styles.macroPillsRow}>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillText, { color: COLORS.accentBlue }]}>
                        P: {protein}g
                      </Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillText, { color: COLORS.accentAmber }]}>
                        C: {carbs}g
                      </Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillText, { color: COLORS.accentPurple }]}>
                        F: {fat}g
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.entryRight}>
                  <Text style={styles.entryCalories}>{calories} kcal</Text>
                  <TouchableOpacity
                    onPress={() => onDeleteEntry(entry.id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Quick Add Secondary Link */}
          <View style={styles.quickAddFooterRow}>
            <TouchableOpacity
              onPress={() => setQuickAddModalVisible(true)}
              style={styles.quickAddFooterButton}
              activeOpacity={0.7}
            >
              <Text style={styles.quickAddFooterText}>⚡ Quick Add Calories</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <TouchableOpacity
            onPress={() => onAddFoodPress(slot)}
            style={styles.emptySlotButton}
            activeOpacity={0.7}
          >
            <Text style={styles.emptySlotTitle}>+ Log {title}</Text>
            <Text style={styles.emptySlotSub}>
              Search database, scan barcode, or quick add
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setQuickAddModalVisible(true)}
            style={styles.emptyQuickAddLink}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyQuickAddText}>⚡ Quick Add Calories</Text>
          </TouchableOpacity>
        </View>
      )}

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
              placeholder="e.g. Snack, coffee, etc."
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  slotCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentGreen,
    marginTop: 2,
  },
  headerAddButton: {
    backgroundColor: COLORS.accentGreenMuted,
    borderWidth: 1,
    borderColor: COLORS.accentGreenBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerAddText: {
    color: COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    marginTop: 12,
  },
  emptySlotButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptySlotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySlotSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  emptyQuickAddLink: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  emptyQuickAddText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  entriesList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 4,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.cardBorder,
  },
  entryDetails: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  portionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
  },
  macroPill: {
    backgroundColor: '#1b1b22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#202026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  quickAddFooterRow: {
    paddingTop: 8,
    alignItems: 'center',
  },
  quickAddFooterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickAddFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
