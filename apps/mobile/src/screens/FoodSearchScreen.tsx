import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { Food, MealSlot } from '@kcal-log/types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { COLORS } from '../components/ui/Theme';
import { api } from '../services/api';
import { useDiary } from '../context/DiaryContext';
import { ServingCalculatorModal } from '../components/ServingCalculatorModal';

interface FoodSearchScreenProps {
  initialSlot?: MealSlot;
  targetDate?: string;
  onOpenBarcodeScanner: () => void;
  onLogComplete?: () => void;
}

export const FoodSearchScreen: React.FC<FoodSearchScreenProps> = ({
  initialSlot = 'breakfast',
  targetDate,
  onOpenBarcodeScanner,
  onLogComplete,
}) => {
  const { addFoodEntry } = useDiary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  useEffect(() => {
    // Load cached/recent foods on mount
    const loadInitial = async () => {
      try {
        const cached = await api.getCachedRecentFoods('');
        setResults(cached);
      } catch {
        // Ignored
      }
    };
    loadInitial();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const foods = await api.searchFoods(query.trim());
      setResults(foods);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setCalculatorVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header Search & Barcode Button */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <Input
            placeholder="Search foods (e.g. Oatmeal, Banana)..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <Button
            title="Search"
            size="md"
            onPress={handleSearch}
            loading={isLoading}
            style={styles.searchButton}
          />
        </View>

        <Button
          title="📷 Scan Barcode"
          variant="secondary"
          size="md"
          onPress={onOpenBarcodeScanner}
          style={styles.barcodeButton}
          textStyle={{ color: COLORS.accentGreen, fontWeight: '700' }}
        />
      </View>

      {/* Results List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.accentGreen} style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => String(item.id || `${item.name}-${idx}`)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const calories = Math.round(Number(item.caloriesPer100g) || 0);
            const protein = Math.round(Number(item.proteinPer100g) || 0);
            const carbs = Math.round(Number(item.carbsPer100g) || 0);
            const fat = Math.round(Number(item.fatPer100g) || 0);

            return (
              <TouchableOpacity onPress={() => handleFoodSelect(item)} activeOpacity={0.7}>
                <Card style={styles.foodCard}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    {item.brand ? <Text style={styles.foodBrand}>{item.brand}</Text> : null}

                    {/* Micro Macro Badges */}
                    <View style={styles.macroPillsRow}>
                      <View style={styles.caloriesPill}>
                        <Text style={styles.caloriesText}>{calories} kcal / 100g</Text>
                      </View>
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

                  {item.isCustom ? (
                    <Badge label="Custom" variant="outline" size="sm" />
                  ) : item.barcode ? (
                    <Badge label="Verified" variant="success" size="sm" />
                  ) : null}
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No foods found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching for common foods, or scan a package barcode using the button above.
          </Text>
        </View>
      )}

      {/* Portion Calculator Modal */}
      <ServingCalculatorModal
        visible={calculatorVisible}
        food={selectedFood}
        initialMealSlot={initialSlot}
        targetDate={targetDate}
        onClose={() => setCalculatorVisible(false)}
        onConfirm={async payload => {
          await addFoodEntry(payload);
          if (onLogComplete) onLogComplete();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchButton: {
    marginLeft: 8,
    height: 48,
    paddingHorizontal: 18,
  },
  barcodeButton: {
    width: '100%',
    backgroundColor: '#181820',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  listContent: {
    padding: 16,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
    marginRight: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  foodBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  caloriesPill: {
    backgroundColor: '#1f242e',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  caloriesText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
