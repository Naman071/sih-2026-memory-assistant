import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';
import { useNoklai } from '../context/NoklaiContext';
import NoklaiButton from '../components/NoklaiButton';
import NoklaiCard from '../components/NoklaiCard';

export default function NoklaiLoginScreen() {
  const { isDarkMode } = useTheme();
  const {
    caregiverName: initialCaregiverName,
    caregiverPhone: initialCaregiverPhone,
    activePatientName: initialPatientName,
    patientPhone: initialPatientPhone,
    saveCredentials,
    setCurrentStep,
  } = useNoklai();

  const [caregiverName, setCaregiverName] = useState(initialCaregiverName || '');
  const [caregiverPhone, setCaregiverPhone] = useState(initialCaregiverPhone || '');
  const [patientName, setPatientName] = useState(initialPatientName || '');
  const [patientPhone, setPatientPhone] = useState(initialPatientPhone || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    if (!caregiverName.trim()) {
      setErrorMessage('Please enter the caregiver name.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage("Please enter the patient's name.");
      return;
    }

    setErrorMessage('');
    await saveCredentials({
      caregiverName: caregiverName.trim(),
      caregiverPhone: caregiverPhone.trim(),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
    });

    // Move directly to role selection - NO OTP
    setCurrentStep('role_select');
  };

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={26} color="#16A34A" />
            </View>
            <Text
              style={[
                styles.brandTitle,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Welcome to Noklai
            </Text>
            <Text
              style={[
                styles.brandSubtitle,
                { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
              ]}
            >
              Enter caregiver and patient details to personalize your memory care experience.
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Card 1: Caregiver Details */}
          <NoklaiCard style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="person" size={20} color="#5B409E" />
              </View>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  Caregiver Details
                </Text>
                <Text style={styles.sectionSub}>Person providing support and monitoring</Text>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: isDarkMode ? '#9CA3AF' : '#475569' }]}>
              Caregiver Name *
            </Text>
            <TextInput
              placeholder="e.g. Sara Sharma"
              placeholderTextColor="#9CA3AF"
              value={caregiverName}
              onChangeText={(text) => {
                setCaregiverName(text);
                if (errorMessage) setErrorMessage('');
              }}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                  color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  borderColor: isDarkMode ? '#3B4559' : '#E2E8F0',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? '#9CA3AF' : '#475569' }]}>
              Caregiver Mobile Number
            </Text>
            <TextInput
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                  color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  borderColor: isDarkMode ? '#3B4559' : '#E2E8F0',
                },
              ]}
            />
          </NoklaiCard>

          {/* Card 2: Patient Details */}
          <NoklaiCard style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={{ fontSize: 20 }}>👵</Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  Patient Details
                </Text>
                <Text style={styles.sectionSub}>Elder loved one playing memory games</Text>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: isDarkMode ? '#9CA3AF' : '#475569' }]}>
              Patient Name *
            </Text>
            <TextInput
              placeholder="e.g. Chandni Devi (Aaji)"
              placeholderTextColor="#9CA3AF"
              value={patientName}
              onChangeText={(text) => {
                setPatientName(text);
                if (errorMessage) setErrorMessage('');
              }}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                  color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  borderColor: isDarkMode ? '#3B4559' : '#E2E8F0',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? '#9CA3AF' : '#475569' }]}>
              Patient Mobile Number
            </Text>
            <TextInput
              placeholder="e.g. +91 98765 43211"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={patientPhone}
              onChangeText={setPatientPhone}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                  color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  borderColor: isDarkMode ? '#3B4559' : '#E2E8F0',
                },
              ]}
            />
          </NoklaiCard>

          {/* Submit Action */}
          <View style={styles.actionContainer}>
            <NoklaiButton
              title="Save & Continue"
              variant="primary"
              size="lg"
              iconRight="arrow-forward"
              onPress={handleContinue}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: noklaiTheme.radii.lg,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    color: '#656F7D',
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  textInput: {
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 12,
  },
  actionContainer: {
    marginTop: 10,
  },
});

