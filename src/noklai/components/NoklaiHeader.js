import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';
import { useNoklai } from '../context/NoklaiContext';
import AIButton from './AIButton';

export default function NoklaiHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showRoleBadge = true,
  showAI = true,
  rightAction,
}) {
  const { isDarkMode } = useTheme();
  const { role, setRole, setAiModalVisible } = useNoklai();

  const isCaregiver = role === 'caregiver';

  const toggleRole = () => {
    setRole(isCaregiver ? 'patient' : 'caregiver');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.cardBackgroundDark
            : noklaiTheme.colors.cardBackground,
          borderBottomColor: isDarkMode
            ? noklaiTheme.colors.borderDark
            : noklaiTheme.colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={16} color="#16A34A" />
            </View>
            <Text
              style={[
                styles.brandText,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Noklai
            </Text>
          </View>
        )}

        {title && (
          <View style={styles.titleWrapper}>
            <Text
              style={[
                styles.titleText,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitleText,
                  { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {showAI && (
          <AIButton
            variant="header"
            onPress={() => setAiModalVisible(true)}
          />
        )}

        {showRoleBadge && (
          <TouchableOpacity
            onPress={toggleRole}
            style={[
              styles.roleBadge,
              {
                backgroundColor: isCaregiver
                  ? noklaiTheme.colors.primarySoft
                  : noklaiTheme.colors.patientGreenLight,
                borderColor: isCaregiver
                  ? '#D8B4FE'
                  : '#BBF7D0',
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel={`Switch role from ${role}`}
          >
            <Ionicons
              name={isCaregiver ? 'heart-outline' : 'person-outline'}
              size={12}
              color={isCaregiver ? noklaiTheme.colors.primary : noklaiTheme.colors.patientGreen}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.roleBadgeText,
                {
                  color: isCaregiver
                    ? noklaiTheme.colors.primary
                    : noklaiTheme.colors.patientGreen,
                },
              ]}
            >
              {isCaregiver ? 'Caregiver' : 'Patient'}
            </Text>
            <Ionicons
              name="swap-horizontal"
              size={11}
              color={isCaregiver ? noklaiTheme.colors.primary : noklaiTheme.colors.patientGreen}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        )}

        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 163, 74, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 6,
  },
  titleText: {
    fontSize: noklaiTheme.typography.sizes.md,
    fontWeight: noklaiTheme.typography.weights.bold,
  },
  subtitleText: {
    fontSize: noklaiTheme.typography.sizes.xs,
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: noklaiTheme.radii.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: noklaiTheme.typography.weights.bold,
    textTransform: 'capitalize',
  },
});

