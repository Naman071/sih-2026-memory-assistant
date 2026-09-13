import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReminders } from '../modules/database';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { patientId, patientName, caregiverName, caregiverPhone } = usePatient();
  const { t, currentLanguage } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [statusState, setStatusState] = useState({ type: 'loading' });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!patientId) {
        if (isMounted) {
          setReminders([]);
          setLoadingReminders(false);
          setStatusState({ type: 'connected', name: patientName });
        }
        return;
      }
      setLoadingReminders(true);
      try {
        console.log(`HomeScreen: patientId = ${patientId}`);
        const data = await getReminders(patientId);
        if (isMounted) {
          console.log(`HomeScreen: reminders =`, data);
          setReminders(data || []);
          setStatusState({ type: 'connected', name: patientName });
        }
      } catch (error) {
        console.error('HomeScreen: Error fetching data:', error);
        if (isMounted) {
          setReminders([]);
          setStatusState({ type: 'offline' });
        }
      } finally {
        if (isMounted) {
          setLoadingReminders(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [patientId, patientName]);

  const safeReminders = reminders || [];

  const getGreetingSalutation = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('home.greetingMorning') || 'Good morning';
    if (hour >= 12 && hour < 17) return t('home.greetingAfternoon') || 'Good afternoon';
    if (hour >= 17 && hour < 21) return t('home.greetingEvening') || 'Good evening';
    return t('home.greetingNight') || 'Good night';
  };

  const statusDisplay = {
    isSuccess: statusState.type === 'connected',
    text: statusState.type === 'connected' ? (t('home.statusConnected') || 'Connected') : (t('home.statusOffline') || 'Offline'),
  };

  const defaultFriend =
    currentLanguage === 'as' || currentLanguage === 'bn'
      ? 'বন্ধু'
      : currentLanguage === 'hi'
      ? 'मित्र'
      : 'Friend';

  const localeCode =
    currentLanguage === 'as'
      ? 'as-IN'
      : currentLanguage === 'bn'
      ? 'bn-IN'
      : currentLanguage === 'hi'
      ? 'hi-IN'
      : 'en-US';

  let formattedDate;
  try {
    formattedDate = new Date().toLocaleDateString(localeCode, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    formattedDate = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroMetaRow}>
            <Text style={[styles.dateText, { color: theme.subText }]}>
              {formattedDate}
            </Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: statusDisplay.isSuccess
                    ? 'rgba(5, 150, 105, 0.08)'
                    : 'rgba(217, 119, 6, 0.08)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusDisplay.isSuccess ? (isDarkMode ? '#34D399' : '#059669') : (isDarkMode ? '#FBBF24' : '#D97706') },
                ]}
              />
              <Text
                style={[
                  styles.statusIndicatorText,
                  { color: statusDisplay.isSuccess ? (isDarkMode ? '#34D399' : '#059669') : (isDarkMode ? '#FBBF24' : '#D97706') },
                ]}
              >
                {statusDisplay.text}
              </Text>
            </View>
          </View>

          <Text style={[styles.greetingSalutation, { color: theme.subText }]}>
            {getGreetingSalutation()},
          </Text>
          <Text style={[styles.patientNameHeading, { color: theme.text }]} numberOfLines={2}>
            {patientName || defaultFriend}
          </Text>

          {caregiverName || caregiverPhone ? (
            <View
              style={[
                styles.caregiverCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.caregiverIconContainer,
                  { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' },
                ]}
              >
                <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
              </View>
              <View style={styles.caregiverDetails}>
                <Text style={[styles.caregiverRoleLabel, { color: theme.subText }]}>
                  {t('home.primaryCaregiver') || 'Primary Caregiver'}
                </Text>
                <Text style={[styles.caregiverNameText, { color: theme.text }]} numberOfLines={1}>
                  {caregiverName || t('home.assignedCaregiver') || 'Assigned Caregiver'}
                </Text>
              </View>
              {caregiverPhone ? (
                <View
                  style={[
                    styles.caregiverPhonePill,
                    { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons name="call-outline" size={14} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.caregiverPhoneText, { color: theme.text }]}>{caregiverPhone}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Daily Schedule Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="calendar-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('home.myDay') || 'Daily Schedule'}
              </Text>
            </View>
            {safeReminders.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{safeReminders.length}</Text>
              </View>
            )}
          </View>

          {loadingReminders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingSubtext, { color: theme.subText }]}>
                {t('home.loadingSchedule') || 'Loading schedule...'}
              </Text>
            </View>
          ) : safeReminders.length > 0 ? (
            safeReminders.map((item, index) => (
              <View
                key={item.id?.toString() || index.toString()}
                style={[
                  styles.reminderRow,
                  index === safeReminders.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={item.completed ? (isDarkMode ? '#34D399' : '#059669') : theme.subText}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.reminderTitle,
                    {
                      color: item.completed ? theme.subText : theme.text,
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.timeBadge,
                    { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons name="time-outline" size={13} color={theme.subText} style={{ marginRight: 4 }} />
                  <Text style={[styles.reminderTime, { color: theme.subText }]}>{item.time}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={34} color={theme.subText} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {t('home.noReminders')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Tiles */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionTile,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}
            onPress={() => navigation.navigate('Games')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' },
              ]}
            >
              <Ionicons name="shapes-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTileTitle, { color: theme.text }]}>
                {t('home.playGames') || 'Brain Exercises'}
              </Text>
              <Text style={[styles.actionTileSubtitle, { color: theme.subText }]}>
                {t('home.brainExercisesSub') || 'Cognitive recall & focus'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionTile,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}
            onPress={() => navigation.navigate('Memories')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5' },
              ]}
            >
              <Ionicons name="people-outline" size={24} color={isDarkMode ? '#34D399' : '#059669'} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTileTitle, { color: theme.text }]}>
                {t('home.viewMemories') || 'Family & Loved Ones'}
              </Text>
              <Text style={[styles.actionTileSubtitle, { color: theme.subText }]}>
                {t('home.lovedOnesSub') || 'Faces & relationships'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingSalutation: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  patientNameHeading: {
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -0.3,
    marginBottom: 16,
    lineHeight: 40,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  caregiverIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverRoleLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caregiverNameText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 1,
  },
  caregiverPhonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  caregiverPhoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(156, 163, 175, 0.25)',
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    lineHeight: 24,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  reminderTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTile: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTileTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  actionTileSubtitle: {
    fontSize: 13,
    lineHeight: 17,
  },
});