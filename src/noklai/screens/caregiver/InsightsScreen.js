import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';
import NoklaiButton from '../../components/NoklaiButton';
import QuoteCard from '../../components/QuoteCard';
import CaregiverAnalyticsScreen from '../../../screens/CaregiverAnalyticsScreen';

export default function InsightsScreen({ onBack, onNavigateToGames }) {
  const { isDarkMode } = useTheme();
  const {
    role,
    activePatientName,
    caregiverName,
    setActiveCaregiverSubScreen,
    setAiModalVisible,
    computedStats,
    analyticsData,
    allSessions = [],
  } = useNoklai();

  const isPatient = role === 'patient';
  const [shared, setShared] = useState(false);

  // If role is caregiver, show the full clinical-supportive Caregiver Analytics
  if (!isPatient) {
    return <CaregiverAnalyticsScreen onBack={onBack} />;
  }

  // Patient-facing View Logic
  const totalSessionsCount = (allSessions && allSessions.length) || (analyticsData?.totalSessions) || 0;
  const hasSessions = totalSessionsCount > 0;

  // Derive Vitality Level
  const vitalityScore = analyticsData?.vitalityIndex !== null && analyticsData?.vitalityIndex !== undefined
    ? analyticsData.vitalityIndex
    : (analyticsData?.overallAccuracy !== null && analyticsData?.overallAccuracy !== undefined
        ? analyticsData.overallAccuracy
        : null);

  const vitalityLevel = useMemo(() => {
    if (vitalityScore === null) return { title: 'Building Vitality', emoji: '🌱', color: '#16A34A', desc: 'Starting your cognitive routine' };
    if (vitalityScore >= 80) return { title: 'Peak Vitality', emoji: '🌟', color: '#EAB308', desc: 'Outstanding memory retention & sharpness!' };
    if (vitalityScore >= 65) return { title: 'Strong & Steady', emoji: '🌿', color: '#16A34A', desc: 'Great consistency and solid focus!' };
    if (vitalityScore >= 50) return { title: 'Active Routine', emoji: '⚡', color: '#2563EB', desc: 'Good rhythm, keep playing daily!' };
    return { title: 'Building Vitality', emoji: '🌱', color: '#0D9488', desc: 'Every exercise strengthens your brain pathways.' };
  }, [vitalityScore]);

  // Cognitive Domains for Patient
  const domainsList = useMemo(() => {
    const d = analyticsData?.domains || {};
    return [
      { key: 'visual_memory', label: 'Memory Recall', icon: 'images', score: d.visual_memory?.score ?? null, color: '#2563EB' },
      { key: 'attention_focus', label: 'Attention & Focus', icon: 'eye', score: d.attention_focus?.score ?? null, color: '#16A34A' },
      { key: 'processing_speed', label: 'Reaction Speed', icon: 'flash', score: d.processing_speed?.score ?? null, color: '#D97706' },
      { key: 'episodic_recall', label: 'Cultural Stories', icon: 'book', score: d.episodic_recall?.score ?? null, color: '#7C3AED' },
      { key: 'spatial_coordination', label: 'Spatial Awareness', icon: 'compass', score: d.spatial_coordination?.score ?? null, color: '#EA580C' },
    ];
  }, [analyticsData]);

  // Determine highest domain
  const bestDomain = useMemo(() => {
    if (!hasSessions) return null;
    const scored = domainsList.filter((d) => typeof d.score === 'number' && d.score > 0);
    if (scored.length === 0) return null;
    return scored.reduce((max, curr) => (curr.score > max.score ? curr : max), scored[0]);
  }, [domainsList, hasSessions]);

  // Share report
  const handleShareReport = async () => {
    try {
      const summary = `Noklai Memory Care Update for ${activePatientName}\nCaregiver: ${caregiverName}\n- Vitality Level: ${vitalityLevel.title}\n- Games Completed: ${totalSessionsCount}\n- Recall Accuracy: ${computedStats.avgAccuracy !== null ? `${computedStats.avgAccuracy}%` : 'Building baseline'}\n- Active Streak: ${computedStats.daysActiveThisWeek} days\n- Total Exercise Time: ${computedStats.totalPlayTimeMinutes} mins\nKeep up the wonderful daily routine!`;
      await Share.share({
        message: summary,
        title: `${activePatientName}'s Vitality Update`,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (e) {
      console.warn('Share error:', e);
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
        showBack={Boolean(onBack)}
        onBack={onBack || (() => setActiveCaregiverSubScreen(null))}
        title="Your Insights"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Greeting */}
        <View style={styles.headerTitleBox}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Brain Vitality
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            {hasSessions
              ? `Wonderful progress, ${activePatientName}! Here is how your mind is staying active.`
              : `Welcome, ${activePatientName}! Your brain insights will blossom as you play.`}
          </Text>
        </View>

        {/* EMPTY STATE IF NO GAMES PLAYED */}
        {!hasSessions ? (
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                borderColor: isDarkMode ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#143825' : '#DCFCE7' }]}>
              <Ionicons name="sparkles" size={36} color="#16A34A" />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Start Building Your Insights
            </Text>
            <Text
              style={[
                styles.emptyDesc,
                { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
              ]}
            >
              No gameplay data available yet. Complete a game to start seeing real performance insights.
            </Text>

            {onNavigateToGames && (
              <NoklaiButton
                title="Play Your First Game"
                variant="primary"
                icon="game-controller"
                size="lg"
                onPress={onNavigateToGames}
                style={styles.emptyActionBtn}
              />
            )}

            {/* Daily Recommendation Card */}
            <View
              style={[
                styles.recommendationBox,
                {
                  backgroundColor: isDarkMode ? '#19283E' : '#EFF6FF',
                  borderColor: isDarkMode ? '#26446E' : '#BFDBFE',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="sunny" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.recTitle, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
                  Today's Recommended Exercise
                </Text>
              </View>
              <Text style={[styles.recGameName, { color: isDarkMode ? '#FFFFFF' : '#1E3A8A' }]}>
                Dhopkhel Catch (Assamese Ball Toss)
              </Text>
              <Text style={[styles.recDetail, { color: isDarkMode ? '#DBEAFE' : '#2563EB' }]}>
                3-5 minutes of gentle reaction & focus practice to wake up your coordination.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* 1. VITALITY SCORE CARD */}
            <View
              style={[
                styles.vitalityHeroCard,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.vitalityHeroTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.levelTagRow}>
                    <Text style={styles.levelEmoji}>{vitalityLevel.emoji}</Text>
                    <Text style={[styles.levelTitle, { color: vitalityLevel.color }]}>
                      {vitalityLevel.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.levelDesc,
                      { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
                    ]}
                  >
                    {vitalityLevel.desc}
                  </Text>
                </View>

                {/* Score Gauge Circle */}
                <View style={[styles.scoreCircle, { borderColor: vitalityLevel.color }]}>
                  <Text
                    style={[
                      styles.scoreNumber,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    {vitalityScore !== null ? vitalityScore : '--'}
                  </Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
              </View>

              {/* 3 Progress Indicators */}
              <View
                style={[
                  styles.vitalsRow,
                  {
                    backgroundColor: isDarkMode ? '#172033' : '#F8FAFC',
                    borderColor: isDarkMode ? '#27354E' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.vitalMiniItem}>
                  <Text style={[styles.vitalMiniVal, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                    {totalSessionsCount}
                  </Text>
                  <Text style={styles.vitalMiniLbl}>Exercises Done</Text>
                </View>
                <View style={styles.vitalMiniDivider} />
                <View style={styles.vitalMiniItem}>
                  <Text style={[styles.vitalMiniVal, { color: '#16A34A' }]}>
                    {computedStats.daysActiveThisWeek} Days
                  </Text>
                  <Text style={styles.vitalMiniLbl}>Active Streak</Text>
                </View>
                <View style={styles.vitalMiniDivider} />
                <View style={styles.vitalMiniItem}>
                  <Text style={[styles.vitalMiniVal, { color: '#2563EB' }]}>
                    {computedStats.avgAccuracy !== null ? `${computedStats.avgAccuracy}%` : '--'}
                  </Text>
                  <Text style={styles.vitalMiniLbl}>Avg Accuracy</Text>
                </View>
              </View>
            </View>

            {/* 2. SUPERPOWER / BEST DOMAIN BANNER */}
            {bestDomain && (
              <View
                style={[
                  styles.superpowerBanner,
                  {
                    backgroundColor: isDarkMode ? '#2E2211' : '#FEF3C7',
                    borderColor: isDarkMode ? '#5E4116' : '#FDE68A',
                  },
                ]}
              >
                <Ionicons name="trophy" size={24} color="#D97706" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.superpowerTitle, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                    Your Superpower This Week
                  </Text>
                  <Text style={[styles.superpowerDesc, { color: isDarkMode ? '#FEF08A' : '#B45309' }]}>
                    {bestDomain.label} is your strongest cognitive domain ({bestDomain.score}% accuracy).
                  </Text>
                </View>
              </View>
            )}

            {/* 3. COGNITIVE DOMAINS BREAKDOWN */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionCardTitle,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                Your Brain Strengths
              </Text>
              <Text
                style={[
                  styles.sectionCardSub,
                  { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
                ]}
              >
                Gentle breakdown developed from your traditional game sessions.
              </Text>

              {domainsList.map((domain) => {
                const percent = domain.score !== null ? Math.min(100, Math.max(0, domain.score)) : 0;
                return (
                  <View key={domain.key} style={styles.domainItem}>
                    <View style={styles.domainHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.domainMiniIcon, { backgroundColor: `${domain.color}20` }]}>
                          <Ionicons name={domain.icon} size={15} color={domain.color} />
                        </View>
                        <Text
                          style={[
                            styles.domainLabel,
                            { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                          ]}
                        >
                          {domain.label}
                        </Text>
                      </View>
                      <Text style={[styles.domainScoreText, { color: domain.color }]}>
                        {domain.score !== null ? `${domain.score}%` : 'Awaiting data'}
                      </Text>
                    </View>
                    {/* Progress Bar */}
                    <View
                      style={[
                        styles.progressBarTrack,
                        { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percent}%`, backgroundColor: domain.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 4. RECENT SESSIONS SUMMARY */}
            {allSessions.length > 0 && (
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionCardTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  Recent Activities
                </Text>
                <Text
                  style={[
                    styles.sectionCardSub,
                    { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
                  ]}
                >
                  Completed exercises and joyful moments.
                </Text>

                {allSessions.slice(0, 4).map((session, index) => {
                  const dateStr = session.timestamp
                    ? new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : 'Recent';
                  return (
                    <View
                      key={session.id || `session_${index}`}
                      style={[
                        styles.sessionHistoryRow,
                        { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' },
                      ]}
                    >
                      <View style={[styles.sessionIconBox, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
                        <Ionicons name="ribbon-outline" size={20} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.sessionGameName,
                            { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                          ]}
                        >
                          {session.gameName || session.gameId || 'Brain Game'}
                        </Text>
                        <Text
                          style={[
                            styles.sessionDate,
                            { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
                          ]}
                        >
                          {dateStr} • {session.durationSec ? `${Math.round(session.durationSec / 60)} min` : 'Session'}
                        </Text>
                      </View>
                      <View style={styles.sessionScoreBadge}>
                        <Text style={styles.sessionScoreText}>
                          {session.accuracy !== null && session.accuracy !== undefined
                            ? `${session.accuracy}%`
                            : session.score !== null && session.score !== undefined
                            ? `${session.score} pts`
                            : '--'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 5. DAILY COGNITIVE RECOMMENDATION */}
            <View
              style={[
                styles.recommendationCard,
                {
                  backgroundColor: isDarkMode ? '#172B3E' : '#EFF6FF',
                  borderColor: isDarkMode ? '#244B6E' : '#BFDBFE',
                },
              ]}
            >
              <View style={styles.recCardHeader}>
                <Ionicons name="sparkles" size={22} color="#2563EB" />
                <Text style={[styles.recCardTitle, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
                  Today's Recommended Brain Exercise
                </Text>
              </View>
              <Text style={[styles.recGameHeading, { color: isDarkMode ? '#FFFFFF' : '#1E3A8A' }]}>
                Suh Tah Lam (Mizo Bamboo Rhythm)
              </Text>
              <Text style={[styles.recBodyText, { color: isDarkMode ? '#DBEAFE' : '#1E40AF' }]}>
                Listen to traditional folk rhythms and repeat bamboo sequences. Helps reinforce auditory working memory and sequence recall.
              </Text>
              {onNavigateToGames && (
                <TouchableOpacity
                  style={styles.playNowBtn}
                  onPress={onNavigateToGames}
                  activeOpacity={0.8}
                >
                  <Text style={styles.playNowBtnText}>Play This Exercise</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Action Buttons: AI Recommendation & Share */}
        <View style={styles.actionButtons}>
          <NoklaiButton
            title="Ask Noklai AI for Game Ideas"
            variant="primary"
            icon="sparkles"
            size="md"
            onPress={() => setAiModalVisible(true)}
            style={{ marginBottom: 12 }}
          />

          <NoklaiButton
            title={shared ? 'Progress Shared!' : 'Share Progress with Family'}
            variant="outline"
            icon="share-outline"
            size="md"
            onPress={handleShareReport}
          />
        </View>

        {/* Inspirational Motto Card */}
        <QuoteCard
          quote="Every gentle exercise brightens memory and keeps family stories alive."
          author="Noklai Memory Care"
        />
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
  headerTitleBox: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Empty state
  emptyStateCard: {
    padding: 24,
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyActionBtn: {
    width: '100%',
    marginBottom: 16,
  },
  recommendationBox: {
    width: '100%',
    padding: 16,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recGameName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  recDetail: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Vitality hero card
  vitalityHeroCard: {
    padding: 20,
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  vitalityHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  levelTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  levelTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  levelDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: -2,
  },
  vitalsRow: {
    flexDirection: 'row',
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  vitalMiniItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalMiniVal: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  vitalMiniLbl: {
    fontSize: 11,
    color: '#64748B',
  },
  vitalMiniDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },

  // Superpower banner
  superpowerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    marginBottom: 16,
  },
  superpowerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  superpowerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Section card
  sectionCard: {
    padding: 20,
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  sectionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionCardSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },

  // Domain breakdown
  domainItem: {
    marginBottom: 14,
  },
  domainHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainMiniIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  domainLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  domainScoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Session history
  sessionHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionGameName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
  },
  sessionScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },

  // Daily recommendation card
  recommendationCard: {
    padding: 18,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  recCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  recGameHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  recBodyText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  playNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  playNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },

  // Actions
  actionButtons: {
    marginVertical: 6,
  },
});
