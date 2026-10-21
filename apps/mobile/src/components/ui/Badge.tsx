import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from './Theme';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: COLORS.accentGreenMuted,
          borderColor: COLORS.accentGreenBorder,
        };
      case 'warning':
        return {
          backgroundColor: COLORS.accentAmberMuted,
          borderColor: COLORS.accentAmberBorder,
        };
      case 'destructive':
        return {
          backgroundColor: COLORS.accentRedMuted,
          borderColor: COLORS.accentRedBorder,
        };
      case 'info':
        return {
          backgroundColor: COLORS.accentBlueMuted,
          borderColor: COLORS.accentBlueBorder,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.cardBorder,
        };
      default:
        return {
          backgroundColor: '#242429',
          borderColor: COLORS.cardBorder,
        };
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
      case 'info':
        return { color: COLORS.accentBlue };
      default:
        return { color: COLORS.textSecondary };
    }
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        getContainerStyle(),
        isSmall && styles.badgeSm,
        style,
      ]}
    >
      <Text style={[styles.text, getTextStyle(), isSmall && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '600',
  },
});
