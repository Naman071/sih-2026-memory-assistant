import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';

export default function QuoteCard({
  quote = 'Small steps make a big difference.',
  author,
  style,
}) {
  const { isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#1B2420' : '#F2F8F3',
          borderColor: isDarkMode ? '#243A2E' : '#D1E7D7',
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="leaf" size={22} color="#16A34A" />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.quoteText,
            { color: isDarkMode ? '#A7F3D0' : '#14532D' },
          ]}
        >
          &ldquo;{quote}&rdquo;
        </Text>
        {author && (
          <Text
            style={[
              styles.authorText,
              { color: isDarkMode ? '#6EE7B7' : '#166534' },
            ]}
          >
            — {author}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    marginTop: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: noklaiTheme.typography.sizes.base,
    fontStyle: 'italic',
    fontWeight: noklaiTheme.typography.weights.medium,
    lineHeight: 20,
  },
  authorText: {
    fontSize: noklaiTheme.typography.sizes.xs,
    marginTop: 3,
    fontWeight: noklaiTheme.typography.weights.semiBold,
  },
});

