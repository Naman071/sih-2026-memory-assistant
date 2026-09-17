import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';
import NoklaiButton from '../../components/NoklaiButton';
import QuoteCard from '../../components/QuoteCard';

export default function InsightsScreen({ onBack }) {
  const { isDarkMode } = useTheme();
  const {
    role,
    activePatientName,
    caregiverName,
    setActiveCaregiverSubScreen,
    setAiModalVisible,
    computedStats,
    analyticsData,
  } = useNoklai();

  const isPatient = role === 'patient';
  const [shared, setShared] = useState(false);

  const hasActivity = computedStats.totalPlayTimeMinutes > 0 || (computedStats.gamesToday > 0);

  const handleShareReport = async () => {
    try {
      const summary = `Noklai Memory Care Report for ${activePatientName}\nCaregiver: ${caregiverName}\n- Accuracy: ${computedStats.avgAccuracy !== null ? `${computedStats.avgAccuracy}%` : 'Awaiting gameplay'}\n- Weekly Delta: ${computedStats.accuracyWeeklyDelta}\n- Active Days: ${computedStats.daysActiveThisWeek} days\n- Play Time: ${computedStats.totalPlayTimeMinutes} minutes\n\nSummary: ${hasActivity ? 'Active routine maintenance and verified game sessions recorded.' : 'Awaiting initial game calibration.'}\nNotice: Non-clinical supportive cognitive tool.`;
      await Share.share({
        message: summary,
        title: `${activePatientName}'s Cognitive Summary`,
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
        title="Insights"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTitleBox}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Insights
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            {hasActivity
              ? (isPatient ? `Observations based on your recent brain game sessions.` : `Authentic observations based on ${activePatientName}'s gameplay.`)
              : (isPatient ? `Helpful suggestions for your daily memory routine.` : `Suggestions to start ${activePatientName}'s cognitive routine.`)}
          </Text>
        </View>

        {/* Suggestion Cards - Data Aware */}
        <View style={styles.cardsList}>
          {/* Card 1: Green Tint - Real performance status */}
          <View
            style={[
              styles.insightCard,
              {
                backgroundColor: isDarkMode ? '#1B2E22' : noklaiTheme.colors.insightGreenBg,
                borderColor: isDarkMode ? '#245235' : noklaiTheme.colors.insightGreenBorder,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="bar-chart" size={22} color="#16A34A" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#86EFAC' : '#14532D' }]}>
                {hasActivity
                  ? (isPatient ? `Great work, ${activePatientName}!` : `${activePatientName} is actively tracking!`)
                  : (isPatient ? `Welcome, ${activePatientName}!` : `Welcome, ${caregiverName}!`)}
              </Text>
              <Text style={[styles.cardMessage, { color: isDarkMode ? '#D1FAE5' : '#166534' }]}>
                {hasActivity
                  ? (isPatient
                      ? `You played ${computedStats.totalPlayTimeMinutes} minutes of brain games with an average accuracy of ${computedStats.avgAccuracy ?? 0}%.`
                      : `Recorded ${computedStats.totalPlayTimeMinutes} minutes of gameplay. Average accuracy is ${computedStats.avgAccuracy ?? 0}%.`)
                  : `Starting with 10-15 minutes of gentle cultural games daily helps keep your mind active and healthy.`}
              </Text>
            </View>
          </View>

          {/* Card 2: Blue Tint - Game Suggestion */}
          <View
            style={[
              styles.insightCard,
              {
                backgroundColor: isDarkMode ? '#19283E' : noklaiTheme.colors.insightBlueBg,
                borderColor: isDarkMode ? '#26446E' : noklaiTheme.colors.insightBlueBorder,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="bulb" size={22} color="#2563EB" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
                Try Suh Tah Lam Rhythm
              </Text>
              <Text style={[styles.cardMessage, { color: isDarkMode ? '#DBEAFE' : '#1E3A8A' }]}>
                Bamboo rhythm exercises stimulate auditory and visual sequence memory, which are beneficial for elder recall.
              </Text>
            </View>
          </View>

          {/* Card 3: Rose Tint - Routine Wellness */}
          <View
            style={[
              styles.insightCard,
              {
                backgroundColor: isDarkMode ? '#381C20' : noklaiTheme.colors.insightRoseBg,
                borderColor: isDarkMode ? '#5E262E' : noklaiTheme.colors.insightRoseBorder,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="heart" size={22} color="#E11D48" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#FDA4AF' : '#9F1239' }]}>
                Regular play helps
              </Text>
              <Text style={[styles.cardMessage, { color: isDarkMode ? '#FFE4E6' : '#881337' }]}>
                Consistent playtime can support better cognition and mood. Small daily sessions are more effective than infrequent long ones.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: AI Recommendation & Share Doctor Summary */}
        <View style={styles.actionButtons}>
          <NoklaiButton
            title="Ask AI for Custom Exercises"
            variant="primary"
            icon="sparkles"
            size="md"
            onPress={() => setAiModalVisible(true)}
            style={{ marginBottom: 12 }}
          />

          <NoklaiButton
            title={shared ? 'Report Copied / Shared!' : (isPatient ? 'Share Progress with Family' : 'Share Summary with Doctor')}
            variant="outline"
            icon="share-outline"
            size="md"
            onPress={handleShareReport}
          />
        </View>

        {/* Inspirational Motto Card */}
        <QuoteCard
          quote="Together for a brighter tomorrow."
          author="Culture Connects. Care Continues."
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
    lineHeight: 20,
  },
  cardsList: {
    gap: 14,
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    marginVertical: 10,
  },
});
