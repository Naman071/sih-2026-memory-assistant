/**
 * SUH TAH LAM - ChangeDetectionView (Mode 5: Spot the Change)
 *
 * Shows original 3D scene -> Gentle transition -> Altered scene with ONE controlled change.
 * Fully reactive with useLanguage() so labels update immediately on language switch.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import PerspectiveStage from './PerspectiveStage';
import Environment3D from './Environment3D';
import BambooGroup3D from './BambooGroup3D';
import Character3D from './Character3D';
import { GRID_COORDINATES } from './SequencePlayer';

const CHANGE_OPTIONS_CONFIG = [
  { id: 'dancer_position', key: 'games.suhTahLam.changeOptions.dancer_position', fallback: 'Dancer position' },
  { id: 'bamboo_position', key: 'games.suhTahLam.changeOptions.bamboo_position', fallback: 'Bamboo position' },
  { id: 'performer_stance', key: 'games.suhTahLam.changeOptions.performer_stance', fallback: 'Performer stance' },
  { id: 'none', key: 'games.suhTahLam.changeOptions.none', fallback: 'Nothing changed' },
];

export default function ChangeDetectionView({
  changeScenario,
  isDarkMode = false,
  onComplete,
}) {
  const { t, currentLanguage } = useLanguage();
  const [phase, setPhase] = useState('observe'); // 'observe' | 'compare'
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const scenarioType = changeScenario?.type || 'dancer_position';

  const isAlteredDancer = phase === 'compare' && scenarioType === 'dancer_position';
  const isAlteredBamboo = phase === 'compare' && scenarioType === 'bamboo_position';
  const isAlteredPerformer = phase === 'compare' && scenarioType === 'performer_stance';

  const dancerPos = isAlteredDancer
    ? GRID_COORDINATES[6]
    : GRID_COORDINATES[5];

  const bambooLeftX = new Animated.Value(isAlteredBamboo ? -10 : -36);
  const bambooRightX = new Animated.Value(isAlteredBamboo ? 10 : 36);

  const handleReadyToCompare = () => {
    setPhase('compare');
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOptionId(opt.id);
    setIsAnswered(true);

    const isCorrect = opt.id === scenarioType;
    const label = t(opt.key, opt.fallback);
    onComplete && onComplete({
      chosenOption: label,
      correctOption: t(`games.suhTahLam.changeOptions.${scenarioType}`, scenarioType),
      isCorrect,
    });
  };

  const isSelectedCorrect = selectedOptionId === scenarioType;

  return (
    <View style={styles.container}>
      {/* 3D Scene */}
      <PerspectiveStage cameraMode="wide">
        <Environment3D isDarkMode={isDarkMode} />

        <BambooGroup3D
          leftPoleAnimX={bambooLeftX}
          rightPoleAnimX={bambooRightX}
        />

        <Character3D
          role="holder_left"
          positionX={-112}
          positionY={0}
          actionState={isAlteredPerformer ? 'step_left' : 'holding_bamboo'}
          isAltered={isAlteredPerformer}
        />

        <Character3D
          role="holder_right"
          positionX={112}
          positionY={0}
          actionState="holding_bamboo"
        />

        <Character3D
          role="dancer"
          positionX={dancerPos.x}
          positionY={dancerPos.y}
          actionState="idle"
          isAltered={isAlteredDancer}
        />
      </PerspectiveStage>

      {/* Phase 1: Observation Instructions */}
      {phase === 'observe' ? (
        <View style={[styles.instructionCard, isDarkMode && styles.cardDark]}>
          <View style={styles.headerRow}>
            <Ionicons name="search-outline" size={24} color="#059669" style={{ marginRight: 8 }} />
            <Text style={[styles.domainTitle, isDarkMode && styles.domainTitleDark]}>
              {t('games.suhTahLam.domains.change', 'Spot the Change')}
            </Text>
          </View>
          <Text style={[styles.mainPrompt, isDarkMode && styles.textDark]}>
            {t('games.suhTahLam.spotChangeIntro', 'Look closely at the scene. When ready, tap below.')}
          </Text>
          <TouchableOpacity
            style={styles.readyBtn}
            onPress={handleReadyToCompare}
            accessibilityRole="button"
            accessibilityLabel={t('games.suhTahLam.memorizedButton', 'I have observed the scene')}
          >
            <Text style={styles.readyBtnText}>{t('games.suhTahLam.memorizedButton', 'I have observed the scene')}</Text>
            <Ionicons name="arrow-forward" size={22} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Phase 2: Comparison Question & Options */
        <View style={styles.questionSection}>
          <View style={[styles.instructionCard, isDarkMode && styles.cardDark]}>
            <Text style={[styles.mainPrompt, isDarkMode && styles.textDark]}>
              {t('games.suhTahLam.whatChanged', 'Something changed. What changed?')}
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {CHANGE_OPTIONS_CONFIG.map((opt) => {
              const isThisSelected = selectedOptionId === opt.id;
              const isThisCorrect = opt.id === scenarioType;
              const optLabel = t(opt.key, opt.fallback);

              let btnStyle = [styles.optionCard, isDarkMode && styles.optionCardDark];
              if (isAnswered) {
                if (isThisSelected) {
                  btnStyle.push(isSelectedCorrect ? styles.optionCorrect : styles.optionIncorrect);
                } else if (isThisCorrect) {
                  btnStyle.push(styles.optionRevealed);
                }
              }

              return (
                <TouchableOpacity
                  key={`change_opt_${opt.id}`}
                  style={btnStyle}
                  onPress={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionLabel, isDarkMode && styles.textDark]}>{optLabel}</Text>
                  {isAnswered && isThisSelected && (
                    <Ionicons
                      name={isSelectedCorrect ? 'checkmark-circle' : 'alert-circle'}
                      size={22}
                      color={isSelectedCorrect ? '#16A34A' : '#D97706'}
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {isAnswered && (
            <View style={[styles.feedbackBanner, isSelectedCorrect ? styles.feedbackCorrect : styles.feedbackEncourage]}>
              <Ionicons
                name={isSelectedCorrect ? 'sparkles' : 'heart'}
                size={22}
                color={isSelectedCorrect ? '#15803D' : '#92400E'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.feedbackText, isSelectedCorrect ? styles.feedbackTextCorrect : styles.feedbackTextEncourage]}>
                {isSelectedCorrect
                  ? t('games.suhTahLam.feedback.changeCorrect', 'Sharp observation! You noticed the change.')
                  : t('games.suhTahLam.feedback.changeEncourage', 'Good attention to detail!')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  instructionCard: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cardDark: {
    backgroundColor: '#064E3B',
    borderColor: '#047857',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
  },
  domainTitleDark: {
    color: '#6EE7B7',
  },
  mainPrompt: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
  },
  textDark: {
    color: '#F8FAFC',
  },
  readyBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  readyBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionSection: {
    width: '100%',
  },
  optionsGrid: {
    width: '100%',
    marginTop: 12,
    gap: 10,
  },
  optionCard: {
    height: 60, // Large elder button
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optionCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  optionIncorrect: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  optionRevealed: {
    borderColor: '#86EFAC',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    width: '100%',
  },
  feedbackCorrect: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
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
