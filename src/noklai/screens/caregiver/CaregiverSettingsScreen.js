import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';
import LanguageSelector from '../../../components/LanguageSelector';
import ThemeToggle from '../../../components/ThemeToggle';

export default function CaregiverSettingsScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const {
    role,
    caregiverName,
    caregiverAvatar,
    activePatientName,
    patientAvatar,
    caregiverPhone,
    patientPhone,
    selectRole,
    setCurrentStep,
    resetToLaunch,
    resetToRoleSelect,
    signOut,
  } = useNoklai();

  const isPatient = role === 'patient';

  const menuItems = [
    {
      id: 'profile',
      icon: 'person-circle-outline',
      title: 'Edit Names & Mobile Numbers',
      subtitle: 'Update caregiver and patient profiles',
      onPress: () => setCurrentStep('login'),
    },
    {
      id: 'access',
      icon: 'people-outline',
      title: 'Manage Caregiver Access',
      subtitle: 'Invite secondary caregivers & family',
      onPress: () => Alert.alert('Caregiver Access', 'You have primary administrator access.'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      title: 'Notification Preferences',
      subtitle: 'Daily routine alerts & activity digests',
      onPress: () => Alert.alert('Notifications', 'Daily digest is enabled for 08:00 AM.'),
    },
    {
      id: 'privacy',
      icon: 'shield-checkmark-outline',
      title: 'Privacy & Security',
      subtitle: 'HIPAA/local data security & encryption',
      onPress: () => Alert.alert('Privacy & Security', 'All cognitive data is end-to-end encrypted and stored with user consent.'),
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: 'About Noklai',
      subtitle: 'Version 2.0 • Culturally-grounded Memory Assistant',
      onPress: () => Alert.alert('About Noklai', 'Noklai - Our Culture. Their Memories. Always With Them.\nSIH 2026 Edition'),
    },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Would you like to sign out and return to the welcome screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            if (signOut) {
              await signOut();
            } else {
              resetToLaunch();
            }
          },
        },
      ]
    );
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
      <NoklaiHeader title="Settings" showRoleBadge={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
              borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
            },
            !isDarkMode && noklaiTheme.shadows.card,
          ]}
        >
          <View style={[styles.profileAvatarCircle, { backgroundColor: isPatient ? '#FEF3C7' : '#EDE9FE' }]}>
            <Text style={{ fontSize: 32 }}>{isPatient ? patientAvatar : caregiverAvatar}</Text>
          </View>
          <View style={styles.profileDetailsCol}>
            <Text
              style={[
                styles.profileName,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              {isPatient ? (activePatientName || 'Patient') : (caregiverName || 'Caregiver')}
            </Text>
            <Text style={styles.profileRoleText}>
              {isPatient ? 'Patient Profile' : 'Primary Caregiver'}
              {isPatient
                ? (patientPhone ? ` • ${patientPhone}` : '')
                : (caregiverPhone ? ` • ${caregiverPhone}` : '')}
            </Text>
            <Text style={styles.profileCaringText}>
              {isPatient
                ? `Connected Caregiver: ${caregiverName || 'Caregiver'}${caregiverPhone ? ` • ${caregiverPhone}` : ''}`
                : `Supporting: ${activePatientName || 'Patient'}${patientPhone ? ` • ${patientPhone}` : ''}`}
            </Text>
          </View>
        </View>

        {/* Quick Settings: Language & Theme */}
        <View
          style={[
            styles.preferencesCard,
            {
              backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
              borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
            },
          ]}
        >
          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="language-outline" size={20} color={noklaiTheme.colors.primary} style={{ marginRight: 10 }} />
              <Text
                style={[
                  styles.prefText,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                App Language
              </Text>
            </View>
            <LanguageSelector compact />
          </View>

          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#2D3545' : '#E8EAE3' }]} />

          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="moon-outline" size={20} color={noklaiTheme.colors.primary} style={{ marginRight: 10 }} />
              <Text
                style={[
                  styles.prefText,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                Dark Mode
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Switch Role Card */}
        <TouchableOpacity
          onPress={() => selectRole(isPatient ? 'caregiver' : 'patient')}
          style={[
            styles.roleSwitchCard,
            {
              backgroundColor: isDarkMode ? (isPatient ? '#201A38' : '#143823') : (isPatient ? '#F3EFFE' : '#EAF6EF'),
              borderColor: isDarkMode ? (isPatient ? '#3B2D6B' : '#23603B') : (isPatient ? '#DDD6FE' : '#BBF7D0'),
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: isPatient ? '#EDE9FE' : '#DCFCE7' }]}>
            <Ionicons name={isPatient ? 'shield-checkmark' : 'person'} size={20} color={isPatient ? '#6D28D9' : '#16A34A'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.roleSwitchTitle, { color: isDarkMode ? (isPatient ? '#C4B5FD' : '#86EFAC') : (isPatient ? '#5B21B6' : '#14532D') }]}>
              {isPatient ? 'Switch to Caregiver Mode' : 'Switch to Patient Mode'}
            </Text>
            <Text style={[styles.roleSwitchSub, { color: isDarkMode ? (isPatient ? '#DDD6FE' : '#BBF7D0') : (isPatient ? '#6D28D9' : '#166534') }]}>
              {isPatient
                ? 'Monitor cognitive metrics, insights & activity updates'
                : 'Experience the elder-friendly brain games & daily routine'}
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={24} color={isPatient ? '#7C3AED' : '#16A34A'} />
        </TouchableOpacity>

        {/* Menu Items List (from reference design) */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={[
                styles.menuItemRow,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#F0ECF9' }]}>
                <Ionicons name={item.icon} size={20} color="#5B409E" />
              </View>

              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDarkMode ? '#9CA3AF' : '#8A95A5'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button (from reference design) */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    marginBottom: 16,
  },
  profileAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileDetailsCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileRoleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B409E',
    marginBottom: 2,
  },
  profileCaringText: {
    fontSize: 12,
    color: '#656F7D',
  },
  preferencesCard: {
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  prefText: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  roleSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  roleSwitchTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleSwitchSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  menuList: {
    gap: 10,
    marginBottom: 24,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#8A95A5',
  },
  signOutButton: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    paddingVertical: 15,
    borderRadius: noklaiTheme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});

