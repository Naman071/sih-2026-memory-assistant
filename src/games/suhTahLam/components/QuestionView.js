/**
 * SUH TAH LAM - QuestionView (Modes 2 & 3: Sequence & Bamboo Movement Recall)
 *
 * Dementia-friendly multiple choice interface:
 * - Extra large touch targets (62dp height)
 * - Clear A, B, C, D letter badges
 * - High contrast, legible typography
 * - Fully reactive: subscribes to useLanguage() so labels update immediately
 *   when language is switched mid-game.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

const OPTION_BADGES = ['A', 'B', 'C', 'D'];

export default function QuestionView({
  question,
  isDarkMode = false,
  onAnswerSelected,
}) {
  const { t, currentLanguage } = useLanguage();
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const getOptionId = (option) => {
    return typeof option === 'object' && option !== null ? option.id : String(option);
  };

  const getOptionLabel = (option) => {
    if (typeof option === 'object' && option !== null) {
      return t(option.key, option.fallback || option.id, option.params);
    }
    return String(option);
  };

  const checkIsCorrect = (option) => {
    if (typeof option === 'object' && option !== null) {
      if (question.correctAnswerId) {
        return option.id === question.correctAnswerId;
      }
      return option.fallback === question.correctAnswer;
    }
    return option === question.correctAnswer;
  };

  const handleSelect = (option) => {
    if (isAnswered) return;
    const optId = getOptionId(option);
    setSelectedOptionId(optId);
    setIsAnswered(true);

    const isCorrect = checkIsCorrect(option);
    const label = getOptionLabel(option);
    onAnswerSelected && onAnswerSelected(label, isCorrect);
  };

  const correctOptionId = question.correctAnswerId || question.correctAnswer;
  const isSelectedCorrect = selectedOptionId !== null && (
    selectedOptionId === correctOptionId ||
    question.options?.some((opt) => getOptionId(opt) === selectedOptionId && checkIsCorrect(opt))
  );

  return (
    <View style={styles.container}>
      {/* Question Prompt Card */}
      <View style={[styles.promptCard, isDarkMode && styles.promptCardDark]}>
        <View style={styles.promptHeader}>
          <Ionicons name="help-circle-outline" size={24} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={[styles.domainBadge, isDarkMode && styles.domainBadgeDark]}>
            {question.domain === 'sequence'
              ? t('games.suhTahLam.domains.sequence', 'Sequence Memory')
              : question.domain === 'movement'
              ? t('games.suhTahLam.domains.movement', 'Bamboo Movement')
              : t('games.suhTahLam.domains.visual', 'Visual Recall')}
          </Text>
        </View>
        <Text style={[styles.promptText, isDarkMode && styles.textDark]}>
          {t(question.promptKey, question.fallbackPrompt || '')}
        </Text>
      </View>

      {/* Answer Options A, B, C, D */}
      <View style={styles.optionsList}>
        {(question.options || []).map((option, index) => {
          const optId = getOptionId(option);
          const optLabel = getOptionLabel(option);
          const isThisSelected = selectedOptionId === optId;
          const isThisCorrect = checkIsCorrect(option);

          let optionStyle = [styles.optionButton, isDarkMode && styles.optionButtonDark];
          let badgeStyle = [styles.optionBadge, isDarkMode && styles.optionBadgeDark];

          if (isAnswered) {
            if (isThisSelected) {
              if (isSelectedCorrect) {
                optionStyle.push(styles.optionCorrect);
                badgeStyle.push(styles.badgeCorrect);
              } else {
                optionStyle.push(styles.optionIncorrect);
                badgeStyle.push(styles.badgeIncorrect);
              }
            } else if (isThisCorrect) {
              optionStyle.push(styles.optionRevealedCorrect);
            }
          }

          return (
            <TouchableOpacity
              key={`opt_${optId}_${index}`}
              style={optionStyle}
              onPress={() => handleSelect(option)}
              disabled={isAnswered}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Option ${OPTION_BADGES[index]}: ${optLabel}`}
            >
              <View style={badgeStyle}>
                <Text style={styles.badgeText}>{OPTION_BADGES[index]}</Text>
              </View>
              <Text style={[styles.optionText, isDarkMode && styles.textDark]}>
                {optLabel}
              </Text>
              {isAnswered && isThisSelected && (
                <Ionicons
                  name={isSelectedCorrect ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={isSelectedCorrect ? '#16A34A' : '#D97706'}
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Warm Encouraging Feedback Banner */}
      {isAnswered && (
        <View style={[styles.feedbackBanner, isSelectedCorrect ? styles.feedbackCorrect : styles.feedbackEncourage]}>
          <Ionicons
            name={isSelectedCorrect ? 'sparkles' : 'heart'}
            size={22}
            color={isSelectedCorrect ? '#15803D' : '#B45309'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.feedbackText, isSelectedCorrect ? styles.feedbackTextCorrect : styles.feedbackTextEncourage]}>
            {isSelectedCorrect
              ? t('games.suhTahLam.feedback.correct', 'Well done! That was accurate.')
              : t('games.suhTahLam.feedback.encourage', 'Good try! Keep going.')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  promptCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  promptCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  domainBadgeDark: {
    color: '#60A5FA',
  },
  promptText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 28,
  },
  textDark: {
    color: '#F8FAFC',
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    height: 62, // Large 62dp touch target
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionButtonDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  optionBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionBadgeDark: {
    backgroundColor: '#334155',
  },
  badgeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3B82F6',
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  badgeCorrect: {
    backgroundColor: '#DCFCE7',
  },
  optionIncorrect: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  badgeIncorrect: {
    backgroundColor: '#FEF3C7',
  },
  optionRevealedCorrect: {
    borderColor: '#86EFAC',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackCorrect: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackEncourage: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackTextCorrect: {
    color: '#15803D',
  },
  feedbackTextEncourage: {
    color: '#92400E',
  },
});
