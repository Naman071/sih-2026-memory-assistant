/**
 * SUH TAH LAM - Main Game Component
 *
 * Culturally Grounded 3D Cognitive Memory Exercise
 * Northeast Indian (Kuki/Nagaland) bamboo activity context.
 *
 * Orchestrates all 6 cognitive modes:
 * 1. OBSERVE: 3D bamboo & dancer animation
 * 2. SEQUENCE RECALL: "What happened first/next?"
 * 3. BAMBOO MOVEMENT RECALL: "How many times did bamboo close?"
 * 4. DANCER PATH MEMORY: 3x3 spatial grid path reconstruction
 * 5. SPOT THE CHANGE: Controlled scene alteration detection
 * 6. RECONSTRUCT THE SEQUENCE: Slot-based action builder
 *
 * Elderly-tailored:
 * - Zero time pressure, no buzzers, no "GAME OVER"
 * - High contrast, minimum 56dp touch targets
 * - Multi-dimensional cognitive scoring strictly hidden from patient
 * - Offline-first persistence via LocalPerformanceStorage
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

import { PerformanceTracker } from './engine/PerformanceTracker';
import { SessionManager } from './engine/SessionManager';
import { defaultSequenceManager } from './engine/SequenceManager';
import { defaultDifficultyEngine } from './engine/DifficultyEngine';
import { defaultLocalStorage } from './storage/LocalPerformanceStorage';

import SequencePlayer from './components/SequencePlayer';
import QuestionView from './components/QuestionView';
import RecallGrid from './components/RecallGrid';
import ChangeDetectionView from './components/ChangeDetectionView';
import SequenceReconstructView from './components/SequenceReconstructView';

export const GAME_STEPS = {
  START: 'START',
  OBSERVE: 'OBSERVE',
  QUESTION: 'QUESTION',
  GRID: 'GRID',
  CHANGE: 'CHANGE',
  RECONSTRUCT: 'RECONSTRUCT',
  RESULT: 'RESULT',
};

export default function SuhTahLamGame({ onExit }) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();

  const [currentStep, setCurrentStep] = useState(GAME_STEPS.START);
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [activeSequence, setActiveSequence] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const trackerRef = useRef(null);
  const sessionManagerRef = useRef(new SessionManager());

  useEffect(() => {
    const init = async () => {
      const tracker = new PerformanceTracker({
        gameId: 'suh_tah_lam',
        playerId: 'P001',
        difficultyEngine: defaultDifficultyEngine,
        storage: defaultLocalStorage,
      });

      const { currentDifficulty: diff } = await tracker.initialize();
      trackerRef.current = tracker;
      setCurrentDifficulty(diff || 'easy');
      sessionManagerRef.current.startSession({ initialDifficulty: diff });
      setIsInitializing(false);
    };

    init();

    return () => {
      if (trackerRef.current) {
        trackerRef.current.abandonRound();
      }
      sessionManagerRef.current.endSession();
    };
  }, []);

  const startNewRound = () => {
    const sequence = defaultSequenceManager.getNextSequence(currentDifficulty);
    const question = defaultSequenceManager.selectQuestion(sequence);

    setActiveSequence(sequence);
    setActiveQuestion(question);

    if (trackerRef.current) {
      trackerRef.current.startRound({
        difficulty: currentDifficulty,
        sequenceId: sequence.id,
      });
    }

    setCurrentStep(GAME_STEPS.OBSERVE);
  };

  const handleObserveFinished = () => {
    if (trackerRef.current) {
      trackerRef.current.recordRecallStart();
    }
    // Proceed to Question Recall
    setCurrentStep(GAME_STEPS.QUESTION);
  };

  const handleQuestionAnswered = (chosenOption, isCorrect) => {
    if (trackerRef.current && activeQuestion) {
      trackerRef.current.recordAnswer({
        domain: activeQuestion.domain || 'sequence',
        questionId: activeQuestion.id,
        chosenOption,
        correctOption: activeQuestion.correctAnswer,
        isCorrect,
      });
    }

    // Gentle delay to absorb feedback, then proceed to Spatial Grid
    setTimeout(() => {
      setCurrentStep(GAME_STEPS.GRID);
    }, 1400);
  };

  const handleGridCompleted = ({ chosenPath, correctPath, isCorrect }) => {
    if (trackerRef.current) {
      trackerRef.current.recordAnswer({
        domain: 'spatial',
        questionId: `${activeSequence?.id}_grid`,
        chosenOption: chosenPath.join(','),
        correctOption: correctPath.join(','),
        isCorrect,
      });
    }

    setTimeout(() => {
      setCurrentStep(GAME_STEPS.CHANGE);
    }, 1400);
  };

  const handleChangeDetected = ({ chosenOption, correctOption, isCorrect }) => {
    if (trackerRef.current) {
      trackerRef.current.recordAnswer({
        domain: 'change',
        questionId: `${activeSequence?.id}_change`,
        chosenOption,
        correctOption,
        isCorrect,
      });
    }

    setTimeout(() => {
      // In Easy mode, complete round here; in Medium/Hard, also do Sequence Reconstruction
      if (currentDifficulty === 'easy') {
        finishRound();
      } else {
        setCurrentStep(GAME_STEPS.RECONSTRUCT);
      }
    }, 1400);
  };

  const handleReconstructCompleted = ({ chosenSequence, correctSequence, isCorrect }) => {
    if (trackerRef.current) {
      trackerRef.current.recordAnswer({
        domain: 'sequence',
        questionId: `${activeSequence?.id}_reconstruct`,
        chosenOption: chosenSequence.join(','),
        correctOption: correctSequence.join(','),
        isCorrect,
      });
    }

    setTimeout(() => {
      finishRound();
    }, 1400);
  };

  const finishRound = async () => {
    if (trackerRef.current) {
      const result = await trackerRef.current.completeRound();
      if (result?.decision?.nextDifficulty) {
        setCurrentDifficulty(result.decision.nextDifficulty);
      }
    }
    sessionManagerRef.current.recordRoundCompleted();
    setCurrentStep(GAME_STEPS.RESULT);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onExit}
          accessibilityRole="button"
          accessibilityLabel="Back to game menu"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>{t('common.back', 'Back')}</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>SUH TAH LAM</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageSelector compact={true} />
          <TouchableOpacity
            style={[styles.soundBtn, { marginLeft: 6 }]}
            onPress={() => setSoundEnabled(!soundEnabled)}
            accessibilityRole="button"
            accessibilityLabel={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            <Ionicons
              name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
              size={22}
              color={theme.subText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Step: START SCREEN */}
        {currentStep === GAME_STEPS.START && (
          <View style={styles.startContainer}>
            <View style={[styles.cultureBadge, { backgroundColor: isDarkMode ? '#3B2716' : '#FEF3C7' }]}>
              <Ionicons name="sparkles" size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={[styles.cultureBadgeText, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                {t('games.suhTahLam.culturalCategory', 'Cultural Memory')}
              </Text>
            </View>

            <Text style={[styles.mainGameTitle, { color: theme.text }]}>SUH TAH LAM</Text>
            <Text style={[styles.tagline, { color: theme.subText }]}>
              {t('games.suhTahLam.tagline', 'Observe the rhythm, remember the movement.')}
            </Text>

            <View style={[styles.introCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.introText, { color: theme.text }]}>
                {t(
                  'games.suhTahLam.introDescription',
                  'Inspired by the traditional bamboo activities of Northeast India. Watch the synchronized bamboo poles and the dancer stepping between them, then answer calm memory questions.'
                )}
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="eye-outline" size={20} color="#3B82F6" style={{ marginRight: 10 }} />
                  <Text style={[styles.featureText, { color: theme.subText }]}>
                    {t('games.suhTahLam.featureObserve', '1. Observe the 3D bamboo rhythm')}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="footsteps-outline" size={20} color="#8B5CF6" style={{ marginRight: 10 }} />
                  <Text style={[styles.featureText, { color: theme.subText }]}>
                    {t('games.suhTahLam.featurePath', "2. Recall the dancer's footsteps")}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="sparkles-outline" size={20} color="#10B981" style={{ marginRight: 10 }} />
                  <Text style={[styles.featureText, { color: theme.subText }]}>
                    {t('games.suhTahLam.featureNoRush', '3. Take your time with zero rush')}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startExerciseBtn}
              onPress={startNewRound}
              accessibilityRole="button"
              accessibilityLabel="Start exercise"
            >
              <Text style={styles.startExerciseText}>{t('common.start', 'START EXERCISE')}</Text>
              <Ionicons name="play" size={22} color="#FFFFFF" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step: OBSERVE SCREEN */}
        {currentStep === GAME_STEPS.OBSERVE && activeSequence && (
          <SequencePlayer
            sequence={activeSequence}
            isDarkMode={isDarkMode}
            soundEnabled={soundEnabled}
            onComplete={handleObserveFinished}
            t={t}
          />
        )}

        {/* Step: QUESTION RECALL (Modes 2 & 3) */}
        {currentStep === GAME_STEPS.QUESTION && activeQuestion && (
          <QuestionView
            question={activeQuestion}
            isDarkMode={isDarkMode}
            onAnswerSelected={handleQuestionAnswered}
            t={t}
          />
        )}

        {/* Step: SPATIAL DANCER PATH (Mode 4) */}
        {currentStep === GAME_STEPS.GRID && activeSequence && (
          <RecallGrid
            targetPath={activeSequence.gridPath}
            isDarkMode={isDarkMode}
            onComplete={handleGridCompleted}
            t={t}
          />
        )}

        {/* Step: SPOT THE CHANGE (Mode 5) */}
        {currentStep === GAME_STEPS.CHANGE && activeSequence && (
          <ChangeDetectionView
            changeScenario={activeSequence.changeScenario}
            isDarkMode={isDarkMode}
            onComplete={handleChangeDetected}
            t={t}
          />
        )}

        {/* Step: RECONSTRUCT SEQUENCE (Mode 6) */}
        {currentStep === GAME_STEPS.RECONSTRUCT && activeSequence && (
          <SequenceReconstructView
            reconstructConfig={activeSequence.reconstructionSequence}
            isDarkMode={isDarkMode}
            onComplete={handleReconstructCompleted}
            t={t}
          />
        )}

        {/* Step: RESULT SCREEN */}
        {currentStep === GAME_STEPS.RESULT && (
          <View style={styles.resultContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={44} color="#15803D" />
            </View>

            <Text style={[styles.resultHeading, { color: theme.text }]}>
              {t('games.suhTahLam.roundCompleteTitle', 'Well done!')}
            </Text>

            <Text style={[styles.resultEncourageMsg, { color: theme.subText }]}>
              {t(
                'games.suhTahLam.roundCompleteMsg',
                'Your practice with rhythm, steps, and spatial paths helps maintain cognitive strength. Take a breath and enjoy another calm round.'
              )}
            </Text>

            <TouchableOpacity
              style={styles.continueNextBtn}
              onPress={startNewRound}
              accessibilityRole="button"
              accessibilityLabel="Continue to next round"
            >
              <Text style={styles.continueNextText}>{t('games.suhTahLam.nextRound', 'Next Rhythm')}</Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exitMenuBtn, { borderColor: theme.cardBorder }]}
              onPress={onExit}
              accessibilityRole="button"
              accessibilityLabel="Return to games menu"
            >
              <Text style={[styles.exitMenuText, { color: theme.subText }]}>
                {t('games.backToMenu', 'Back to Games')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
    height: 44,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },
  soundBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  startContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  cultureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  cultureBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainGameTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  introCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  startExerciseBtn: {
    width: '100%',
    height: 64, // Extra large elder touch target
    backgroundColor: '#D97706',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  startExerciseText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  resultContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  successIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#86EFAC',
  },
  resultHeading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  resultEncourageMsg: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  continueNextBtn: {
    width: '100%',
    height: 62,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  continueNextText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exitMenuBtn: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitMenuText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

