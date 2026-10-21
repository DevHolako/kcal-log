import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './ui/Theme';
import { getTodayDateString } from '../context/DiaryContext';

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
  const isToday = currentDate === today;

  const formatDateDisplay = (dateStr: string): string => {
    if (dateStr === today) return 'Today';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevious} style={styles.chevronButton} activeOpacity={0.6}>
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onToday} activeOpacity={0.7} style={styles.dateLabelContainer}>
        <Text style={styles.dateText}>{formatDateDisplay(currentDate)}</Text>
        {!isToday && <Text style={styles.subText}>(Tap for Today)</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} style={styles.chevronButton} activeOpacity={0.6}>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chevronButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chevronText: {
    fontSize: 24,
    color: COLORS.accentGreen,
    fontWeight: 'bold',
  },
  dateLabelContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 11,
    color: COLORS.accentGreen,
    marginTop: 2,
  },
});
