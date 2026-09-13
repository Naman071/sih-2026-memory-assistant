import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const RELATIONSHIPS = [
  { label: 'Son', key: 'setup.relSon', icon: 'person-outline' },
  { label: 'Daughter', key: 'setup.relDaughter', icon: 'person-outline' },
  { label: 'Spouse', key: 'setup.relSpouse', icon: 'heart-outline' },
  { label: 'Grandchild', key: 'setup.relGrandchild', icon: 'people-outline' },
  { label: 'Other', key: 'setup.relOther', icon: 'shield-outline' },
];

export default function SetupWizard({ onComplete }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const {
    patientName: initialPatientName,
    patientAge: initialPatientAge,
    patientPhone: initialPatientPhone,
    caregiverName: initialCaregiverName,
    caregiverPhone: initialCaregiverPhone,
    relationship: initialRelationship,
    isEditingSetup,
    closeSetupWizard,
    savePatientSetup,
  } = usePatient();

  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [relationship, setRelationship] = useState('Son');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName);
    if (initialCaregiverName) setCaregiverName(initialCaregiverName);
    if (initialCaregiverPhone) setCaregiverPhone(initialCaregiverPhone);
    if (initialPatientPhone) setPatientPhone(initialPatientPhone);
    if (initialPatientAge) setPatientAge(String(initialPatientAge));
    if (initialRelationship) setRelationship(initialRelationship);
  }, [initialPatientName, initialCaregiverName, initialCaregiverPhone, initialPatientPhone, initialPatientAge, initialRelationship]);

  const handleSave = async () => {
    if (!patientName.trim()) {
      setErrorMessage(t('setup.enterPatientNameError') || 'Please enter the patient’s name.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);

    try {
      await savePatientSetup({
        caregiverName: caregiverName.trim(),
        caregiverPhone: caregiverPhone.trim(),
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge.trim(),
        relationship,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.warn('Setup save error:', err);
      Alert.alert(
        t('setup.savedLocallyTitle') || 'Saved locally',
        t('setup.savedLocallyMsg') || 'Details saved on your device successfully.'
      );
      if (onComplete) onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRelObj = RELATIONSHIPS.find((r) => r.label === relationship) || RELATIONSHIPS[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
            <Ionicons name="medical-outline" size={40} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {isEditingSetup ? (t('setup.editTitle') || 'Edit Profile') : (t('setup.setupTitle') || 'Setup Profile')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {isEditingSetup
              ? (t('setup.editSubtitle') || 'Update caregiver and patient details below.')
              : (t('setup.setupSubtitle') || 'Enter patient and caregiver details to configure daily reminders and memory exercises.')}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Caregiver Section Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE' }]}>
              <Ionicons name="person-outline" size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('setup.caregiverSectionTitle') || 'Caregiver Details'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.subText }]}>
                {t('setup.caregiverSectionSubtitle') || 'Primary contact & manager'}
              </Text>
            </View>
          </View>

          {/* Caregiver Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('setup.caregiverNameLabel') || 'Caregiver Name'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder={t('setup.caregiverNamePlaceholder') || 'e.g. Rahul Sharma'}
              placeholderTextColor={theme.subText}
              value={caregiverName}
              onChangeText={(text) => {
                setCaregiverName(text);
                if (errorMessage) setErrorMessage('');
              }}
              accessibilityLabel="Caregiver Name input"
            />
          </View>

          {/* Caregiver Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('setup.caregiverPhoneLabel') || 'Caregiver Phone Number'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder={t('setup.caregiverPhonePlaceholder') || 'e.g. +91 98765 43210'}
              placeholderTextColor={theme.subText}
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              keyboardType="phone-pad"
              accessibilityLabel="Caregiver Phone Number input"
            />
          </View>
        </View>

        {/* Patient Section Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: isDarkMode ? '#065F46' : '#D1FAE5' }]}>
              <Ionicons name="heart-outline" size={18} color={isDarkMode ? '#34D399' : '#059669'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('setup.patientSectionTitle') || 'Patient Information'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.subText }]}>
                {t('setup.patientSectionSubtitle') || 'Person using the daily assistant'}
              </Text>
            </View>
          </View>

          {/* Patient Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('setup.patientNameLabel') || 'Patient Name'} <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                  borderColor: errorMessage ? '#EF4444' : theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder={t('setup.patientNamePlaceholder') || 'e.g. Chandni Devi'}
              placeholderTextColor={theme.subText}
              value={patientName}
              onChangeText={(text) => {
                setPatientName(text);
                if (errorMessage) setErrorMessage('');
              }}
              accessibilityLabel="Patient Name input"
            />
          </View>

          {/* Patient Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('setup.patientPhoneLabel') || 'Patient Phone Number'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder={t('setup.patientPhonePlaceholder') || 'e.g. +91 98765 12345'}
              placeholderTextColor={theme.subText}
              value={patientPhone}
              onChangeText={setPatientPhone}
              keyboardType="phone-pad"
              accessibilityLabel="Patient Phone Number input"
            />
          </View>

          {/* Age & Relationship side by side */}
          <View style={styles.rowFields}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('setup.patientAgeLabel') || 'Age'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                    borderColor: theme.cardBorder,
                    color: theme.text,
                  },
                ]}
                placeholder={t('setup.patientAgePlaceholder') || '72'}
                placeholderTextColor={theme.subText}
                value={patientAge}
                onChangeText={setPatientAge}
                keyboardType="numeric"
                maxLength={3}
                accessibilityLabel="Patient Age input"
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1.6 }]}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('setup.relToPatientLabel') || 'Relationship'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownTrigger,
                  {
                    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                    borderColor: theme.cardBorder,
                  },
                ]}
                onPress={() => setDropdownOpen(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Select Relationship"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={selectedRelObj.icon} size={18} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownValue, { color: theme.text }]} numberOfLines={1}>
                    {t(selectedRelObj.key) || selectedRelObj.label}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={theme.subText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#2563EB' }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.saveButtonText}>
                  {isEditingSetup
                    ? (t('setup.saveChanges') || 'Save Changes')
                    : (t('setup.saveProfile') || 'Save Profile')}
                </Text>
                <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {isEditingSetup && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={closeSetupWizard}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.subText }]}>
                {t('common.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Relationship Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>
              {t('setup.selectRelLabel') || 'Select Relationship'}
            </Text>

            {RELATIONSHIPS.map((item) => {
              const isSelected = item.label === relationship;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? '#1E3A8A'
                          : '#DBEAFE'
                        : 'transparent',
                      borderColor: isSelected ? '#2563EB' : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setRelationship(item.label);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isSelected ? '#2563EB' : theme.subText}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? '#2563EB' : theme.text,
                        fontWeight: isSelected ? 'bold' : '600',
                      },
                    ]}
                  >
                    {t(item.key) || item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={22} color={theme.primary} style={styles.optionCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 46,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 20,
  },
  dropdownTrigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 20,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 6,
    gap: 10,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOption: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 18,
    flex: 1,
  },
  optionCheck: {
    marginLeft: 8,
  },
});

