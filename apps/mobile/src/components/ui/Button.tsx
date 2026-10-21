import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from './Theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'softGreen';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    };

    // Size
    if (size === 'sm') {
      base.paddingVertical = 6;
      base.paddingHorizontal = 12;
    } else if (size === 'lg') {
      base.paddingVertical = 14;
      base.paddingHorizontal = 24;
    } else {
      base.paddingVertical = 10;
      base.paddingHorizontal = 16;
    }

    // Variant
    if (variant === 'primary') {
      base.backgroundColor = COLORS.accentGreen;
    } else if (variant === 'softGreen') {
      base.backgroundColor = COLORS.accentGreenMuted;
      base.borderWidth = 1;
      base.borderColor = COLORS.accentGreenBorder;
    } else if (variant === 'secondary') {
      base.backgroundColor = '#202026';
      base.borderWidth = 1;
      base.borderColor = COLORS.cardBorder;
    } else if (variant === 'destructive') {
      base.backgroundColor = COLORS.accentRed;
    } else if (variant === 'outline') {
      base.backgroundColor = 'transparent';
      base.borderWidth = 1;
      base.borderColor = COLORS.cardBorder;
    } else if (variant === 'ghost') {
      base.backgroundColor = 'transparent';
    }

    if (disabled || loading) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
    };

    if (size === 'sm') {
      base.fontSize = 12;
    } else if (size === 'lg') {
      base.fontSize = 15;
      base.fontWeight = '700';
    } else {
      base.fontSize = 14;
    }

    if (variant === 'primary') {
      base.color = '#000000';
    } else if (variant === 'softGreen') {
      base.color = COLORS.accentGreen;
    } else if (variant === 'outline' || variant === 'ghost' || variant === 'secondary') {
      base.color = COLORS.textPrimary;
    } else if (variant === 'destructive') {
      base.color = '#ffffff';
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000000' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
