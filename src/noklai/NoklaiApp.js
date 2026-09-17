import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from './theme/noklaiTheme';
import { NoklaiProvider, useNoklai } from './context/NoklaiContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import AppLaunchScreen from './screens/AppLaunchScreen';
import NoklaiLoginScreen from './screens/NoklaiLoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';

// Caregiver Screens
import CaregiverHomeScreen from './screens/caregiver/CaregiverHomeScreen';
import LinkedPatientsScreen from './screens/caregiver/LinkedPatientsScreen';
import PatientProgressScreen from './screens/caregiver/PatientProgressScreen';
import GamePerformanceScreen from './screens/caregiver/GamePerformanceScreen';
import ActivityHistoryScreen from './screens/caregiver/ActivityHistoryScreen';
import InsightsScreen from './screens/caregiver/InsightsScreen';
import CaregiverAnalyticsScreen from '../screens/CaregiverAnalyticsScreen';
import CaregiverSettingsScreen from './screens/caregiver/CaregiverSettingsScreen';

// Patient Screens
import PatientHomeScreen from './screens/patient/PatientHomeScreen';
import PatientGamesScreen from './screens/patient/PatientGamesScreen';

// AI Screen
import NoklaiAIScreen from './screens/ai/NoklaiAIScreen';

function NoklaiShell() {
  const { isDarkMode } = useTheme();
  const {
    currentStep,
    role,
    aiModalVisible,
    setAiModalVisible,
    activeCaregiverSubScreen,
    setActiveCaregiverSubScreen,
  } = useNoklai();

  // Active Bottom Tab
  const [activeCaregiverTab, setActiveCaregiverTab] = useState('home'); // 'home' | 'activity' | 'ai' | 'insights' | 'settings'
  const [activePatientTab, setActivePatientTab] = useState('home');     // 'home' | 'games' | 'ai' | 'insights' | 'settings'

  // Step 1: Launch Splash
  if (currentStep === 'launch') {
    return <AppLaunchScreen />;
  }

  // Step 1.5: Login / Profile Setup
  if (currentStep === 'login') {
    return <NoklaiLoginScreen />;
  }

  // Step 2: Role Selection ("Who are you?")
  if (currentStep === 'role_select') {
    return <RoleSelectionScreen />;
  }

  // Active Caregiver Sub-Screens (when pushed from buttons)
  if (role === 'caregiver' && activeCaregiverSubScreen) {
    if (activeCaregiverSubScreen === 'progress') {
      return (
        <PatientProgressScreen onBack={() => setActiveCaregiverSubScreen(null)} />
      );
    }
    if (activeCaregiverSubScreen === 'games') {
      return (
        <GamePerformanceScreen onBack={() => setActiveCaregiverSubScreen('progress')} />
      );
    }
    if (activeCaregiverSubScreen === 'history') {
      return (
        <ActivityHistoryScreen onBack={() => setActiveCaregiverSubScreen(null)} />
      );
    }
    if (activeCaregiverSubScreen === 'insights') {
      return (
        <InsightsScreen onBack={() => setActiveCaregiverSubScreen(null)} />
      );
    }
    if (activeCaregiverSubScreen === 'linked') {
      return (
        <LinkedPatientsScreen onBack={() => setActiveCaregiverSubScreen(null)} />
      );
    }
  }

  // Render Caregiver Tab Content
  const renderCaregiverContent = () => {
    switch (activeCaregiverTab) {
      case 'home':
        return <CaregiverHomeScreen />;
      case 'activity':
        return <ActivityHistoryScreen />;
      case 'ai':
        return <NoklaiAIScreen onClose={() => setActiveCaregiverTab('home')} />;
      case 'insights':
        return <CaregiverAnalyticsScreen />;
      case 'settings':
        return <CaregiverSettingsScreen />;
      default:
        return <CaregiverHomeScreen />;
    }
  };

  // Render Patient Tab Content (Memories option completely removed)
  const renderPatientContent = () => {
    switch (activePatientTab) {
      case 'home':
        return (
          <PatientHomeScreen
            onNavigateToGames={() => setActivePatientTab('games')}
          />
        );
      case 'games':
        return <PatientGamesScreen onBack={() => setActivePatientTab('home')} />;
      case 'ai':
        return <NoklaiAIScreen onClose={() => setActivePatientTab('home')} />;
      case 'insights':
        return (
          <InsightsScreen
            onNavigateToGames={() => setActivePatientTab('games')}
          />
        );
      case 'settings':
        return <CaregiverSettingsScreen />;
      default:
        return (
          <PatientHomeScreen
            onNavigateToGames={() => setActivePatientTab('games')}
          />
        );
    }
  };

  const isCaregiver = role === 'caregiver';

  const caregiverTabs = [
    { id: 'home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { id: 'activity', label: 'Updates', icon: 'newspaper', iconOutline: 'newspaper-outline' },
    { id: 'ai', label: 'AI Helper', icon: 'sparkles', isSpecial: true },
    { id: 'insights', label: 'Insights', icon: 'bulb', iconOutline: 'bulb-outline' },
    { id: 'settings', label: 'Settings', icon: 'person', iconOutline: 'person-outline' },
  ];

  // 5 tabs with Noklai AI placed exactly in the middle (index 2)
  const patientTabs = [
    { id: 'home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { id: 'games', label: 'Games', icon: 'game-controller', iconOutline: 'game-controller-outline' },
    { id: 'ai', label: 'Noklai AI', icon: 'sparkles', isSpecial: true },
    { id: 'insights', label: 'Insights', icon: 'bulb', iconOutline: 'bulb-outline' },
    { id: 'settings', label: 'Settings', icon: 'person', iconOutline: 'person-outline' },
  ];

  const tabs = isCaregiver ? caregiverTabs : patientTabs;
  const activeTab = isCaregiver ? activeCaregiverTab : activePatientTab;
  const setActiveTab = isCaregiver ? setActiveCaregiverTab : setActivePatientTab;

  return (
    <View
      style={[
        styles.rootContainer,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.backgroundDark
            : noklaiTheme.colors.background,
        },
      ]}
    >
      {/* Active Tab Screen Content */}
      <View style={styles.screenContainer}>
        {isCaregiver ? renderCaregiverContent() : renderPatientContent()}
      </View>

      {/* Noklai Bottom Tab Bar */}
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: isDarkMode
              ? noklaiTheme.colors.tabBarBgDark
              : noklaiTheme.colors.tabBarBg,
            borderTopColor: isDarkMode
              ? noklaiTheme.colors.borderDark
              : noklaiTheme.colors.border,
          },
        ]}
      >
        <View style={styles.tabBarInner}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;

            if (tab.isSpecial) {
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.85}
                  onPress={() => setActiveTab(tab.id)}
                  style={styles.specialAiTab}
                  accessibilityLabel="Open AI assistant"
                >
                  <View
                    style={[
                      styles.specialAiCircle,
                      {
                        backgroundColor: isCaregiver
                          ? noklaiTheme.colors.primary
                          : noklaiTheme.colors.patientGreen,
                      },
                    ]}
                  >
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isCaregiver
                          ? noklaiTheme.colors.primary
                          : noklaiTheme.colors.patientGreen,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tabItem}
              >
                <Ionicons
                  name={isSelected ? tab.icon : tab.iconOutline}
                  size={22}
                  color={
                    isSelected
                      ? isCaregiver
                        ? noklaiTheme.colors.primary
                        : noklaiTheme.colors.patientGreen
                      : isDarkMode
                      ? '#6B7280'
                      : '#8A95A5'
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isSelected
                        ? isCaregiver
                          ? noklaiTheme.colors.primary
                          : noklaiTheme.colors.patientGreen
                        : isDarkMode
                        ? '#6B7280'
                        : '#8A95A5',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* AI Assistant Modal */}
      <Modal
        visible={aiModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <NoklaiAIScreen onClose={() => setAiModalVisible(false)} />
      </Modal>
    </View>
  );
}

export default function NoklaiApp() {
  return (
    <NoklaiProvider>
      <NoklaiShell />
    </NoklaiProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBarSafeArea: {
    borderTopWidth: 1,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  specialAiTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
  },
  specialAiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
});
