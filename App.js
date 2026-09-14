import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

LogBox.ignoreLogs([
  'Supabase difficulty_profiles save notice',
  'Could not find the table',
  'schema cache',
  'Supabase profile save error',
  'Supabase round insert notice',
]);

import HomeScreen from './src/screens/HomeScreen';
import GamesScreen from './src/screens/GamesScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import AIScreen from './src/screens/AIScreen';
import CaregiverAnalyticsScreen from './src/screens/CaregiverAnalyticsScreen';
import SetupWizard from './src/screens/SetupWizard';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { PatientProvider, usePatient } from './src/context/PatientContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import ThemeToggle from './src/components/ThemeToggle';
import LanguageSelector from './src/components/LanguageSelector';

const Tab = createBottomTabNavigator();

function MainNavigator({ onOpenSettings }) {
  const { isDarkMode, theme } = useTheme();
  const { t } = useLanguage();

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.cardBackground,
      text: theme.text,
      border: theme.cardBorder,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.headerText,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <LanguageSelector compact={false} />
              <ThemeToggle />
            </View>
          ),
          tabBarStyle: {
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.tabBarBorder,
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Games') {
              iconName = focused ? 'game-controller' : 'game-controller-outline';
            } else if (route.name === 'Memories') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'AI') {
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            } else if (route.name === 'Insights') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('nav.home'),
            headerTitle: t('nav.home'),
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                  onPress={onOpenSettings}
                  style={[
                    styles.gearButton,
                    { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Patient Setup"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-sharp" size={20} color={theme.subText} />
                </TouchableOpacity>
              </View>
            ),
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                <LanguageSelector compact={false} />
                <ThemeToggle />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Games"
          component={GamesScreen}
          options={{
            tabBarLabel: t('nav.games'),
            headerTitle: t('nav.games'),
          }}
        />
        <Tab.Screen
          name="Memories"
          component={MemoriesScreen}
          options={{
            tabBarLabel: t('nav.memories'),
            headerTitle: t('nav.memories'),
          }}
        />
        <Tab.Screen
          name="AI"
          component={AIScreen}
          options={{
            tabBarLabel: t('nav.ai'),
            headerTitle: t('nav.ai'),
          }}
        />
        <Tab.Screen
          name="Insights"
          component={CaregiverAnalyticsScreen}
          options={{
            tabBarLabel: t('nav.insights', 'Insights'),
            headerTitle: t('nav.caregiverAnalytics', 'Caregiver Analytics'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function RootApp() {
  const { isSetupDone, isLoading, isEditingSetup, closeSetupWizard, openSetupWizard } = usePatient();
  const { theme, isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary || '#2563EB'} />
      </View>
    );
  }

  if (!isSetupDone || isEditingSetup) {
    return <SetupWizard onComplete={closeSetupWizard} />;
  }

  return <MainNavigator onOpenSettings={openSetupWizard} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PatientProvider>
          <RootApp />
        </PatientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  headerLeftContainer: {
    paddingLeft: 12,
  },
  gearButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});