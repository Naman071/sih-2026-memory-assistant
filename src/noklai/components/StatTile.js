import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';

export function StatSummaryRow({ gamesToday = 0, avgAccuracy = null, playTimeMinutes = 0 }) {
  const { isDarkMode } = useTheme();

  const formattedAccuracy =
    typeof avgAccuracy === 'number'
      ? `${Math.round(avgAccuracy)}%`
      : avgAccuracy || '--';

  return (
    <View
      style={[
        styles.summaryRow,
        {
          backgroundColor: isDarkMode ? '#242A38' : '#F4F5F0',
          borderColor: isDarkMode ? '#2E3647' : '#E8EAE1',
        },
      ]}
    >
      <View style={styles.summaryItem}>
        <Ionicons name="game-controller-outline" size={18} color="#5B409E" />
        <Text style={[styles.summaryNumber, { color: isDarkMode ? '#F3F4F6' : '#1E242B' }]}>
          {gamesToday || 0}
        </Text>
        <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
          Games{'\n'}(played today)
        </Text>
      </View>

      <View style={[styles.summaryDivider, { backgroundColor: isDarkMode ? '#3B4459' : '#DDE1D5' }]} />

      <View style={styles.summaryItem}>
        <Ionicons name="stats-chart-outline" size={18} color="#16A34A" />
        <Text style={[styles.summaryNumber, { color: isDarkMode ? '#F3F4F6' : '#1E242B' }]}>
          {formattedAccuracy}
        </Text>
        <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
          Average{'\n'}accuracy
        </Text>
      </View>

      <View style={[styles.summaryDivider, { backgroundColor: isDarkMode ? '#3B4459' : '#DDE1D5' }]} />

      <View style={styles.summaryItem}>
        <Ionicons name="time-outline" size={18} color="#D97706" />
        <Text style={[styles.summaryNumber, { color: isDarkMode ? '#F3F4F6' : '#1E242B' }]}>
          {playTimeMinutes || 0} min
        </Text>
        <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
          Total play{'\n'}time
        </Text>
      </View>
    </View>
  );
}

export function StatGrid({
  daysActive = 0,
  avgAccuracy = null,
  playTimeMinutes = 0,
  level = 'Beginner',
}) {
  const { isDarkMode } = useTheme();

  const formattedAccuracy =
    typeof avgAccuracy === 'number'
      ? `${Math.round(avgAccuracy)}%`
      : avgAccuracy || '--';

  const tiles = [
    {
      id: 'days',
      icon: 'calendar-outline',
      iconColor: '#EA580C',
      iconBg: '#FFEDD5',
      value: `${daysActive || 0}`,
      label: 'Days Active',
    },
    {
      id: 'accuracy',
      icon: 'trending-up-outline',
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
      value: formattedAccuracy,
      label: 'Avg. Accuracy',
    },
    {
      id: 'time',
      icon: 'time-outline',
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
      value: `${playTimeMinutes || 0} min`,
      label: 'Total Play Time',
    },
    {
      id: 'level',
      icon: 'bar-chart-outline',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      value: level || 'Beginner',
      label: 'Current Level',
    },
  ];

  return (
    <View style={styles.gridContainer}>
      {tiles.map((tile) => (
        <View
          key={tile.id}
          style={[
            styles.gridTile,
            {
              backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
              borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
            },
          ]}
        >
          <View
            style={[
              styles.gridIconCircle,
              { backgroundColor: isDarkMode ? '#2A3344' : tile.iconBg },
            ]}
          >
            <Ionicons name={tile.icon} size={20} color={tile.iconColor} />
          </View>
          <Text
            style={[
              styles.gridValue,
              { color: isDarkMode ? '#F3F4F6' : '#1E242B' },
            ]}
          >
            {tile.value}
          </Text>
          <Text
            style={[
              styles.gridLabel,
              { color: isDarkMode ? '#9CA3AF' : '#656F7D' },
            ]}
          >
            {tile.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    marginVertical: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  summaryNumber: {
    fontSize: noklaiTheme.typography.sizes.md,
    fontWeight: noklaiTheme.typography.weights.bold,
    marginTop: 4,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: noklaiTheme.typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 14,
  },
  summaryDivider: {
    width: 1,
    height: 38,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
  },
  gridTile: {
    width: '48%',
    padding: 14,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridValue: {
    fontSize: noklaiTheme.typography.sizes.lg,
    fontWeight: noklaiTheme.typography.weights.bold,
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: noklaiTheme.typography.sizes.xs,
    fontWeight: noklaiTheme.typography.weights.medium,
  },
});

export default { StatSummaryRow, StatGrid };
