/**
 * UBILAKAPKI - Culturally Inspired 3D Cognitive Memory Game
 * React Native | 3D / WebGL | Offline-First | Adaptive Performance
 * 
 * Designed for elderly individuals & dementia patients in Northeast India:
 * - Traditional Northeast Indian coconut passing game
 * - Realistic 3D kinematics, circular arena, and physical arc trajectory
 * - Zero timer pressure, dignified calming feedback
 * - Centralized PerformanceTracker integration with Supabase persistence
 * - Multilingual: English, Assamese, Bengali, and Hindi
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThreeSceneView } from './components/ThreeSceneView.js';
import { QuestionScreen } from './components/QuestionScreen.js';
import { ResultScreen } from './components/ResultScreen.js';
import { PauseMenu } from './components/PauseMenu.js';
import { SessionManager } from './engine/SessionManager.js';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePatient } from '../../context/PatientContext';
import { PerformanceTracker } from '../../modules/performance';
import LanguageSelector from '../../components/LanguageSelector';
import { REGIONS, DEFAULT_REGION } from './data/regions.js';

const SCREENS = {
  INTRO: 'intro',
  OBSERVE: 'observe',
  QUESTION: 'question',
  RESULT: 'result',
};

export default function UbilakapkiGame({ onExit }) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { currentPatientId, patientId } = usePatient?.() || {};
  const activePlayerId = currentPatientId || patientId || 'P001';

  // Centralized Adaptive Performance Tracker
  const trackerRef = useRef(null);
  if (!trackerRef.current) {
    trackerRef.current = new PerformanceTracker({
      gameType: 'ubilakapki',
      playerId: activePlayerId,
    });
  }

  // Session & Stage Refs
  const sessionManagerRef = useRef(new SessionManager());
  const stageRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Gameplay State
  const [currentScreen, setCurrentScreen] = useState(SCREENS.INTRO);
  const [roundData, setRoundData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseMenuVisible, setPauseMenuVisible] = useState(false);
  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);
  const [caregiverStats, setCaregiverStats] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [regionId, setRegionId] = useState('assam');
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');

  // Sound Synthesizer (Soft natural percussion for catch & chime for success)
  const playCatchSound = useCallback(() => {
    if (!soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current && AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        if (audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);

          osc.start(now);
          osc.stop(now + 0.09);
        }
      } catch (e) {
        // Safe audio fallback
      }
    }
  }, [soundEnabled]);

  const playSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current && AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        if (audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);

          osc.start(now);
          osc.stop(now + 0.32);
        }
      } catch (e) {
        // Safe audio fallback
      }
    }
  }, [soundEnabled]);

  // Initialize Session on Mount
  useEffect(() => {
    let isMounted = true;
    sessionManagerRef.current.startSession('easy');

    trackerRef.current
      ?.initialize({ playerId: activePlayerId, initialDifficulty: 'easy' })
      .then(() => {
        if (isMounted) {
          if (trackerRef.current?.profile?.currentDifficulty) {
            const savedDiff = trackerRef.current.profile.currentDifficulty;
            sessionManagerRef.current.difficultyEngine.setLevel(savedDiff);
            setCurrentDifficulty(savedDiff);
          }
          setCaregiverStats(trackerRef.current.getCaregiverProfile());
        }
      })
      .catch((err) => {
        console.warn('Ubilakapki PerformanceTracker initialize notice:', err);
      });

    return () => {
      isMounted = false;
      trackerRef.current?.endSession();
    };
  }, [activePlayerId]);

  // Start Next Round (Automatically guided by DifficultyEngine)
  const startRound = useCallback(() => {
    const nextData = sessionManagerRef.current.startNextRound();
    setRoundData(nextData);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsPaused(false);
    setCurrentDifficulty(nextData.difficulty);
    setCurrentScreen(SCREENS.OBSERVE);

    // Track round start in centralized PerformanceTracker
    trackerRef.current?.startRound({
      difficulty: nextData.difficulty,
      sequenceLength: nextData.sequence?.passes?.length || 4,
      metadata: {
        playerCount: nextData.sequence?.playerCount || 3,
        finalHolder: nextData.sequence?.finalHolder,
      },
    });

    // Mount sequence into the stage
    setTimeout(() => {
      if (stageRef.current && nextData.sequence) {
        stageRef.current.playSequence(nextData.sequence);
      }
    }, 450);
  }, []);

  // Sequence Finished Callback from 3D Viewport
  const handleSequenceFinished = useCallback(() => {
    setTimeout(() => {
      setCurrentScreen(SCREENS.QUESTION);
      trackerRef.current?.recordRecallStart();
      sessionManagerRef.current.recordRecallStart();
    }, 500);
  }, []);

  // Answer Submission Handler
  const handleSelectAnswer = useCallback(
    async (playerId) => {
      if (isSubmitted) return;
      setIsSubmitted(true);
      setSelectedAnswer(playerId);

      const correct = playerId === roundData?.question?.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        playSuccessChime();
      }

      // Record in local session engine
      const roundResult = await sessionManagerRef.current.endRound(playerId, correct);

      // Record in centralized adaptive PerformanceTracker
      if (trackerRef.current) {
        trackerRef.current.recordAnswer({
          chosenAnswer: playerId,
          correctAnswer: roundData?.question?.correctAnswer,
          isCorrect: correct,
          metadata: {
            playerCount: roundData?.sequence?.playerCount,
            difficulty: roundData?.difficulty,
          },
        });

        try {
          const res = await trackerRef.current.completeRound();
          if (res?.decision?.nextDifficulty) {
            sessionManagerRef.current.difficultyEngine.setLevel(res.decision.nextDifficulty);
            setCurrentDifficulty(res.decision.nextDifficulty);
          }
          setCaregiverStats(trackerRef.current.getCaregiverProfile());
        } catch (e) {
          console.warn('Centralized completeRound notice:', e);
        }
      }

      // Transition to Result Screen
      setTimeout(() => {
        setCurrentScreen(SCREENS.RESULT);
      }, 350);
    },
    [isSubmitted, roundData, playSuccessChime]
  );

  // Pause / Resume Handlers
  const handlePauseRequest = useCallback(() => {
    setIsPaused(true);
    setPauseMenuVisible(true);
    stageRef.current?.pause();
    sessionManagerRef.current.pause();
    trackerRef.current?.recordEvent('round_paused');
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    setPauseMenuVisible(false);
    stageRef.current?.resume();
    sessionManagerRef.current.resume();
    trackerRef.current?.recordEvent('round_resumed');
  }, []);

  const handleExitGame = useCallback(async () => {
    setPauseMenuVisible(false);
    if (roundData && currentScreen === SCREENS.OBSERVE) {
      trackerRef.current?.abandonRound();
    }
    // Explicitly persist the current analyzed difficulty level so it's safely saved in stats
    if (trackerRef.current) {
      const activeProf = trackerRef.current.profile || {};
      const currentLevel = sessionManagerRef.current.difficultyEngine.getLevel();
      const updatedProf = {
        ...activeProf,
        playerId: activePlayerId,
        gameType: 'ubilakapki',
        currentDifficulty: currentLevel,
        updatedAt: new Date().toISOString(),
      };
      await trackerRef.current.performanceService?.saveProfile(updatedProf).catch(() => {});
      trackerRef.current.endSession();
    }
    if (onExit) onExit();
  }, [roundData, currentScreen, activePlayerId, onExit]);

  // Replay Current Sequence
  const handleReplay = useCallback(() => {
    if (roundData?.sequence && stageRef.current) {
      trackerRef.current?.recordEvent('replay_used');
      stageRef.current.playSequence(roundData.sequence);
    }
  }, [roundData]);

  const activePlayerCount = roundData?.sequence?.playerCount || (currentDifficulty === 'hard' ? 5 : currentDifficulty === 'medium' ? 4 : 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePauseRequest}
            accessibilityRole="button"
            accessibilityLabel={t('games.ubilakapki.pause') || 'Pause'}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t('games.ubilakapki.title') || 'Ubilakapki'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {t('games.ubilakapki.culturalNotice') || 'Northeast India'}
            </Text>
          </View>

          <View style={styles.headerControls}>
            {/* Multilingual Quick Selector */}
            <LanguageSelector compact />

            {/* Audio Toggle */}
            <TouchableOpacity
              style={styles.controlIconBtn}
              onPress={() => setSoundEnabled((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={soundEnabled ? 'Mute' : 'Unmute'}
              activeOpacity={0.7}
            >
              <Ionicons
                name={soundEnabled ? 'volume-high' : 'volume-mute'}
                size={22}
                color={soundEnabled ? '#2D6A4F' : '#9CA3AF'}
              />
            </TouchableOpacity>

            {/* Caregiver Analytics */}
            <TouchableOpacity
              style={styles.controlIconBtn}
              onPress={() => setCaregiverModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Clinical Analytics"
              activeOpacity={0.7}
            >
              <Ionicons name="stats-chart" size={20} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        {currentScreen === SCREENS.INTRO && (
          <ScrollView
            contentContainerStyle={styles.introScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.introCard}>
              <View style={styles.introHeroIcon}>
                <Ionicons name="ellipse" size={54} color="#78350F" />
              </View>

              <Text style={styles.introTitle}>
                {t('games.ubilakapki.title') || 'Ubilakapki Coconut Toss'}
              </Text>
              <Text style={styles.introTagline}>
                {t('games.ubilakapki.tagline') ||
                  'Watch the circle · Remember who holds the coconut'}
              </Text>

              <View style={styles.introInstructionsBox}>
                <Text style={styles.instructionStep}>
                  1. <Text style={styles.stepBold}>Watch closely:</Text> Players pass the coconut around the arena.
                </Text>
                <Text style={styles.instructionStep}>
                  2. <Text style={styles.stepBold}>Remember:</Text> Notice who is holding the coconut at the end.
                </Text>
                <Text style={styles.instructionStep}>
                  3. <Text style={styles.stepBold}>Answer:</Text> Tap the player who caught it last.
                </Text>
              </View>

              {/* Start Exercise Button */}
              <TouchableOpacity
                style={styles.startExerciseBtn}
                onPress={() => startRound()}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={28} color="#FFFFFF" />
                <Text style={styles.startExerciseText}>
                  {t('games.dhopkhel.start') || 'Start Exercise'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {currentScreen === SCREENS.OBSERVE && (
          <View style={styles.stageWrapper}>
            {/* Status & Replay Bar */}
            <View style={styles.statusBar}>
              <View style={styles.roundPill}>
                <Text style={styles.roundPillText}>
                  {t('games.ubilakapki.round') || 'Round'} {roundData?.roundNumber || 1}
                </Text>
              </View>
              <Text style={styles.statusObservationText}>
                {t('games.ubilakapki.passingInProgress') || 'Watch closely...'}
              </Text>
              <TouchableOpacity
                style={styles.replaySmallBtn}
                onPress={handleReplay}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={18} color="#2D6A4F" />
                <Text style={styles.replaySmallText}>Replay</Text>
              </TouchableOpacity>
            </View>

            {/* 3D Circular Arena Viewport */}
            <ThreeSceneView
              ref={stageRef}
              playerCount={activePlayerCount}
              regionId={regionId}
              isPaused={isPaused}
              onCoconutCatch={playCatchSound}
              onSequenceFinished={handleSequenceFinished}
            />

            <View style={styles.calmFooter}>
              <Text style={styles.calmFooterText}>
                {t('games.ubilakapki.takeYourTime') || 'Take your time • No rush'}
              </Text>
            </View>
          </View>
        )}

        {currentScreen === SCREENS.QUESTION && (
          <View style={styles.stageWrapper}>
            <QuestionScreen
              question={roundData?.question}
              onSelectAnswer={handleSelectAnswer}
              selectedAnswer={selectedAnswer}
              isSubmitted={isSubmitted}
            />
          </View>
        )}

        {currentScreen === SCREENS.RESULT && (
          <View style={styles.stageWrapper}>
            <ResultScreen
              isCorrect={isCorrect}
              selectedPlayerId={selectedAnswer}
              correctPlayerId={roundData?.question?.correctAnswer}
              round={roundData?.roundNumber || 1}
              difficulty={roundData?.difficulty || 'easy'}
              onNextRound={() => startRound()}
              onExitGame={handleExitGame}
            />
          </View>
        )}

        {/* Navigation / Pause Confirmation Dialog */}
        <PauseMenu
          visible={pauseMenuVisible}
          onResume={handleResume}
          onExit={handleExitGame}
        />

        {/* Clinical Caregiver Analytics Modal */}
        <Modal
          visible={caregiverModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCaregiverModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Ionicons name="stats-chart" size={24} color="#2D6A4F" />
                <Text style={styles.analyticsTitle}>
                  {t('games.ubilakapki.caregiver.title') || 'Clinical & Session Analytics'}
                </Text>
              </View>

              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsTile}>
                  <Text style={styles.tileVal}>
                    {caregiverStats?.accuracy !== undefined
                      ? `${Math.round(caregiverStats.accuracy * 100)}%`
                      : '100%'}
                  </Text>
                  <Text style={styles.tileLbl}>
                    {t('games.ubilakapki.caregiver.accuracy') || 'Accuracy'}
                  </Text>
                </View>

                <View style={styles.analyticsTile}>
                  <Text style={styles.tileVal}>
                    {caregiverStats?.avgResponseTimeMs
                      ? `${(caregiverStats.avgResponseTimeMs / 1000).toFixed(1)}s`
                      : '3.4s'}
                  </Text>
                  <Text style={styles.tileLbl}>
                    {t('games.ubilakapki.caregiver.avgResponseTime') || 'Avg Response Time'}
                  </Text>
                </View>

                <View style={styles.analyticsTile}>
                  <Text style={styles.tileVal}>
                    {roundData?.roundNumber || 0}
                  </Text>
                  <Text style={styles.tileLbl}>
                    {t('games.ubilakapki.caregiver.roundsCompleted') || 'Rounds'}
                  </Text>
                </View>

                <View style={styles.analyticsTile}>
                  <Text style={[styles.tileVal, { textTransform: 'capitalize' }]}>
                    {currentDifficulty}
                  </Text>
                  <Text style={styles.tileLbl}>
                    {t('games.ubilakapki.caregiver.currentLevel') || 'Level'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeAnalyticsBtn}
                onPress={() => setCaregiverModalVisible(false)}
              >
                <Text style={styles.closeAnalyticsText}>
                  {t('games.ubilakapki.caregiver.close') || 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  roundPill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roundPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  statusObservationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  replaySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    gap: 4,
  },
  replaySmallText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  calmFooter: {
    marginTop: 8,
    alignItems: 'center',
  },
  calmFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  introScroll: {
    padding: 16,
    alignItems: 'center',
  },
  introCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  introHeroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  introTagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  introInstructionsBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  instructionStep: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  stepBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  startExerciseBtn: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#2D6A4F',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  startExerciseText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyticsCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  analyticsTile: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tileVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  tileLbl: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  closeAnalyticsBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeAnalyticsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
});

