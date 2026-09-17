import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import { StatSummaryRow } from '../../components/StatTile';
import NoklaiButton from '../../components/NoklaiButton';
import NoklaiCard from '../../components/NoklaiCard';
import AIButton from '../../components/AIButton';

export default function CaregiverHomeScreen({ onNavigateToProgress, onNavigateToAI, onNavigateToLinked }) {
  const { isDarkMode } = useTheme();
  const {
    caregiverName,
    activePatientName,
    setAiModalVisible,
    setActiveCaregiverSubScreen,
    computedStats,
    realRecentActivity,
  } = useNoklai();

  const handleViewProgress = () => {
    if (onNavigateToProgress) {
      onNavigateToProgress();
    } else {
      setActiveCaregiverSubScreen('progress');
    }
  };

  const handleOpenAI = () => {
    if (onNavigateToAI) {
      onNavigateToAI();
    } else {
      setAiModalVisible(true);
    }
  };

  const handleOpenLinked = () => {
    if (onNavigateToLinked) {
      onNavigateToLinked();
    } else {
      setActiveCaregiverSubScreen('linked');
    }
  };

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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.greetingText,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Good morning,{'\n'}{caregiverName || 'Caregiver'}!
            </Text>
            <Text
              style={[
                styles.subGreetingText,
                { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
              ]}
            >
              Here&apos;s how your loved ones are doing today.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleOpenLinked}
            style={styles.profileAvatarButton}
            accessibilityLabel="View linked loved ones"
          >
            <View style={styles.profileAvatarCircle}>
              <Text style={{ fontSize: 22 }}>👩</Text>
            </View>
            <View style={styles.profileBadgeDot} />
          </TouchableOpacity>
        </View>

        {/* Active Patient Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleViewProgress}
          style={[
            styles.patientCard,
            {
              backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
              borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
            },
            !isDarkMode && noklaiTheme.shadows.card,
          ]}
        >
          <View style={styles.patientCardTop}>
            <View style={styles.patientInfoRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={{ fontSize: 26 }}>👵</Text>
              </View>
              <View style={styles.patientNameCol}>
                <Text
                  style={[
                    styles.patientName,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  {activePatientName}
                </Text>
                <View style={styles.statusIndicatorRow}>
                  <View style={[styles.greenActiveDot, { backgroundColor: hasActivity ? '#16A34A' : '#9CA3AF' }]} />
                  <Text style={[styles.statusText, { color: hasActivity ? '#16A34A' : '#656F7D' }]}>
                    {hasActivity ? 'Active today' : 'Ready for exercises'}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? '#9CA3AF' : '#656F7D'}
            />
          </View>

          {/* REAL STATS ROW - No fake defaults */}
          <StatSummaryRow
            gamesToday={computedStats.gamesToday}
            avgAccuracy={computedStats.avgAccuracy !== null ? computedStats.avgAccuracy : '--'}
            playTimeMinutes={computedStats.totalPlayTimeMinutes}
          />

          {/* View Detailed Progress CTA Button */}
          <NoklaiButton
            title="View Detailed Progress"
            variant="primary"
            size="md"
            iconRight="arrow-forward"
            onPress={handleViewProgress}
            style={styles.ctaButton}
          />
        </TouchableOpacity>

        {/* AI Assistant Quick Banner */}
        <AIButton
          label="Noklai AI Assistant"
          sublabel={`Ask about ${activePatientName}'s cognitive progress & daily routine`}
          onPress={handleOpenAI}
        />

        {/* Quick Insights Highlight - Real Data Aware */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Today&apos;s Highlights
          </Text>
          <TouchableOpacity onPress={() => setActiveCaregiverSubScreen('insights')}>
            <Text style={styles.seeAllText}>View Insights</Text>
          </TouchableOpacity>
        </View>

        <NoklaiCard style={styles.insightHighlightCard}>
          <View style={styles.insightHighlightRow}>
            <View style={[styles.insightIconBadge, { backgroundColor: hasActivity ? '#DCFCE7' : '#EFF6FF' }]}>
              <Ionicons
                name={hasActivity ? 'trending-up' : 'game-controller-outline'}
                size={20}
                color={hasActivity ? '#16A34A' : '#2563EB'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.insightHighlightTitle,
                  { color: isDarkMode ? (hasActivity ? '#86EFAC' : '#93C5FD') : (hasActivity ? '#15803D' : '#1E40AF') },
                ]}
              >
                {hasActivity ? `${activePatientName} is engaging with games!` : 'Ready for first session'}
              </Text>
              <Text
                style={[
                  styles.insightHighlightBody,
                  { color: isDarkMode ? '#D1D5DB' : '#374151' },
                ]}
              >
                {hasActivity
                  ? `Completed ${computedStats.gamesToday} session(s) today with ${computedStats.avgAccuracy ?? 0}% overall accuracy.`
                  : `No gameplay recorded yet today. Suggesting Suh Tah Lam (Bamboo Rhythm) to start the day's cognitive routine.`}
              </Text>
            </View>
          </View>
        </NoklaiCard>

        {/* Recent Activity List - REAL SESSIONS ONLY */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Recent Activity
          </Text>
          {hasActivity && (
            <TouchableOpacity onPress={() => setActiveCaregiverSubScreen('history')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {hasActivity ? (
          <View style={styles.activityList}>
            {realRecentActivity.slice(0, 3).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.activityItem,
                  {
                    backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                  },
                ]}
              >
                <View style={[styles.activityIconCircle, { backgroundColor: '#F0ECF9' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.activityTitle,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    Played {item.game}
                  </Text>
                  <Text style={styles.activityTime}>{item.day} • {item.time}</Text>
                </View>
                <View style={styles.activityScoreBadge}>
                  <Text style={styles.activityScoreText}>{item.score}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <NoklaiCard style={styles.emptyActivityCard}>
            <Ionicons name="game-controller-outline" size={28} color="#9CA3AF" style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyActivityTitle, { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary }]}>
              No gameplay sessions yet
            </Text>
            <Text style={[styles.emptyActivitySub, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
              Once {activePatientName} completes brain exercises, authentic session accuracy and scores will appear here.
            </Text>
          </NoklaiCard>
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
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subGreetingText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  profileAvatarButton: {
    position: 'relative',
    marginTop: 4,
  },
  profileAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileBadgeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patientCard: {
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  patientCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientNameCol: {},
  patientName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusIndicatorRow: {
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
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: noklaiTheme.colors.primary,
  },
  insightHighlightCard: {
    padding: 14,
    borderRadius: noklaiTheme.radii.xl,
  },
  insightHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightHighlightTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  insightHighlightBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityScoreBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  emptyActivityCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: noklaiTheme.radii.xl,
  },
  emptyActivityTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
