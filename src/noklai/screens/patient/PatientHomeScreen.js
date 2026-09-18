import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiCard from '../../components/NoklaiCard';
import QuoteCard from '../../components/QuoteCard';
import AIButton from '../../components/AIButton';
import NoklaiButton from '../../components/NoklaiButton';

export default function PatientHomeScreen({
  onNavigateToGames,
  onContinueActivity,
  onOpenAI,
  onNavigateToProgress,
}) {
  const { isDarkMode } = useTheme();
  const {
    activePatientName,
    patientAvatar,
    reminders,
    loadingReminders,
    addReminder,
    deleteReminder,
    toggleRoutineItem,
    setAiModalVisible,
  } = useNoklai();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const handleSaveReminder = () => {
    if (!reminderTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a reminder name (e.g. Blood Pressure medicine).');
      return;
    }
    addReminder({
      title: reminderTitle.trim(),
      time: reminderTime.trim() || '12:00 PM',
      category: 'Routine',
    });
    setReminderTitle('');
    setReminderTime('');
    setAddModalVisible(false);
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcoming Greeting & Avatar */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.greetingSub,
                { color: isDarkMode ? '#86EFAC' : '#15803D' },
              ]}
            >
              Namaste, {activePatientName}!
            </Text>
            <Text
              style={[
                styles.patientNameHeading,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Welcome back. What would you like to do today?
            </Text>
            <Text
              style={[
                styles.calmEncourageTag,
                { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Let’s try together • Take your time
            </Text>
          </View>

          <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 36 }}>{patientAvatar}</Text>
          </View>
        </View>

        {/* Daily Schedule / Reminders Section - Placed on top directly above action cards */}
        <View style={styles.sectionHeadingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar" size={22} color="#16A34A" style={{ marginRight: 8 }} />
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              My Day & Reminders
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addReminderHeaderBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={18} color="#16A34A" style={{ marginRight: 4 }} />
            <Text style={styles.addReminderHeaderText}>Add</Text>
          </TouchableOpacity>
        </View>

        <NoklaiCard style={styles.scheduleCard} padded={false}>
          {loadingReminders ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
                Checking reminders...
              </Text>
            </View>
          ) : reminders && reminders.length > 0 ? (
            reminders.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.routineRow,
                  index < reminders.length - 1 && styles.routineRowBorder,
                  item.done && { backgroundColor: isDarkMode ? '#16281E' : '#F4FBF6' },
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleRoutineItem(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={item.done ? '#16A34A' : '#9CA3AF'}
                    style={{ marginRight: 14 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.routineTitle,
                        {
                          color: item.done
                            ? isDarkMode ? '#9CA3AF' : '#6B7280'
                            : isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary,
                          textDecorationLine: item.done ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.time ? <Text style={styles.routineTime}>{item.time}</Text> : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteReminder(item.id)}
                  style={styles.deleteReminderBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={36} color="#9CA3AF" style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyText, { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary }]}>
                No reminders scheduled
              </Text>
              <Text style={[styles.emptySubText, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
                You haven&apos;t added any reminders yet. Tap &quot;Add&quot; to set medication or routine reminders.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setAddModalVisible(true)}
              >
                <Text style={styles.emptyAddBtnText}>+ Add First Reminder</Text>
              </TouchableOpacity>
            </View>
          )}
        </NoklaiCard>

        {/* 4 Large Patient Action Cards */}
        <View style={styles.fourCardsContainer}>
          {/* Card 1: Play a Memory Game */}
          <TouchableOpacity
            style={[
              styles.patientBigActionCard,
              {
                backgroundColor: isDarkMode ? '#221B36' : '#FAF5FF',
                borderColor: isDarkMode ? '#47366B' : '#E9D5FF',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
            activeOpacity={0.85}
            onPress={onNavigateToGames}
            accessibilityRole="button"
            accessibilityLabel="1. Play a Memory Game"
          >
            <View style={[styles.bigActionIconBadge, { backgroundColor: '#7C3AED' }]}>
              <Ionicons name="game-controller" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigActionTitle, { color: isDarkMode ? '#E9D5FF' : '#4C1D95' }]}>
                1. Play a Memory Game
              </Text>
              <Text style={[styles.bigActionSub, { color: isDarkMode ? '#CBD5E1' : '#6B7280' }]}>
                Suh Tah Lam, Dhopkhel, Ubilakapki & Northeast Memories
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? '#C4B5FD' : '#7C3AED'} />
          </TouchableOpacity>

          {/* Card 2: Continue Activity */}
          <TouchableOpacity
            style={[
              styles.patientBigActionCard,
              {
                backgroundColor: isDarkMode ? '#132A1C' : '#F0FDF4',
                borderColor: isDarkMode ? '#1F4B30' : '#BBF7D0',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
            activeOpacity={0.85}
            onPress={() => onContinueActivity ? onContinueActivity('suhTahLam') : onNavigateToGames?.()}
            accessibilityRole="button"
            accessibilityLabel="2. Continue Activity"
          >
            <View style={[styles.bigActionIconBadge, { backgroundColor: '#16A34A' }]}>
              <Ionicons name="play-circle" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigActionTitle, { color: isDarkMode ? '#86EFAC' : '#14532D' }]}>
                2. Continue Activity
              </Text>
              <Text style={[styles.bigActionSub, { color: isDarkMode ? '#CBD5E1' : '#6B7280' }]}>
                Resume gentle daily exercise — take your time, zero rush
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? '#86EFAC' : '#16A34A'} />
          </TouchableOpacity>

          {/* Card 3: Talk to NOKLAI */}
          <TouchableOpacity
            style={[
              styles.patientBigActionCard,
              {
                backgroundColor: isDarkMode ? '#142533' : '#F0F9FF',
                borderColor: isDarkMode ? '#23445F' : '#BAE6FD',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
            activeOpacity={0.85}
            onPress={() => onOpenAI ? onOpenAI() : setAiModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="3. Talk to NOKLAI"
          >
            <View style={[styles.bigActionIconBadge, { backgroundColor: '#0284C7' }]}>
              <Ionicons name="sparkles" size={26} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigActionTitle, { color: isDarkMode ? '#7DD3FC' : '#0369A1' }]}>
                3. Talk to NOKLAI
              </Text>
              <Text style={[styles.bigActionSub, { color: isDarkMode ? '#CBD5E1' : '#6B7280' }]}>
                Voice & chat companion for reminders, folklore & friendly talks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? '#7DD3FC' : '#0284C7'} />
          </TouchableOpacity>

          {/* Card 4: View My Progress */}
          <TouchableOpacity
            style={[
              styles.patientBigActionCard,
              {
                backgroundColor: isDarkMode ? '#2B2313' : '#FFFBEB',
                borderColor: isDarkMode ? '#54421B' : '#FDE68A',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
            activeOpacity={0.85}
            onPress={() => onNavigateToProgress ? onNavigateToProgress() : onNavigateToGames?.()}
            accessibilityRole="button"
            accessibilityLabel="4. View My Progress"
          >
            <View style={[styles.bigActionIconBadge, { backgroundColor: '#D97706' }]}>
              <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigActionTitle, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
                4. View My Progress
              </Text>
              <Text style={[styles.bigActionSub, { color: isDarkMode ? '#CBD5E1' : '#6B7280' }]}>
                See completed exercises, routine consistency & achievements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? '#FCD34D' : '#D97706'} />
          </TouchableOpacity>
        </View>

        {/* Inspirational Quote Card */}
        <QuoteCard
          quote="Small steps make a big difference."
          author="Noklai Care"
        />

        {/* Add Reminder Modal */}
        <Modal visible={addModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                Add Daily Reminder
              </Text>

              <Text style={styles.inputLabel}>Reminder Name</Text>
              <TextInput
                placeholder="e.g. Afternoon Medication, Evening Walk"
                placeholderTextColor="#9CA3AF"
                value={reminderTitle}
                onChangeText={setReminderTitle}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#283142' : '#F4F5F0',
                    color: isDarkMode ? '#F3F4F6' : '#1E242B',
                  },
                ]}
              />

              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                placeholder="e.g. 02:00 PM, Morning"
                placeholderTextColor="#9CA3AF"
                value={reminderTime}
                onChangeText={setReminderTime}
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
                  onPress={() => setAddModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <NoklaiButton
                  title="Save Reminder"
                  variant="patient"
                  size="sm"
                  onPress={handleSaveReminder}
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greetingSub: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  patientNameHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  calmEncourageTag: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: 12,
  },
  fourCardsContainer: {
    gap: 14,
    marginBottom: 22,
  },
  patientBigActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
  },
  bigActionIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bigActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  bigActionSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  gamesHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
    marginVertical: 10,
  },
  gamesHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gamesIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gamesHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  gamesHeroSub: {
    fontSize: 12,
    color: '#656F7D',
    lineHeight: 16,
  },
  playArrowBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5B409E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addReminderHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: noklaiTheme.radii.full,
  },
  addReminderHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  scheduleCard: {
    borderRadius: noklaiTheme.radii.xl,
    overflow: 'hidden',
    marginBottom: 20,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  routineRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  routineTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteReminderBtn: {
    padding: 6,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '85%',
    marginBottom: 14,
  },
  emptyAddBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: noklaiTheme.radii.full,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: noklaiTheme.radii.xxl,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#656F7D',
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
