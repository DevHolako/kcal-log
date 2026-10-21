import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { Food, FoodServing, MealSlot } from '@kcal-log/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { COLORS } from './ui/Theme';
import { getTodayDateString } from '../context/DiaryContext';

interface ServingCalculatorModalProps {
  visible: boolean;
  food: Food | null;
  initialMealSlot?: MealSlot;
  targetDate?: string;
  onClose: () => void;
  onConfirm: (data: {
    date: string;
    mealSlot: MealSlot;
    foodId: string | number;
    foodServingId?: string | number | null;
    quantity: number;
    consumedGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    foodName: string;
    servingDescription: string;
  }) => Promise<void>;
}

export const ServingCalculatorModal: React.FC<ServingCalculatorModalProps> = ({
  visible,
  food,
  initialMealSlot = 'breakfast',
  targetDate,
  onClose,
  onConfirm,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(initialMealSlot);
  const [selectedServing, setSelectedServing] = useState<FoodServing | null>(null);
  const [isCustomGrams, setIsCustomGrams] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [customGrams, setCustomGrams] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMealSlot) {
      setSelectedSlot(initialMealSlot);
    }
  }, [initialMealSlot]);

  useEffect(() => {
    if (food) {
      if (food.servings && food.servings.length > 0) {
        setSelectedServing(food.servings[0]);
        setIsCustomGrams(false);
      } else {
        setSelectedServing(null);
        setIsCustomGrams(true);
      }
      setQuantity('1');
      setCustomGrams('100');
    }
  }, [food]);

  if (!food) return null;

  // Calculate consumed grams and scaled nutrients
  const qty = parseFloat(quantity) || 1;
  let consumedGrams = 100;
  let servingDescription = '100g';
  let servingId: string | number | null = null;

  if (isCustomGrams) {
    consumedGrams = parseFloat(customGrams) || 100;
    servingDescription = `${consumedGrams}g`;
  } else if (selectedServing) {
    consumedGrams = (selectedServing.grams || 100) * qty;
    servingDescription = `${qty}x ${selectedServing.description}`;
    servingId = selectedServing.id;
  }

  const factor = consumedGrams / 100;
  const scaledCalories = Math.round((food.caloriesPer100g || 0) * factor * 10) / 10;
  const scaledProtein = Math.round((food.proteinPer100g || 0) * factor * 10) / 10;
  const scaledCarbs = Math.round((food.carbsPer100g || 0) * factor * 10) / 10;
  const scaledFat = Math.round((food.fatPer100g || 0) * factor * 10) / 10;
  const scaledFiber = Math.round((food.fiberPer100g || 0) * factor * 10) / 10;

  const handleLog = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        date: targetDate || getTodayDateString(),
        mealSlot: selectedSlot,
        foodId: food.id,
        foodServingId: servingId,
        quantity: qty,
        consumedGrams,
        calories: scaledCalories,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        fiber: scaledFiber,
        foodName: food.name,
        servingDescription,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodTitle}>{food.name}</Text>
                {food.brand ? <Text style={styles.brandText}>{food.brand}</Text> : null}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Meal Slot Picker */}
            <Text style={styles.fieldLabel}>Meal Slot</Text>
            <View style={styles.slotRow}>
              {slots.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSelectedSlot(s)}
                  style={[styles.slotTab, selectedSlot === s && styles.slotTabActive]}
                >
                  <Text
                    style={[styles.slotTabText, selectedSlot === s && styles.slotTabTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Serving Size Options */}
            <Text style={styles.fieldLabel}>Serving Size</Text>
            <View style={styles.servingList}>
              {food.servings &&
                food.servings.map(s => (
                  <TouchableOpacity
                    key={String(s.id)}
                    onPress={() => {
                      setSelectedServing(s);
                      setIsCustomGrams(false);
                    }}
                    style={[
                      styles.servingOption,
                      !isCustomGrams && selectedServing?.id === s.id && styles.servingOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.servingOptionText,
                        !isCustomGrams && selectedServing?.id === s.id && styles.servingOptionTextActive,
                      ]}
                    >
                      {s.description} ({s.grams}g)
                    </Text>
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => {
                  setIsCustomGrams(true);
                  setSelectedServing(null);
                }}
                style={[styles.servingOption, isCustomGrams && styles.servingOptionActive]}
              >
                <Text
                  style={[styles.servingOptionText, isCustomGrams && styles.servingOptionTextActive]}
                >
                  Custom Grams (g)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quantity or Grams Input */}
            {isCustomGrams ? (
              <Input
                label="Weight in Grams"
                value={customGrams}
                onChangeText={setCustomGrams}
                keyboardType="numeric"
                placeholder="100"
              />
            ) : (
              <Input
                label="Number of Servings"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="1"
              />
            )}

            {/* Computed Nutrition Breakdown Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Nutritional Totals</Text>
              <View style={styles.nutritionRow}>
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutrientValue}>{scaledCalories}</Text>
                  <Text style={styles.nutrientLabel}>kcal</Text>
                </View>
                <View style={styles.nutrientBox}>
                  <Text style={[styles.nutrientValue, { color: COLORS.accentBlue }]}>
                    {scaledProtein}g
                  </Text>
                  <Text style={styles.nutrientLabel}>Protein</Text>
                </View>
                <View style={styles.nutrientBox}>
                  <Text style={[styles.nutrientValue, { color: COLORS.accentAmber }]}>
                    {scaledCarbs}g
                  </Text>
                  <Text style={styles.nutrientLabel}>Carbs</Text>
                </View>
                <View style={styles.nutrientBox}>
                  <Text style={[styles.nutrientValue, { color: COLORS.accentPurple }]}>
                    {scaledFat}g
                  </Text>
                  <Text style={styles.nutrientLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title={`Log ${scaledCalories} kcal to ${selectedSlot}`}
              variant="primary"
              size="lg"
              onPress={handleLog}
              loading={isSubmitting}
              style={{ marginTop: 12 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brandText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  slotTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
  },
  slotTabActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: COLORS.accentGreen,
  },
  slotTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  slotTabTextActive: {
    color: COLORS.accentGreen,
  },
  servingList: {
    gap: 8,
    marginBottom: 12,
  },
  servingOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  servingOptionActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  servingOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  servingOptionTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginVertical: 12,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientBox: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nutrientLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
