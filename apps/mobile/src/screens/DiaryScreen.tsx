import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDiary } from '../context/DiaryContext';
import { DateNavigator } from '../components/DateNavigator';
import { CalorieBudgetCard } from '../components/CalorieBudgetCard';
import { MacroProgressSection } from '../components/MacroProgressSection';
import { MealSlotSection } from '../components/MealSlotSection';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { OfflineBanner } from '../components/OfflineBanner';
import { COLORS } from '../components/ui/Theme';
import type { MealSlot } from '@kcal-log/types';

interface DiaryScreenProps {
  onNavigateToSearch: (slot?: MealSlot) => void;
}

export const DiaryScreen: React.FC<DiaryScreenProps> = ({ onNavigateToSearch }) => {
  const {
    currentDate,
    diaryDay,
    isLoading,
    isOffline,
    pendingMutationsCount,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    refreshDiary,
    deleteFoodEntry,
    quickAddCalories,
    logWater,
    syncOfflineQueue,
  } = useDiary();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDiary();
    setRefreshing(false);
  };

  const filterEntriesBySlot = (slot: MealSlot) => {
    if (!diaryDay) return [];
    return diaryDay.entries.filter(e => e.mealSlot === slot);
  };

  return (
    <View style={styles.container}>
      <OfflineBanner
        isOffline={isOffline}
        pendingCount={pendingMutationsCount}
        onSync={syncOfflineQueue}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accentGreen}
          />
        }
      >
        <DateNavigator
          currentDate={currentDate}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
          onToday={goToToday}
        />

        {isLoading && !diaryDay ? (
          <ActivityIndicator
            size="large"
            color={COLORS.accentGreen}
            style={{ marginVertical: 40 }}
          />
        ) : diaryDay ? (
          <>
            {/* Calorie Equation Card: Goal - Food + Exercise = Remaining */}
            <CalorieBudgetCard
              targetCalories={diaryDay.target.calories}
              consumedCalories={diaryDay.totals.calories}
              exerciseCalories={diaryDay.exerciseCaloriesBurned}
              remainingCalories={diaryDay.remaining.calories}
            />

            {/* Macro Breakdown */}
            <MacroProgressSection
              consumedProtein={diaryDay.totals.protein}
              targetProtein={diaryDay.target.protein}
              consumedCarbs={diaryDay.totals.carbs}
              targetCarbs={diaryDay.target.carbs}
              consumedFat={diaryDay.totals.fat}
              targetFat={diaryDay.target.fat}
            />

            {/* Meal Slots */}
            <MealSlotSection
              slot="breakfast"
              title="Breakfast"
              entries={filterEntriesBySlot('breakfast')}
              onAddFoodPress={slot => onNavigateToSearch(slot)}
              onQuickAdd={async (slot, cals, name) => {
                await quickAddCalories({
                  date: currentDate,
                  mealSlot: slot,
                  calories: cals,
                  name,
                });
              }}
              onDeleteEntry={deleteFoodEntry}
            />

            <MealSlotSection
              slot="lunch"
              title="Lunch"
              entries={filterEntriesBySlot('lunch')}
              onAddFoodPress={slot => onNavigateToSearch(slot)}
              onQuickAdd={async (slot, cals, name) => {
                await quickAddCalories({
                  date: currentDate,
                  mealSlot: slot,
                  calories: cals,
                  name,
                });
              }}
              onDeleteEntry={deleteFoodEntry}
            />

            <MealSlotSection
              slot="dinner"
              title="Dinner"
              entries={filterEntriesBySlot('dinner')}
              onAddFoodPress={slot => onNavigateToSearch(slot)}
              onQuickAdd={async (slot, cals, name) => {
                await quickAddCalories({
                  date: currentDate,
                  mealSlot: slot,
                  calories: cals,
                  name,
                });
              }}
              onDeleteEntry={deleteFoodEntry}
            />

            <MealSlotSection
              slot="snack"
              title="Snacks"
              entries={filterEntriesBySlot('snack')}
              onAddFoodPress={slot => onNavigateToSearch(slot)}
              onQuickAdd={async (slot, cals, name) => {
                await quickAddCalories({
                  date: currentDate,
                  mealSlot: slot,
                  calories: cals,
                  name,
                });
              }}
              onDeleteEntry={deleteFoodEntry}
            />

            {/* Water Tracker */}
            <WaterTrackerCard
              totalWaterMl={diaryDay.waterTotalMl}
              targetWaterMl={diaryDay.waterTargetMl ?? 2000}
              onAddWater={logWater}
            />
          </>
        ) : null}
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
});
