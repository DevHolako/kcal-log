import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from './Theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.cardElevated,
        variant === 'flat' && styles.cardFlat,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 14,
  },
  cardElevated: {
    backgroundColor: COLORS.cardElevated,
    borderColor: COLORS.cardBorder,
  },
  cardFlat: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 0,
  },
});
