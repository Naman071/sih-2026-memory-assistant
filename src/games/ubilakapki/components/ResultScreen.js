/**
 * UBILAKAPKI - ResultScreen Component
 * 
 * Calm, dignified feedback screen:
 * - Positive reinforcement & compassionate non-punitive messaging
 * - Clear identification of the coconut carrier
 * - Large high-contrast touch actions: "Next Round" / "Back to Exercises"
 * - Fully multilingual (English, Assamese, Bengali, Hindi)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import {
  getLocalizedPlayerName,
  getLocalizedFeedback,
} from '../utils/localization.js';
import { PLAYER_ARCHETYPES } from '../data/players.js';

export function ResultScreen({
  isCorrect,
  selectedPlayerId,
  correctPlayerId,
  round = 1,
  streak = 0,
  difficulty = 'easy',
  onNextRound,
  onExitGame,
}) {
  const { t, currentLanguage } = useLanguage();

  const correctArchetype =
    PLAYER_ARCHETYPES.find((p) => p.id === correctPlayerId) || {
      id: correctPlayerId,
      clothingColor: '#78350F',
    };
  const correctName = getLocalizedPlayerName(correctPlayerId, t, currentLanguage);

  const headingText = isCorrect
    ? t('games.ubilakapki.wellRemembered') || 'Well Remembered!'
    : t('games.ubilakapki.goodTry') || "That's okay!";

  const explanationText = isCorrect
    ? `${correctName} ${t('games.ubilakapki.wasHolding') || 'was holding the coconut at the end!'}`
    : `${correctName} ${t('games.ubilakapki.wasHolding') || 'was holding the coconut.'} ${t('games.ubilakapki.tryAgainEncouragement') || "Let's try another round together!"}`;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Feedback Icon */}
        <View
          style={[
            styles.iconCircle,
            isCorrect ? styles.iconCircleSuccess : styles.iconCircleNeutral,
          ]}
        >
          <Ionicons
            name={isCorrect ? 'sparkles' : 'heart'}
            size={46}
            color={isCorrect ? '#15803D' : '#D97706'}
          />
        </View>

        {/* Primary Heading */}
        <Text
          style={[
            styles.headingText,
            isCorrect ? styles.headingSuccess : styles.headingNeutral,
          ]}
        >
          {headingText}
        </Text>

        {/* Supportive Description */}
        <Text style={styles.descriptionText}>{explanationText}</Text>

        {/* Player Identity Summary Card */}
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: correctArchetype.clothingColor },
            ]}
          >
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryLabel}>
              {t('games.ubilakapki.finalCarrier') || 'Final Coconut Carrier'}:
            </Text>
            <Text style={styles.summaryName}>{correctName}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNextRound}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('games.ubilakapki.nextRound') || 'Next Round'}
          >
            <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {t('games.ubilakapki.nextRound') || 'Next Round'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onExitGame}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('games.ubilakapki.backToExercises') || 'Back to Exercises'}
          >
            <Text style={styles.secondaryButtonText}>
              {t('games.ubilakapki.backToExercises') || 'Back to Exercises'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleNeutral: {
    backgroundColor: '#FEF3C7',
  },
  headingText: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  headingSuccess: {
    color: '#15803D',
  },
  headingNeutral: {
    color: '#B45309',
  },
  descriptionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D6A4F',
    borderRadius: 18,
    minHeight: 60,
    paddingHorizontal: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 17,
    fontWeight: '700',
  },
});

