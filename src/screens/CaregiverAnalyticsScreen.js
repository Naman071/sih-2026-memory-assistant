import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Share,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import { cognitiveAnalytics, COGNITIVE_DOMAINS } from '../modules/performance/CognitiveAnalyticsService';

export default function CaregiverAnalyticsScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const {
    patientId,
    patientName,
    patientAge,
    caregiverName,
    caregiverPhone,
    relationship,
  } = usePatient();

  const [timeframe, setTimeframe] = useState('7d'); // '7d' | '30d' | 'all'
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Patient info object for analytics calculations
  const patientInfo = useMemo(() => ({
    patientId,
    patientName: patientName || t('analytics.defaultPatient', 'Elder Patient'),
    patientAge: patientAge || '72',
    caregiverName: caregiverName || t('analytics.defaultCaregiver', 'Family Caregiver'),
    caregiverPhone,
    relationship: relationship || t('analytics.defaultRel', 'Caregiver'),
  }), [patientId, patientName, patientAge, caregiverName, caregiverPhone, relationship, t]);

  // Load analytics data
  const loadData = useCallback(async () => {
    try {
      const data = await cognitiveAnalytics.getCaregiverDashboardData(timeframe, patientInfo);
      setDashboardData(data);
    } catch (err) {
      console.warn('Error loading caregiver analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeframe, patientInfo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  // Generate doctor / caregiver summary
  const summaryReportText = useMemo(() => {
    if (!dashboardData) return '';
    return cognitiveAnalytics.generateClinicianSummary(dashboardData, patientInfo);
  }, [dashboardData, patientInfo]);

  // Share report via system share sheet
  const handleShareReport = async () => {
    if (!summaryReportText) return;
    try {
      await Share.share({
        message: summaryReportText,
        title: `${patientInfo.patientName} - Cognitive Progress Report`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleCopyModalText = () => {
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary || '#2563EB'} />
          <Text style={[styles.loadingText, { color: theme.subText }]}>
            {t('analytics.loading', 'Loading cognitive health analytics...')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    vitalityIndex = null,
    cviEvaluation = null,
    growthPercent = 0,
    trendLabel = 'Awaiting Data',
    overallAccuracy = null,
    avgSpeed = null,
    exerciseMinutes = 0,
    totalSessions = 0,
    streakDays = 0,
    domains = {},
    clinicalObservations = [],
    gameBreakdown = [],
    isCalibrated = false,
    lastSessionAt = null,
    disclaimer = 'Cognitive Vitality Index is a gameplay progress indicator based on completed cognitive game activity. It is not a medical diagnosis or clinical assessment.',
  } = dashboardData || {};

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Caregiver Header Card */}
        <View style={[styles.patientHeaderCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.patientHeaderTop}>
            <View style={[styles.patientAvatar, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="medical" size={24} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.patientNameText, { color: theme.text }]} numberOfLines={1}>
                  {patientInfo.patientName}
                </Text>
                <View style={[styles.ageBadge, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                  <Text style={[styles.ageBadgeText, { color: theme.text }]}>
                    {patientInfo.patientAge} {t('analytics.yearsOld', 'yrs')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.caregiverSubText, { color: theme.subText }]}>
                {t('analytics.monitoredBy', 'Monitored by:')} {patientInfo.caregiverName} ({patientInfo.relationship})
              </Text>
            </View>
            <View style={[styles.shieldBadge, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.shieldBadgeText}>{t('analytics.verified', 'Active')}</Text>
            </View>
          </View>

          {/* Timeframe Filter Pills */}
          <View style={styles.timeframeRow}>
            {[
              { id: '7d', label: t('analytics.timeframe7d', '7 Days') },
              { id: '30d', label: t('analytics.timeframe30d', '30 Days') },
              { id: 'all', label: t('analytics.timeframeAll', 'All Time') },
            ].map((tf) => {
              const active = timeframe === tf.id;
              return (
                <TouchableOpacity
                  key={tf.id}
                  style={[
                    styles.timeframePill,
                    {
                      backgroundColor: active
                        ? theme.primary || '#2563EB'
                        : isDarkMode
                        ? '#1F2937'
                        : '#F3F4F6',
                    },
                  ]}
                  onPress={() => setTimeframe(tf.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      { color: active ? '#FFFFFF' : theme.subText, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* NON-MEDICAL DISCLAIMER BANNER */}
        <View style={[styles.disclaimerBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7', borderColor: isDarkMode ? '#334155' : '#FDE68A' }]}>
          <Ionicons name="information-circle-outline" size={18} color="#D97706" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.disclaimerText, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
            {disclaimer}
          </Text>
        </View>

        {/* SECTION 1: Cognitive Vitality Index */}
        <View style={[styles.vitalityCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.vitalityHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('analytics.vitalityTitle', 'Cognitive Vitality Index')}
              </Text>
              <Text style={[styles.sectionSub, { color: theme.subText }]}>
                {t('analytics.vitalitySub', 'Composite gameplay progress indicator: 70% accuracy + 30% consistency')}
              </Text>
            </View>
            {isCalibrated && (
              <View style={[styles.trendBadge, { backgroundColor: growthPercent >= 0 ? '#D1FAE5' : '#FEE2E2' }]}>
                <Ionicons
                  name={growthPercent >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={growthPercent >= 0 ? '#059669' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.trendBadgeText,
                    { color: growthPercent >= 0 ? '#059669' : '#DC2626' },
                  ]}
                >
                  {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`} {t('analytics.growth', 'Trend')}
                </Text>
              </View>
            )}
          </View>

          {isCalibrated && vitalityIndex !== null ? (
            <View style={styles.scoreRow}>
              <View style={[styles.scoreCircle, { borderColor: theme.primary || '#2563EB' }]}>
                <Text style={[styles.scoreNumber, { color: theme.text }]}>{vitalityIndex}</Text>
                <Text style={[styles.scoreOutOf, { color: theme.subText }]}>/ 100</Text>
              </View>
              <View style={styles.scoreDetails}>
                <View style={[styles.statusTag, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                  <Ionicons name="sparkles" size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={[styles.statusTagText, { color: theme.text }]}>
                    {trendLabel}
                  </Text>
                </View>
                <Text style={[styles.vitalityExplanation, { color: theme.subText }]}>
                  Calculated from {cviEvaluation?.validRounds || totalSessions} verified rounds: {Math.round((cviEvaluation?.accuracyScore || 0) * 100)}% accuracy (70%) + {Math.round((cviEvaluation?.completionConsistencyScore || 0) * 100)}% consistency (30%).{cviEvaluation?.gamesIncluded?.length > 0 ? ` Integrated across ${cviEvaluation.gamesIncluded.length} cognitive game${cviEvaluation.gamesIncluded.length > 1 ? 's' : ''}.` : ''}
                </Text>
                {lastSessionAt && (
                  <Text style={[styles.lastUpdatedText, { color: theme.subText }]}>
                    Last session: {new Date(lastSessionAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.insufficientDataContainer}>
              <View style={[styles.insufficientCircle, { borderColor: '#D97706' }]}>
                <Text style={[styles.insufficientCount, { color: '#D97706' }]}>
                  {cviEvaluation?.validRounds || 0}/{cviEvaluation?.requiredRounds || 3}
                </Text>
                <Text style={[styles.insufficientLabel, { color: theme.subText }]}>rounds</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.insufficientHeading, { color: theme.text }]}>
                  Gathering Gameplay Baseline
                </Text>
                <Text style={[styles.insufficientDesc, { color: theme.subText }]}>
                  {cviEvaluation?.message || 'Complete at least 3 valid rounds of cognitive games to calculate your gameplay progress score.'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* SECTION 2: 4 Key Cognitive Vital Signs */}
        <View style={styles.vitalSignsGrid}>
          {/* Card 1: Accuracy */}
          <View style={[styles.vitalSignCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.vitalIconWrap, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
              <Ionicons name="checkmark-done" size={20} color="#059669" />
            </View>
            <Text style={[styles.vitalValue, { color: theme.text }]}>
              {overallAccuracy !== null ? `${overallAccuracy}%` : '--'}
            </Text>
            <Text style={[styles.vitalLabel, { color: theme.subText }]}>{t('analytics.recallAccuracy', 'Recall Accuracy')}</Text>
            <Text style={[styles.vitalHint, { color: '#059669' }]}>
              {overallAccuracy !== null ? t('analytics.retentionGood', 'High Stability') : 'Awaiting data'}
            </Text>
          </View>

          {/* Card 2: Speed */}
          <View style={[styles.vitalSignCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.vitalIconWrap, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
              <Ionicons name="timer-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.vitalValue, { color: theme.text }]}>
              {avgSpeed !== null ? `${avgSpeed}s` : '--'}
            </Text>
            <Text style={[styles.vitalLabel, { color: theme.subText }]}>{t('analytics.processingPace', 'Response Pace')}</Text>
            <Text style={[styles.vitalHint, { color: '#D97706' }]}>
              {avgSpeed !== null ? t('analytics.thoughtfulPace', 'Thoughtful & Fluid') : 'Awaiting data'}
            </Text>
          </View>

          {/* Card 3: Total Exercise Time */}
          <View style={[styles.vitalSignCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.vitalIconWrap, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="time-outline" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.vitalValue, { color: theme.text }]}>{exerciseMinutes}m</Text>
            <Text style={[styles.vitalLabel, { color: theme.subText }]}>{t('analytics.exerciseMinutes', 'Exercise Time')}</Text>
            <Text style={[styles.vitalHint, { color: '#2563EB' }]}>{totalSessions} {t('analytics.sessions', 'sessions')}</Text>
          </View>

          {/* Card 4: Active Streak */}
          <View style={[styles.vitalSignCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.vitalIconWrap, { backgroundColor: isDarkMode ? '#3B0764' : '#F3E8FF' }]}>
              <Ionicons name="flame-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={[styles.vitalValue, { color: theme.text }]}>{streakDays} {t('analytics.days', 'days')}</Text>
            <Text style={[styles.vitalLabel, { color: theme.subText }]}>{t('analytics.routineStreak', 'Daily Routine')}</Text>
            <Text style={[styles.vitalHint, { color: '#7C3AED' }]}>{t('analytics.engaged', 'Active Engagement')}</Text>
          </View>
        </View>

        {/* SECTION 3: Cognitive Domain Health (4 Pillars) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('analytics.domainsTitle', 'Cognitive Domain Health')}
          </Text>
          <Text style={[styles.sectionSub, { color: theme.subText, marginBottom: 16 }]}>
            {t('analytics.domainsSub', 'Targeted neuro-cognitive breakdown derived from cultural exercises')}
          </Text>

          {Object.entries(domains).map(([domainKey, dInfo]) => {
            const domainScore = dInfo.score !== null && dInfo.score !== undefined ? dInfo.score : null;
            const domainDef = COGNITIVE_DOMAINS[domainKey.toUpperCase()] || COGNITIVE_DOMAINS.VISUAL_MEMORY;
            const barColor = domainDef.color || '#2563EB';

            return (
              <View key={domainKey} style={styles.domainRow}>
                <View style={styles.domainInfoTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={domainDef.icon} size={18} color={barColor} style={{ marginRight: 8 }} />
                    <Text style={[styles.domainName, { color: theme.text }]}>
                      {t(domainDef.nameKey, domainDef.defaultName)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.domainScore, { color: domainScore !== null ? barColor : theme.subText }]}>
                      {domainScore !== null ? `${domainScore}%` : '--'}
                    </Text>
                    <View style={[styles.domainBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.domainBadgeText, { color: theme.subText }]}>{dInfo.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                  {domainScore !== null && (
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: barColor,
                          width: `${Math.min(100, Math.max(10, domainScore))}%`,
                        },
                      ]}
                    />
                  )}
                </View>
                <Text style={[styles.domainDesc, { color: theme.subText }]}>
                  {domainDef.description}
                </Text>
              </View>
            );
          })}
        </View>

        {/* SECTION 4: Clinical Caregiver Observations */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="clipboard-outline" size={22} color={theme.primary || '#2563EB'} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('analytics.observationsTitle', 'Clinical Caregiver Observations')}
            </Text>
          </View>
          <Text style={[styles.sectionSub, { color: theme.subText, marginBottom: 14 }]}>
            {t('analytics.observationsSub', 'Objective behavioral and cognitive indicators formulated for caregivers')}
          </Text>

          {clinicalObservations.map((obs, idx) => (
            <View
              key={idx}
              style={[
                styles.observationItem,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <Ionicons name={obs.icon} size={20} color={obs.color} style={styles.obsIcon} />
              <Text style={[styles.obsText, { color: theme.text }]}>{obs.text}</Text>
            </View>
          ))}
        </View>

        {/* SECTION 5: Activity & Game Mastery Breakdown */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('analytics.masteryTitle', 'Game Mastery & Adaptive Levels')}
          </Text>
          <Text style={[styles.sectionSub, { color: theme.subText, marginBottom: 14 }]}>
            {t('analytics.masterySub', 'Patient engagement performance across each cultural exercise')}
          </Text>

          {gameBreakdown.map((g, idx) => (
            <View
              key={idx}
              style={[
                styles.gameItem,
                {
                  borderBottomColor: theme.cardBorder,
                  borderBottomWidth: idx < gameBreakdown.length - 1 ? 1 : 0,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.gameNameText, { color: theme.text }]}>{g.gameName}</Text>
                <Text style={[styles.gameMetaText, { color: theme.subText }]}>
                  {g.sessionsCount} {t('analytics.sessions', 'sessions')} · {t('analytics.level', 'Level')}:{' '}
                  <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{g.difficulty || 'Easy'}</Text>
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.gameAccuracyText, { color: '#059669' }]}>
                  {g.accuracy !== null ? `${g.accuracy}%` : '--'}
                </Text>
                <Text style={[styles.gameSpeedText, { color: theme.subText }]}>
                  {g.avgSpeed !== null ? `${g.avgSpeed}s ${t('analytics.avgPace', 'avg')}` : 'Awaiting data'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* SECTION 6: Clinician Progress Summary Actions */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: theme.primary || '#2563EB' }]}
            onPress={handleShareReport}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Share Clinician Summary Report"
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionBtnText}>
              {t('analytics.shareReportBtn', 'Share Doctor Summary Report')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { borderColor: theme.cardBorder, backgroundColor: theme.cardBackground }]}
            onPress={() => setShowReportModal(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="View Full Medical Progress Note"
          >
            <Ionicons name="document-text-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryActionBtnText, { color: theme.text }]}>
              {t('analytics.viewReportNote', 'View Full Clinical Note')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Full Clinical Progress Note */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="medical" size={22} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {t('analytics.clinicalProgressNote', 'Clinical Progress Note')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={26} color={theme.subText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator>
              <Text style={[styles.reportCodeText, { color: theme.text, backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
                {summaryReportText}
              </Text>
            </ScrollView>

            {copiedNotice && (
              <View style={styles.copiedBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
                <Text style={styles.copiedBannerText}>{t('analytics.reportReady', 'Ready to share with physician')}</Text>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalShareBtn, { backgroundColor: theme.primary || '#2563EB' }]}
                onPress={handleShareReport}
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalShareBtnText}>{t('analytics.shareBtn', 'Share')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={[styles.modalCloseBtnText, { color: theme.text }]}>{t('common.close', 'Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  patientHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  patientHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: 160,
  },
  ageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caregiverSubText: {
    fontSize: 13,
    marginTop: 2,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shieldBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  timeframeRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  timeframePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  timeframeText: {
    fontSize: 13,
  },
  vitalityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  vitalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 13,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  scoreOutOf: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreDetails: {
    flex: 1,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  vitalityExplanation: {
    fontSize: 12,
    lineHeight: 17,
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vitalSignCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    elevation: 1,
  },
  vitalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  vitalLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  vitalHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  domainRow: {
    marginBottom: 14,
  },
  domainInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '600',
  },
  domainScore: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  domainBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  domainBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  domainDesc: {
    fontSize: 11,
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  obsIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  obsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  gameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gameNameText: {
    fontSize: 15,
    fontWeight: '600',
  },
  gameMetaText: {
    fontSize: 12,
    marginTop: 2,
  },
  gameAccuracyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameSpeedText: {
    fontSize: 11,
    marginTop: 1,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  reportCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
    borderRadius: 10,
  },
  copiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
  },
  copiedBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalShareBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalShareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalCloseBtn: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  modalCloseBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  insufficientDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  insufficientCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insufficientCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insufficientLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insufficientHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  insufficientDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  lastUpdatedText: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

