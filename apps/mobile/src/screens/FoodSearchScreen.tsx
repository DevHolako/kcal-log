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
  onOpenBarcodeScanner: () => void;
  onLogComplete?: () => void;
}

export const FoodSearchScreen: React.FC<FoodSearchScreenProps> = ({
  initialSlot = 'breakfast',
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
        const cached = await api.searchFoods('');
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
            size="sm"
            onPress={handleSearch}
            loading={isLoading}
            style={styles.searchButton}
          />
        </View>

        <Button
          title="Scan Barcode"
          variant="secondary"
          size="md"
          onPress={onOpenBarcodeScanner}
          style={styles.barcodeButton}
          textStyle={{ color: COLORS.accentGreen }}
        />
      </View>

      {/* Results List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.accentGreen} style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleFoodSelect(item)} activeOpacity={0.7}>
              <Card style={styles.foodCard}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  {item.brand ? <Text style={styles.foodBrand}>{item.brand}</Text> : null}
                  <Text style={styles.macrosText}>
                    {Math.round(item.caloriesPer100g)} kcal • P: {Math.round(item.proteinPer100g)}g • C:{' '}
                    {Math.round(item.carbsPer100g)}g • F: {Math.round(item.fatPer100g)}g (per 100g)
                  </Text>
                </View>

                {item.isCustom ? (
                  <Badge label="Custom" variant="outline" />
                ) : item.barcode ? (
                  <Badge label="OFF" variant="success" />
                ) : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No foods found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching for common foods or scan a package barcode.
          </Text>
        </View>
      )}

      {/* Portion Calculator Modal */}
      <ServingCalculatorModal
        visible={calculatorVisible}
        food={selectedFood}
        initialMealSlot={initialSlot}
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
    height: 42,
  },
  barcodeButton: {
    width: '100%',
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
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  foodBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  macrosText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
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
