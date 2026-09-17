import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';

export default function AIButton({
  onPress,
  variant = 'banner', // 'banner' | 'floating' | 'header' | 'chip'
  label = 'Ask Noklai AI',
  sublabel = 'Memory helper & routine companion',
  style,
}) {
  if (variant === 'header') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.headerButton, style]}
        activeOpacity={0.7}
        accessibilityLabel="Open AI Assistant"
      >
        <View style={styles.headerIconWrapper}>
          <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        </View>
        <View style={styles.sparkleDot} />
      </TouchableOpacity>
    );
  }

  if (variant === 'floating') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.floatingButton, noklaiTheme.shadows.floating, style]}
        activeOpacity={0.85}
        accessibilityLabel="Open AI Assistant"
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        <Text style={styles.floatingText}>AI Helper</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'chip') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.chipButton, style]}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={14} color="#5B409E" style={{ marginRight: 6 }} />
        <Text style={styles.chipText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // Default 'banner' style - prominent & inviting
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.bannerContainer, noklaiTheme.shadows.card, style]}
      activeOpacity={0.85}
    >
      <View style={styles.bannerIconCircle}>
        <Ionicons name="sparkles" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.bannerTextContainer}>
        <View style={styles.bannerTitleRow}>
          <Text style={styles.bannerTitle}>{label}</Text>
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>AI</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#5B409E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    borderWidth: 1.5,
    borderRadius: noklaiTheme.radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: noklaiTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: noklaiTheme.typography.sizes.base,
    fontWeight: noklaiTheme.typography.weights.bold,
    color: '#3B0764',
    marginRight: 8,
  },
  badgeNew: {
    backgroundColor: '#7E22CE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeNewText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontSize: noklaiTheme.typography.sizes.xs,
    color: '#6B21A8',
    marginTop: 2,
  },
  headerButton: {
    padding: 6,
    position: 'relative',
    marginRight: 6,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: noklaiTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: noklaiTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: noklaiTheme.radii.full,
    zIndex: 99,
  },
  floatingText: {
    color: '#FFFFFF',
    fontWeight: noklaiTheme.typography.weights.bold,
    fontSize: noklaiTheme.typography.sizes.sm,
    marginLeft: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: noklaiTheme.radii.full,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: noklaiTheme.typography.sizes.xs,
    fontWeight: noklaiTheme.typography.weights.semiBold,
    color: '#581C87',
  },
});

