import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import QuoteCard from '../../components/QuoteCard';
import NoklaiButton from '../../components/NoklaiButton';
import NoklaiHeader from '../../components/NoklaiHeader';

export default function LinkedPatientsScreen({ onBack, onSelectPatient }) {
  const { isDarkMode } = useTheme();
  const { patients, activePatientId, setActivePatientId, addPatient, setActiveCaregiverSubScreen } = useNoklai();

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newRelation, setNewRelation] = useState('Grandparent');

  const handleCreatePatient = () => {
    if (!newName.trim()) return;
    addPatient({
      name: newName.trim(),
      age: newAge.trim() || '70',
      relation: newRelation,
    });
    setNewName('');
    setNewAge('');
    setModalVisible(false);
  };

  const handleSelect = (patient) => {
    setActivePatientId(patient.id);
    if (onSelectPatient) {
      onSelectPatient(patient);
    } else {
      setActiveCaregiverSubScreen('progress');
    }
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
      <NoklaiHeader
        showBack
        onBack={onBack || (() => setActiveCaregiverSubScreen(null))}
        title="Your Loved Ones"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text
            style={[
              styles.heading,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Your Loved Ones
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            People you are supporting
          </Text>
        </View>

        {/* Patients List */}
        <View style={styles.patientList}>
          {patients.map((patient) => {
            const isSelected = patient.id === activePatientId;
            return (
              <TouchableOpacity
                key={patient.id}
                activeOpacity={0.82}
                onPress={() => handleSelect(patient)}
                style={[
                  styles.patientItemCard,
                  {
                    backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                    borderColor: isSelected
                      ? noklaiTheme.colors.primary
                      : isDarkMode
                      ? '#2D3545'
                      : '#E8EAE3',
                    borderWidth: isSelected ? 2 : 1,
                  },
                  !isDarkMode && noklaiTheme.shadows.card,
                ]}
              >
                <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={{ fontSize: 26 }}>👵</Text>
                </View>

                <View style={styles.patientInfoCol}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.patientName,
                        { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                      ]}
                    >
                      {patient.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.connectedSinceText,
                      { color: isDarkMode ? '#9CA3AF' : '#656F7D' },
                    ]}
                  >
                    Connected since {patient.connectedSince || 'Mar 2025'}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? '#9CA3AF' : '#656F7D'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Another Person Button */}
        <TouchableOpacity
          style={[
            styles.addPersonButton,
            {
              borderColor: noklaiTheme.colors.primary,
              backgroundColor: isDarkMode ? '#221E36' : '#F8F6FE',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={noklaiTheme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.addPersonText, { color: noklaiTheme.colors.primary }]}>
            + Add Another Person
          </Text>
        </TouchableOpacity>

        {/* Quote Card (Screen 5 in reference design) */}
        <QuoteCard
          quote="Care is a journey we walk together."
          author="Family Support"
        />

        {/* Add Person Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                Add a Loved One
              </Text>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                placeholder="e.g. Grandma Sunita"
                placeholderTextColor="#9CA3AF"
                value={newName}
                onChangeText={setNewName}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                    color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  },
                ]}
              />

              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                placeholder="e.g. 74"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newAge}
                onChangeText={setNewAge}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                    color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  },
                ]}
              />

              <View style={styles.modalButtonsRow}>
                <NoklaiButton
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <NoklaiButton
                  title="Add Person"
                  variant="primary"
                  size="sm"
                  onPress={handleCreatePatient}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  headerBox: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  patientList: {
    gap: 14,
    marginBottom: 20,
  },
  patientItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.xl,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  patientInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  activeTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  connectedSinceText: {
    fontSize: 13,
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: noklaiTheme.radii.full,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  addPersonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: noklaiTheme.radii.xxl,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: noklaiTheme.radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});

