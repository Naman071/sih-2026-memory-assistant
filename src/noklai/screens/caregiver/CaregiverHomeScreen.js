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
    caregiverAvatar,
    activePatientName,
    patientAvatar,
    setAiModalVisible,
    setActiveCaregiverSubScreen,
    computedStats,
    realRecentActivity,
    analyticsData,
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
              <Text style={{ fontSize: 22 }}>{caregiverAvatar}</Text>
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
                <Text style={{ fontSize: 26 }}>{patientAvatar}</Text>
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
                  {analyticsData && analyticsData.vitalityIndex !== null && analyticsData.vitalityIndex !== undefined && (
                    <View style={styles.cviMiniBadge}>
                      <Text style={styles.cviMiniBadgeText}>CVI: {analyticsData.vitalityIndex}%</Text>
                    </View>
                  )}
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

        {/* Cognitive Focus Areas (In Simple Terms) */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Cognitive Areas Practiced
          </Text>
        </View>

        <View style={styles.domainsGrid}>
          <View
            style={[
              styles.domainCard,
              {
                backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                borderColor: isDarkMode ? '#2D3545' : '#E5E7EB',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
          >
            <View style={[styles.domainIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="bulb-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={[styles.domainTitle, { color: isDarkMode ? '#E9D5FF' : '#4C1D95' }]}>
              Memory
            </Text>
            <Text style={[styles.domainDesc, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
              Recalling traditional patterns, scenic landmarks & folklore
            </Text>
          </View>

          <View
            style={[
              styles.domainCard,
              {
                backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                borderColor: isDarkMode ? '#2D3545' : '#E5E7EB',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
          >
            <View style={[styles.domainIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="eye-outline" size={20} color="#15803D" />
            </View>
            <Text style={[styles.domainTitle, { color: isDarkMode ? '#86EFAC' : '#15803D' }]}>
              Focus & Attention
            </Text>
            <Text style={[styles.domainDesc, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
              Tracking movements, rhythm steps & visual attention
            </Text>
          </View>

          <View
            style={[
              styles.domainCard,
              {
                backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                borderColor: isDarkMode ? '#2D3545' : '#E5E7EB',
              },
              !isDarkMode && noklaiTheme.shadows.card,
            ]}
          >
            <View style={[styles.domainIconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="hand-left-outline" size={20} color="#1D4ED8" />
            </View>
            <Text style={[styles.domainTitle, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
              Reaction & Coordination
            </Text>
            <Text style={[styles.domainDesc, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
              Gentle hand-eye rhythm and spatial decision timing
            </Text>
          </View>
        </View>

        {/* Supportive Suggestions for Caregivers */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Supportive Suggestions for Caregiver
          </Text>
        </View>

        <NoklaiCard style={styles.suggestionsCard}>
          <View style={styles.suggestionItem}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={styles.suggestionBullet} />
            <Text style={[styles.suggestionText, { color: isDarkMode ? '#E5E7EB' : '#374151' }]}>
              Encourage the patient to complete one short activity.
            </Text>
          </View>

          <View style={styles.suggestionItem}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={styles.suggestionBullet} />
            <Text style={[styles.suggestionText, { color: isDarkMode ? '#E5E7EB' : '#374151' }]}>
              Use familiar family photos or stories for memory conversations.
            </Text>
          </View>

          <View style={styles.suggestionItem}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={styles.suggestionBullet} />
            <Text style={[styles.suggestionText, { color: isDarkMode ? '#E5E7EB' : '#374151' }]}>
              Allow the patient to take breaks.
            </Text>
          </View>

          <View style={[styles.suggestionItem, { marginBottom: 0 }]}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={styles.suggestionBullet} />
            <Text style={[styles.suggestionText, { color: isDarkMode ? '#E5E7EB' : '#374151' }]}>
              Celebrate effort instead of focusing only on scores.
            </Text>
          </View>
        </NoklaiCard>

        {/* Clear Non-Medical Disclaimer */}
        <View
          style={[
            styles.disclaimerBox,
            {
              backgroundColor: isDarkMode ? '#17202A' : '#F8FAFC',
              borderColor: isDarkMode ? '#2E3D4F' : '#E2E8F0',
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color="#64748B" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.disclaimerText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
            NOKLAI provides supportive cognitive activities and progress insights. It does not diagnose dementia or replace professional medical advice.
          </Text>
        </View>
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
  cviMiniBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cviMiniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  domainsGrid: {
    gap: 10,
    marginBottom: 8,
  },
  domainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
  },
  domainIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  domainTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  domainDesc: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  suggestionsCard: {
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  suggestionBullet: {
    marginRight: 10,
    marginTop: 1,
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
});
