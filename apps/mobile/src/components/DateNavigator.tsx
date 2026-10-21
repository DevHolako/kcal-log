import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './ui/Theme';
import { getTodayDateString, shiftDateString } from '../context/DiaryContext';

interface DateNavigatorProps {
  currentDate: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  onPrevious,
  onNext,
  onToday,
}) => {
  const today = getTodayDateString();
  const yesterday = shiftDateString(today, -1);
  const tomorrow = shiftDateString(today, 1);
  const isToday = currentDate === today;

  const getPrimaryLabel = (): string => {
    if (currentDate === today) return 'Today';
    if (currentDate === yesterday) return 'Yesterday';
    if (currentDate === tomorrow) return 'Tomorrow';
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSecondaryLabel = (): string => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Previous Day Chevron Button */}
      <TouchableOpacity
        onPress={onPrevious}
        style={styles.chevronButton}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>

      {/* Date Header / Jump to Today */}
      <TouchableOpacity
        onPress={onToday}
        activeOpacity={0.7}
        style={styles.dateLabelContainer}
      >
        <Text style={styles.primaryDateText}>{getPrimaryLabel()}</Text>
        <Text style={styles.secondaryDateText}>
          {isToday ? getSecondaryLabel() : 'Tap to return to Today'}
        </Text>
      </TouchableOpacity>

      {/* Next Day Chevron Button */}
      <TouchableOpacity
        onPress={onNext}
        style={styles.chevronButton}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  chevronButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e1e24',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: '700',
    lineHeight: 24,
  },
  dateLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryDateText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  secondaryDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
