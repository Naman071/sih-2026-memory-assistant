/**
 * UBILAKAPKI - QuestionScreen Component
 * 
 * Dementia-friendly visual cognitive recall interface:
 * - Clear question prompt: "Who was holding the coconut at the end?"
 * - Large dignified player choice cards with regional names, attire hints, and color badges
 * - Generous 76px+ touch targets, zero timer pressure, calm reassurance
 * - Fully reactive multilingual localization (English, Assamese, Bengali, Hindi)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import {
  getLocalizedPlayerName,
  getLocalizedPlayerAttire,
  getLocalizedPrompt,
} from '../utils/localization.js';
import { PLAYER_ARCHETYPES } from '../data/players.js';

export function QuestionScreen({
  question,
  onSelectAnswer,
  selectedAnswer,
  isSubmitted,
}) {
  const { t, currentLanguage } = useLanguage();

  if (!question) return null;
  const options = Array.isArray(question.options) ? question.options : [];
  const promptHeading = getLocalizedPrompt(t);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Calming reassurance banner */}
        <View style={styles.reassuranceBanner}>
          <Text style={styles.reassuranceText}>
            {t('games.ubilakapki.takeYourTime') || 'Take your time • No rush'}
          </Text>
        </View>

        {/* Core Question Prompt */}
        <Text style={styles.promptHeading}>{promptHeading}</Text>

        {/* Player Choices */}
        <View style={styles.optionsList}>
          {options.map((playerId) => {
            const isSelected = selectedAnswer === playerId;
            const archetype =
              PLAYER_ARCHETYPES.find((p) => p.id === playerId) || {
                id: playerId,
                clothingColor: '#78350F',
              };

            const playerName = getLocalizedPlayerName(playerId, t, currentLanguage);
            const attireDesc = getLocalizedPlayerAttire(playerId, t, currentLanguage);

            return (
              <TouchableOpacity
                key={playerId}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => onSelectAnswer(playerId)}
                disabled={isSubmitted}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${playerName}, ${attireDesc}`}
              >
                {/* Visual Identity Color Badge */}
                <View
                  style={[
                    styles.playerBadge,
                    { backgroundColor: archetype.clothingColor },
                    isSelected && styles.playerBadgeSelected,
                  ]}
                >
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>

                {/* Player Identification Details */}
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.playerNameText,
                      isSelected && styles.playerNameTextSelected,
                    ]}
                  >
                    {playerName}
                  </Text>
                  {attireDesc ? (
                    <Text
                      style={[
                        styles.attireText,
                        isSelected && styles.attireTextSelected,
                      ]}
                    >
                      {attireDesc}
                    </Text>
                  ) : null}
                </View>

                {/* Selection Indicator Circle */}
                <View
                  style={[
                    styles.radioIndicator,
                    isSelected && styles.radioIndicatorSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioIndicatorInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  reassuranceBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reassuranceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  promptHeading: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  optionsList: {
    width: '100%',
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  optionCardSelected: {
    borderColor: '#B45309',
    backgroundColor: '#FFFBEB',
    borderWidth: 3,
    elevation: 5,
    shadowOpacity: 0.16,
  },
  playerBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  playerBadgeSelected: {
    borderColor: '#B45309',
    transform: [{ scale: 1.05 }],
  },
  badgeLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  playerNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  playerNameTextSelected: {
    color: '#92400E',
  },
  attireText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  attireTextSelected: {
    color: '#B45309',
    fontWeight: '600',
  },
  radioIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioIndicatorSelected: {
    borderColor: '#B45309',
  },
  radioIndicatorInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B45309',
  },
});

