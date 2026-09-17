import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';
import NoklaiCard from '../../components/NoklaiCard';

export default function ActivityHistoryScreen({ onBack, embedded = false }) {
  const { isDarkMode } = useTheme();
  const { activePatientName, setActiveCaregiverSubScreen, realRecentActivity } = useNoklai();

  const todayActivities = realRecentActivity.filter((a) => a.day === 'Today');
  const yesterdayActivities = realRecentActivity.filter((a) => a.day === 'Yesterday');
  const earlierActivities = realRecentActivity.filter((a) => a.day === 'Earlier');

  const hasActivity = realRecentActivity && realRecentActivity.length > 0;

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.sectionContainer} key={title}>
        <Text
          style={[
            styles.dayHeading,
            { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
          ]}
        >
          {title}
        </Text>

        <View style={styles.itemsList}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.activityCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
                !isDarkMode && noklaiTheme.shadows.card,
              ]}
            >
              <View style={[styles.iconBadge, { backgroundColor: '#F0ECF9' }]}>
                <Ionicons name={item.icon || 'game-controller-outline'} size={20} color="#5B409E" />
              </View>

              <View style={styles.activityInfoCol}>
                <Text
                  style={[
                    styles.activityTitle,
                    { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                  ]}
                >
                  Played {item.game}
                </Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>

              <View style={styles.scorePill}>
                <Text style={styles.scoreText}>{item.score}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const content = (
    <View style={embedded ? styles.embeddedContainer : styles.standaloneContainer}>
      {!embedded && (
        <View style={styles.headerTitleBox}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Recent Activity
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            {activePatientName}&apos;s verified gameplay history
          </Text>
        </View>
      )}

      {hasActivity ? (
        <View>
          {renderSection('Today', todayActivities)}
          {renderSection('Yesterday', yesterdayActivities)}
          {renderSection('Earlier this week', earlierActivities)}
        </View>
      ) : (
        <NoklaiCard style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={36} color="#9CA3AF" style={{ marginBottom: 8 }} />
          <Text
            style={[
              styles.emptyTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            No recorded activities yet
          </Text>
          <Text style={[styles.emptySub, { color: isDarkMode ? '#9CA3AF' : '#656F7D' }]}>
            Completed brain game sessions will automatically appear here with timestamps and recall accuracy.
          </Text>
        </NoklaiCard>
      )}
    </View>
  );

  if (embedded) {
    return content;
  }

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
        onBack={onBack || (() => setActiveCaregiverSubScreen('progress'))}
        title="Recent Activity"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  standaloneContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  embeddedContainer: {
    paddingTop: 8,
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
    color: '#656F7D',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  dayHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemsList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityInfoCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#8A95A5',
  },
  scorePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: noklaiTheme.radii.sm,
  },
  scoreText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    borderRadius: noklaiTheme.radii.xl,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '85%',
  },
});
