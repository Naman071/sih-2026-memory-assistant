import React, { useState } from 'react';
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
import NoklaiHeader from '../../components/NoklaiHeader';

export default function GamePerformanceScreen({ onBack, embedded = false }) {
  const { isDarkMode } = useTheme();
  const { activePatientName, setActiveCaregiverSubScreen, realGamePerformance } = useNoklai();

  const [expandedGame, setExpandedGame] = useState(null);

  const toggleExpand = (id) => {
    setExpandedGame(expandedGame === id ? null : id);
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
            Game Performance
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            {activePatientName}&apos;s verified performance in each game
          </Text>
        </View>
      )}

      {/* Games List - REAL DATA */}
      <View style={styles.gamesList}>
        {realGamePerformance.map((game) => {
          const isExpanded = expandedGame === game.id;
          const hasScore = typeof game.score === 'number';
          const scoreNum = hasScore ? Math.round(game.score) : null;
          const isHigh = hasScore && scoreNum >= 75;

          return (
            <TouchableOpacity
              key={game.id}
              activeOpacity={0.85}
              onPress={() => toggleExpand(game.id)}
              style={[
                styles.gameCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
                !isDarkMode && noklaiTheme.shadows.card,
              ]}
            >
              <View style={styles.gameMainRow}>
                <View
                  style={[
                    styles.gameIconBox,
                    {
                      backgroundColor: hasScore
                        ? isHigh
                          ? isDarkMode ? '#1C3322' : '#DCFCE7'
                          : isDarkMode ? '#3D2814' : '#FEF3C7'
                        : isDarkMode ? '#262D3B' : '#F1F3EE',
                    },
                  ]}
                >
                  <Ionicons
                    name={game.icon}
                    size={22}
                    color={hasScore ? (isHigh ? '#16A34A' : '#D97706') : '#9CA3AF'}
                  />
                </View>

                <View style={styles.gameTitleCol}>
                  <Text
                    style={[
                      styles.gameTitle,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    {game.name}
                  </Text>
                  <Text style={styles.gameCategoryText}>{game.category}</Text>
                </View>

                <View style={styles.scoreRow}>
                  <Text
                    style={[
                      styles.scoreNumber,
                      {
                        color: hasScore
                          ? isHigh
                            ? '#16A34A'
                            : '#D97706'
                          : isDarkMode
                          ? '#9CA3AF'
                          : '#656F7D',
                        fontSize: hasScore ? 18 : 13,
                        fontWeight: hasScore ? '800' : '600',
                      },
                    ]}
                  >
                    {hasScore ? `${scoreNum}%` : 'Not played yet'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                    size={18}
                    color={isDarkMode ? '#9CA3AF' : '#656F7D'}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </View>

              {/* Score Bar */}
              <View style={styles.scoreBarTrack}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: hasScore ? `${scoreNum}%` : '0%',
                      backgroundColor: hasScore ? (isHigh ? '#16A34A' : '#D97706') : '#CBD5E1',
                    },
                  ]}
                />
              </View>

              {/* Expanded details */}
              {isExpanded && (
                <View style={styles.expandedBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sessions Completed:</Text>
                    <Text style={styles.detailValue}>{game.sessionsCount || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, { color: hasScore ? '#16A34A' : '#9CA3AF' }]}>
                      {hasScore ? 'Actively calibrated' : 'Awaiting first play'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
        title="Game Performance"
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
  gamesList: {
    gap: 12,
  },
  gameCard: {
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    padding: 16,
  },
  gameMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gameTitleCol: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  gameCategoryText: {
    fontSize: 12,
    color: '#656F7D',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: '#E8EAE3',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  expandedBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#656F7D',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
});
