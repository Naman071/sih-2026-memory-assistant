import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';
import { useNoklai } from '../context/NoklaiContext';

export default function RoleSelectionScreen() {
  const { isDarkMode } = useTheme();
  const {
    selectRole,
    setCurrentStep,
    activePatientName,
    patientAvatar,
    caregiverName,
    caregiverAvatar,
  } = useNoklai();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.backgroundDark
            : noklaiTheme.colors.background,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top bar with back button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setCurrentStep('launch')}
            style={styles.backButton}
            accessibilityLabel="Back to launch screen"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Title and Subtitle */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Who are you?
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            Choose your profile to continue.
          </Text>
        </View>

        {/* Role Cards Container */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Patient */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => selectRole('patient')}
            style={[
              styles.roleCard,
              {
                backgroundColor: isDarkMode ? '#1E2430' : '#FFFFFF',
                borderColor: isDarkMode ? '#2C3647' : '#E5E7EB',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.avatarEmoji}>{patientAvatar}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.roleTitleRow}>
                <Text
                  style={[
                    styles.roleTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  {activePatientName || 'Patient'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isDarkMode ? '#9CA3AF' : '#656F7D'}
                />
              </View>
              <Text
                style={[
                  styles.roleSubtitle,
                  { color: isDarkMode ? '#9CA3AF' : '#656F7D' },
                ]}
              >
                Patient • Play, remember & enjoy
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Caregiver */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => selectRole('caregiver')}
            style={[
              styles.roleCard,
              {
                backgroundColor: isDarkMode ? '#1E2430' : '#FFFFFF',
                borderColor: isDarkMode ? '#2C3647' : '#E5E7EB',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.avatarEmoji}>{caregiverAvatar}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.roleTitleRow}>
                <Text
                  style={[
                    styles.roleTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  {caregiverName || 'Caregiver'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isDarkMode ? '#9CA3AF' : '#656F7D'}
                />
              </View>
              <Text
                style={[
                  styles.roleSubtitle,
                  { color: isDarkMode ? '#9CA3AF' : '#656F7D' },
                ]}
              >
                Caregiver • Monitor, support & assist
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color="#656F7D" style={{ marginRight: 6 }} />
          <Text style={[styles.footerText, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
            You can easily switch roles at any time in the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  topBar: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 18,
    marginBottom: 32,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1.5,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  roleSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

