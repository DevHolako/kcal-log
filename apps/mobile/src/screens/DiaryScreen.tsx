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
  onNavigateToSearch: (slot?: MealSlot, date?: string) => void;
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
    if (!diaryDay || !Array.isArray(diaryDay.entries)) return [];
    return diaryDay.entries.filter(e => e && e.mealSlot === slot);
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
            {/* Calorie Equation Dashboard Card */}
            <CalorieBudgetCard
              targetCalories={diaryDay.target?.calories ?? 2000}
              consumedCalories={diaryDay.totals?.calories ?? 0}
              exerciseCalories={diaryDay.exerciseCaloriesBurned ?? 0}
              remainingCalories={diaryDay.remaining?.calories ?? 2000}
            />

            {/* Macro Breakdown */}
            <MacroProgressSection
              consumedProtein={diaryDay.totals?.protein ?? 0}
              targetProtein={diaryDay.target?.protein ?? 150}
              consumedCarbs={diaryDay.totals?.carbs ?? 0}
              targetCarbs={diaryDay.target?.carbs ?? 200}
              consumedFat={diaryDay.totals?.fat ?? 0}
              targetFat={diaryDay.target?.fat ?? 65}
            />

            {/* Meal Slots */}
            <MealSlotSection
              slot="breakfast"
              title="Breakfast"
              entries={filterEntriesBySlot('breakfast')}
              onAddFoodPress={slot => onNavigateToSearch(slot, currentDate)}
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
              onAddFoodPress={slot => onNavigateToSearch(slot, currentDate)}
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
              onAddFoodPress={slot => onNavigateToSearch(slot, currentDate)}
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
              onAddFoodPress={slot => onNavigateToSearch(slot, currentDate)}
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
              totalWaterMl={diaryDay.waterTotalMl ?? 0}
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
