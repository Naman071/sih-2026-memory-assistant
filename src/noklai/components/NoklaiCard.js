import React from 'react';
import { View, StyleSheet } from 'react-native';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';

export default function NoklaiCard({ children, style, padded = true, elevated = true }) {
  const { isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.cardBackgroundDark
            : noklaiTheme.colors.cardBackground,
          borderColor: isDarkMode
            ? noklaiTheme.colors.borderDark
            : noklaiTheme.colors.border,
        },
        padded && styles.padded,
        elevated && !isDarkMode && noklaiTheme.shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: noklaiTheme.spacing.lg,
  },
});

