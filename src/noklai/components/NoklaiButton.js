import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';

export default function NoklaiButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'patient' | 'outline' | 'subtle' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon,
  iconRight,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const getBackgroundColor = () => {
    if (disabled) return '#CBD5E1';
    switch (variant) {
      case 'primary':
        return noklaiTheme.colors.primary;
      case 'patient':
        return noklaiTheme.colors.patientGreen;
      case 'outline':
        return 'transparent';
      case 'subtle':
        return noklaiTheme.colors.primarySoft;
      case 'danger':
        return '#EF4444';
      default:
        return noklaiTheme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#64748B';
    switch (variant) {
      case 'outline':
        return noklaiTheme.colors.primary;
      case 'subtle':
        return noklaiTheme.colors.primary;
      case 'danger':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? '#CBD5E1' : noklaiTheme.colors.primary;
    }
    return 'transparent';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[`size_${size}`],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        variant === 'primary' && !disabled && noklaiTheme.shadows.button,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
              color={getTextColor()}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.text,
              styles[`textSize_${size}`],
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
              color={getTextColor()}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: noklaiTheme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: noklaiTheme.typography.weights.semiBold,
    letterSpacing: 0.2,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  size_lg: {
    paddingVertical: 17,
    paddingHorizontal: 28,
  },
  textSize_sm: {
    fontSize: noklaiTheme.typography.sizes.sm,
  },
  textSize_md: {
    fontSize: noklaiTheme.typography.sizes.base,
  },
  textSize_lg: {
    fontSize: noklaiTheme.typography.sizes.md,
    fontWeight: noklaiTheme.typography.weights.bold,
  },
});

