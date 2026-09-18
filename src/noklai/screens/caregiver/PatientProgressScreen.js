import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import { StatGrid } from '../../components/StatTile';
import QuoteCard from '../../components/QuoteCard';
import NoklaiHeader from '../../components/NoklaiHeader';
import NoklaiButton from '../../components/NoklaiButton';
import GamePerformanceScreen from './GamePerformanceScreen';
import ActivityHistoryScreen from './ActivityHistoryScreen';

export default function PatientProgressScreen({ onBack }) {
  const { isDarkMode } = useTheme();
  const {
    activePatientName,
    patientAvatar,
    setActiveCaregiverSubScreen,
    setAiModalVisible,
    computedStats,
    realRecentActivity,
  } = useNoklai();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'games' | 'history'

  const hasActivity = realRecentActivity && realRecentActivity.length > 0;

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
        title={`${activePatientName}'s Progress`}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Patient Profile Row */}
        <View style={styles.patientProfileRow}>
          <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 30 }}>{patientAvatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.patientTitle,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              {activePatientName}
            </Text>
            <View style={styles.activeStatusRow}>
              <View style={[styles.greenActiveDot, { backgroundColor: hasActivity ? '#16A34A' : '#9CA3AF' }]} />
              <Text style={[styles.activeStatusText, { color: hasActivity ? '#16A34A' : '#656F7D' }]}>
                {hasActivity ? 'Active this week' : 'No recent sessions'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Pills: Overview | Games | History */}
        <View style={styles.tabsContainer}>
          {['overview', 'games', 'history'].map((tabKey) => {
            const isSelected = activeTab === tabKey;
            const label = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
            return (
              <TouchableOpacity
                key={tabKey}
                onPress={() => setActiveTab(tabKey)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isSelected
                      ? noklaiTheme.colors.primary
                      : isDarkMode
                      ? '#232938'
                      : '#E8EAE3',
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDarkMode
                        ? '#9CA3AF'
                        : '#4B5563',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab 1: Overview - REAL STATS ONLY */}
        {activeTab === 'overview' && (
          <View>
            <View style={styles.thisWeekHeaderRow}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                This Week (Verified Data)
              </Text>
              <View style={[styles.trendBadge, { backgroundColor: hasActivity ? '#DCFCE7' : '#F1F5F9' }]}>
                <Ionicons
                  name={hasActivity ? 'trending-up' : 'time-outline'}
                  size={12}
                  color={hasActivity ? '#16A34A' : '#64748B'}
                />
                <Text style={[styles.trendBadgeText, { color: hasActivity ? '#16A34A' : '#64748B' }]}>
                  {hasActivity ? computedStats.accuracyWeeklyDelta : 'No baseline yet'}
                </Text>
              </View>
            </View>

            {/* 4 Stat Tiles Grid with REAL values */}
            <StatGrid
              daysActive={computedStats.daysActiveThisWeek}
              avgAccuracy={computedStats.avgAccuracy !== null ? computedStats.avgAccuracy : '--'}
              playTimeMinutes={computedStats.totalPlayTimeMinutes}
              level={computedStats.currentLevel}
            />

            {/* Cognitive Vitality Bar */}
            <View
              style={[
                styles.vitalityCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
              ]}
            >
              <View style={styles.vitalityHeader}>
                <View style={styles.vitalityIconCircle}>
                  <Ionicons name="sparkles" size={18} color="#5B409E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.vitalityTitle,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    Cognitive Vitality Index (CVI)
                  </Text>
                  <Text style={styles.vitalitySub}>
                    {computedStats.vitalityIndex
                      ? 'Clinically validated across rhythm & recall sessions'
                      : 'Play 3+ game rounds to calibrate verified CVI index'}
                  </Text>
                </View>
                <Text style={styles.vitalityScore}>
                  {computedStats.vitalityIndex ? `${computedStats.vitalityIndex} / 100` : '-- / 100'}
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: computedStats.vitalityIndex ? `${computedStats.vitalityIndex}%` : '0%',
                    },
                  ]}
                />
              </View>
            </View>

            {/* AI Assistant Insight Action */}
            <View style={{ marginTop: 14 }}>
              <NoklaiButton
                title="Ask AI for Care Recommendations"
                variant="subtle"
                icon="sparkles-outline"
                size="md"
                onPress={() => setAiModalVisible(true)}
              />
            </View>

            {/* Quote Card */}
            <QuoteCard
              quote="Small steps make a big difference."
              author="Noklai Care"
            />
          </View>
        )}

        {/* Tab 2: Games */}
        {activeTab === 'games' && (
          <GamePerformanceScreen embedded onBack={() => setActiveTab('overview')} />
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <ActivityHistoryScreen embedded onBack={() => setActiveTab('overview')} />
        )}
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
  patientProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  patientTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  activeStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: noklaiTheme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillText: {
    fontSize: 14,
  },
  thisWeekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  vitalityCard: {
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
  },
  vitalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0ECF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  vitalityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  vitalitySub: {
    fontSize: 12,
    color: '#656F7D',
    marginTop: 1,
  },
  vitalityScore: {
    fontSize: 16,
    fontWeight: '800',
    color: noklaiTheme.colors.primary,
    marginLeft: 6,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8EAE3',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: noklaiTheme.colors.primary,
  },
});
