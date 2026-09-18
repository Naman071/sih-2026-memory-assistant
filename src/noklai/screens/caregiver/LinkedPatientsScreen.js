import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import QuoteCard from '../../components/QuoteCard';
import NoklaiButton from '../../components/NoklaiButton';
import NoklaiHeader from '../../components/NoklaiHeader';

export default function LinkedPatientsScreen({ onBack, onSelectPatient }) {
  const { isDarkMode } = useTheme();
  const {
    patients,
    activePatientId,
    setActivePatientId,
    addPatient,
    setActiveCaregiverSubScreen,
    linkPatientByInviteCode,
  } = useNoklai();

  const [modalVisible, setModalVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('female');
  const [newRelation, setNewRelation] = useState('Grandparent');

  const handleLinkByCode = async () => {
    if (!inviteCode.trim()) {
      setLinkError('Please enter a patient code.');
      return;
    }
    setIsLinking(true);
    setLinkError('');
    try {
      const result = await linkPatientByInviteCode(inviteCode.trim());
      if (result.success) {
        setInviteCode('');
        setLinkModalVisible(false);
      } else {
        setLinkError(result.message || 'Could not find patient with this code.');
      }
    } catch (err) {
      setLinkError('Failed to connect. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreatePatient = () => {
    if (!newName.trim()) return;
    addPatient({
      name: newName.trim(),
      age: newAge.trim() || '70',
      gender: newGender,
      relation: newRelation,
    });
    setNewName('');
    setNewAge('');
    setNewGender('female');
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
                  <Text style={{ fontSize: 26 }}>{patient.avatarText || (patient.gender === 'male' ? '👴' : '👵')}</Text>
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
                    ID: {patient.id} • Connected since {patient.connectedSince || 'Mar 2025'}
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

        {/* Action Buttons: Link by Code & Add Profile */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                borderColor: '#16A34A',
                backgroundColor: isDarkMode ? '#14291E' : '#F0FDF4',
                flex: 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              setLinkError('');
              setInviteCode('');
              setLinkModalVisible(true);
            }}
          >
            <Ionicons name="link" size={18} color="#16A34A" style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>
              Link by Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                borderColor: noklaiTheme.colors.primary,
                backgroundColor: isDarkMode ? '#221E36' : '#F8F6FE',
                flex: 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color={noklaiTheme.colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: noklaiTheme.colors.primary }]}>
              Add Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quote Card (Screen 5 in reference design) */}
        <QuoteCard
          quote="Care is a journey we walk together."
          author="Family Support"
        />

        {/* Link Patient by Code Modal */}
        <Modal visible={linkModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={[styles.linkIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="link" size={20} color="#16A34A" />
                </View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary, marginBottom: 0, marginLeft: 10 },
                  ]}
                >
                  Link Loved One by Code
                </Text>
              </View>

              <Text style={{ fontSize: 13, color: isDarkMode ? '#9CA3AF' : '#64748B', marginBottom: 16, lineHeight: 18 }}>
                Enter the Patient Connection Code displayed on your loved one&apos;s home screen (e.g. P001) to sync their cognitive games and progress in real-time.
              </Text>

              {linkError ? (
                <View style={styles.modalErrorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.modalErrorText}>{linkError}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Patient Connection Code</Text>
              <TextInput
                placeholder="e.g. P001"
                placeholderTextColor="#9CA3AF"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text);
                  if (linkError) setLinkError('');
                }}
                autoCapitalize="characters"
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                    color: isDarkMode ? '#F3F4F6' : '#1E242B',
                    fontWeight: '700',
                    fontSize: 16,
                    letterSpacing: 1,
                  },
                ]}
              />

              <View style={styles.modalButtonsRow}>
                <NoklaiButton
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setLinkModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <NoklaiButton
                  title={isLinking ? 'Connecting...' : 'Connect'}
                  variant="primary"
                  size="sm"
                  disabled={isLinking}
                  onPress={handleLinkByCode}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>

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

              <Text style={styles.inputLabel}>Profile Picture</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <TouchableOpacity
                  onPress={() => setNewGender('male')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: newGender === 'male' ? '#16A34A' : '#E5E7EB',
                    backgroundColor: newGender === 'male' ? '#DCFCE7' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 6 }}>👴</Text>
                  <Text style={{ fontWeight: '600', fontSize: 12, color: newGender === 'male' ? '#16A34A' : '#4B5563' }}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewGender('female')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: newGender === 'female' ? '#16A34A' : '#E5E7EB',
                    backgroundColor: newGender === 'female' ? '#DCFCE7' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 6 }}>👵</Text>
                  <Text style={{ fontWeight: '600', fontSize: 12, color: newGender === 'female' ? '#16A34A' : '#4B5563' }}>Female</Text>
                </TouchableOpacity>
              </View>

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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: noklaiTheme.radii.md,
    marginBottom: 12,
  },
  modalErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

