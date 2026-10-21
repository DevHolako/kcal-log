import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from './Theme';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: COLORS.accentGreen };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: COLORS.accentAmber };
      case 'destructive':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: COLORS.accentRed };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: COLORS.cardBorder };
      default:
        return { backgroundColor: COLORS.cardBorder, borderColor: COLORS.cardBorder };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'success':
        return { color: COLORS.accentGreen };
      case 'warning':
        return { color: COLORS.accentAmber };
      case 'destructive':
        return { color: COLORS.accentRed };
      default:
        return { color: COLORS.textSecondary };
    }
  };

  return (
    <View style={[styles.badge, getContainerStyle(), style]}>
      <Text style={[styles.text, getTextStyle()]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
