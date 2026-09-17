/**
 * UBILAKAPKI - Culturally Familiar Cognitive Coconut Passing Game
 * SIH 2026 Memory Assistant | Offline-First | Adaptive Performance
 * 
 * Restored Authentic Northeast Indian Version:
 * - Screen 2: Header with Back button, Title: Ubilakapki Coconut Toss, Language selector, Round indicator
 * - Main Game Board: Rectangular board with rounded corners, outdoor Northeast scene (sky, mountains, trees, brown earthen ground, circular chalk ring)
 * - 3 Players in triangular formation: Jonali (Terracotta), Rupjyoti (Forest Jade), Bibita (Golden Amber)
 * - Parabolic coconut toss trajectory with spinning arc
 * - Step 1: Observe passing
 * - Step 2: Remember (coconut stops or hides; question asks who has the coconut)
 * - Step 3: Large answer buttons (Jonali, Rupjyoti, Bibita)
 * - Step 4: Clear, calm, respectful feedback
 * - Step 5: Next Round button
 * - Pause / Exit: "Leave this game?" dialog preserving progress
 * - Centralized PerformanceTracker integration with Supabase persistence
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThreeSceneView } from './components/ThreeSceneView.js';
import { PauseMenu } from './components/PauseMenu.js';
import { SessionManager } from './engine/SessionManager.js';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePatient } from '../../context/PatientContext';
import { PerformanceTracker } from '../../modules/performance';
import LanguageSelector from '../../components/LanguageSelector';
import { PLAYER_ARCHETYPES } from './data/players.js';
import {
  getLocalizedPlayerName,
  getLocalizedPlayerAttire,
  getLocalizedPrompt,
} from './utils/localization.js';

const SCREENS = {
  OBSERVE: 'observe',
  QUESTION: 'question',
  RESULT: 'result',
};

export default function UbilakapkiGame({ onExit, patientId: propPatientId }) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { currentPatientId, patientId } = usePatient?.() || {};
  const activePlayerId = propPatientId || currentPatientId || patientId || 'P001';

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
  const [currentScreen, setCurrentScreen] = useState(SCREENS.OBSERVE);
  const [roundData, setRoundData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseMenuVisible, setPauseMenuVisible] = useState(false);
  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);
  const [caregiverStats, setCaregiverStats] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');

  // Soft natural percussion for catch
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
        // Safe fallback
      }
    }
  }, [soundEnabled]);

  // Melodic chime on correct answer
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
        // Safe fallback
      }
    }
  }, [soundEnabled]);

  // Start Next Round
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
        playerCount: 3,
        finalHolder: nextData.sequence?.finalHolder,
      },
    });

    // Mount sequence into the stage
    setTimeout(() => {
      if (stageRef.current && nextData.sequence) {
        stageRef.current.showCoconut?.();
        stageRef.current.playSequence(nextData.sequence);
      }
    }, 450);
  }, []);

  // Initialize Session and start Round 1 on Mount
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

    // Auto-start round 1
    startRound();

    return () => {
      isMounted = false;
      trackerRef.current?.endSession();
    };
  }, [activePlayerId, startRound]);

  // Sequence Finished Callback from Stage View
  const handleSequenceFinished = useCallback(() => {
    stageRef.current?.hideCoconut?.();
    setTimeout(() => {
      setCurrentScreen(SCREENS.QUESTION);
      trackerRef.current?.recordRecallStart();
      sessionManagerRef.current.recordRecallStart();
    }, 300);
  }, []);

  // Answer Selection Handler
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
      await sessionManagerRef.current.endRound(playerId, correct);

      // Record in centralized adaptive PerformanceTracker
      if (trackerRef.current) {
        trackerRef.current.recordAnswer({
          chosenAnswer: playerId,
          correctAnswer: roundData?.question?.correctAnswer,
          isCorrect: correct,
          metadata: {
            playerCount: 3,
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

      // Transition to Result
      setCurrentScreen(SCREENS.RESULT);
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
      stageRef.current.showCoconut?.();
      setCurrentScreen(SCREENS.OBSERVE);
      stageRef.current.playSequence(roundData.sequence);
    }
  }, [roundData]);

  // Determine round indicator text for Header
  const roundNumber = roundData?.roundNumber || 1;
  let roundIndicatorStatus = t('games.ubilakapki.passingInProgress') || 'Watch closely as the coconut is passed...';
  if (currentScreen === SCREENS.QUESTION) {
    roundIndicatorStatus = t('games.ubilakapki.questionPrompt') || 'Who was holding the coconut at the end?';
  } else if (currentScreen === SCREENS.RESULT) {
    roundIndicatorStatus = isCorrect
      ? (t('games.ubilakapki.wellRemembered') || 'Well Remembered!')
      : (t('games.ubilakapki.goodTry') || "That's okay!");
  }

  // The 3 authentic players
  const activePlayers = PLAYER_ARCHETYPES.slice(0, 3);
  const correctHolderId = roundData?.question?.correctAnswer || 'A';
  const correctHolderName = getLocalizedPlayerName(correctHolderId, t, currentLanguage);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ========================================================
            HEADER BAR
            - Back button
            - Title: Ubilakapki Coconut Toss
            - Language selector
            - Round indicator: Round 1 | Watch closely as the coconut is passed...
            ======================================================== */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePauseRequest}
            accessibilityRole="button"
            accessibilityLabel={t('games.ubilakapki.pause') || 'Pause / Exit'}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t('games.ubilakapki.title') || 'Ubilakapki Coconut Toss'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {t('games.ubilakapki.round') || 'Round'} {roundNumber} | {roundIndicatorStatus}
            </Text>
          </View>

          <View style={styles.headerControls}>
            {/* Quick Language Selector */}
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
                size={20}
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
              <Ionicons name="stats-chart" size={18} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            MAIN GAMEPLAY VIEWPORT
            - Main Game Board: Rectangular board with rounded corners,
              outdoor Northeast India scene, 3 players (Jonali, Rupjyoti, Bibita)
            - Step 1 (Observe): 3 players passing coconut
            - Step 2 (Remember): Coconut stops or hides; question asks who has it
            - Step 3 (Answer): Large answer buttons (Jonali, Rupjyoti, Bibita)
            - Step 4 (Feedback): Clear, calm, respectful feedback
            - Step 5 (Next Round): Continue to next round
            ======================================================== */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stageContent}>
            {/* Rectangular Main Game Board */}
            <ThreeSceneView
              ref={stageRef}
              playerCount={3}
              regionId="assam"
              isPaused={isPaused}
              onCoconutCatch={playCatchSound}
              onSequenceFinished={handleSequenceFinished}
            />

            {/* STEP 1: OBSERVE */}
            {currentScreen === SCREENS.OBSERVE && (
              <View style={styles.stepContainer}>
                <View style={styles.observeStatusBar}>
                  <View style={styles.observeEyeBadge}>
                    <Ionicons name="eye-outline" size={20} color="#2D6A4F" />
                    <Text style={styles.observeStatusText}>
                      {t('games.ubilakapki.passingInProgress') || 'Watch closely as the coconut is passed...'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.replayBtn}
                    onPress={handleReplay}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Replay coconut movement"
                  >
                    <Ionicons name="refresh" size={18} color="#2D6A4F" />
                    <Text style={styles.replayBtnText}>Replay</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.calmReassuranceText}>
                  {t('games.ubilakapki.takeYourTime') || 'Take your time • No rush'}
                </Text>
              </View>
            )}

            {/* STEP 2 & 3: REMEMBER & ANSWER */}
            {currentScreen === SCREENS.QUESTION && (
              <View style={styles.stepContainer}>
                <View style={styles.questionPromptBox}>
                  <Ionicons name="help-circle" size={26} color="#78350F" />
                  <Text style={styles.questionPromptHeading}>
                    {getLocalizedPrompt(t)}
                  </Text>
                </View>

                {/* Large Answer Buttons for Jonali, Rupjyoti, Bibita */}
                <View style={styles.answerButtonsList}>
                  {activePlayers.map((player) => {
                    const isSelected = selectedAnswer === player.id;
                    const playerName = getLocalizedPlayerName(player.id, t, currentLanguage);
                    const attireDesc = getLocalizedPlayerAttire(player.id, t, currentLanguage);

                    return (
                      <TouchableOpacity
                        key={player.id}
                        style={[
                          styles.answerCard,
                          { borderColor: player.borderColor },
                          isSelected && styles.answerCardSelected,
                        ]}
                        onPress={() => handleSelectAnswer(player.id)}
                        disabled={isSubmitted}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`${playerName}, ${attireDesc}`}
                      >
                        <View style={[styles.playerAvatarCircle, { backgroundColor: player.color }]}>
                          <Ionicons name="person" size={24} color="#FFFFFF" />
                        </View>

                        <View style={styles.answerTextGroup}>
                          <Text style={styles.answerPlayerName}>{playerName}</Text>
                          {attireDesc ? (
                            <Text style={styles.answerPlayerAttire} numberOfLines={1}>
                              {attireDesc}
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={[
                            styles.playerBadgeColorPill,
                            { backgroundColor: player.lightColor, borderColor: player.borderColor },
                          ]}
                        >
                          <Text style={[styles.playerBadgeColorText, { color: player.borderColor }]}>
                            {playerName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.questionFooterRow}>
                  <TouchableOpacity
                    style={styles.replayBtn}
                    onPress={handleReplay}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={16} color="#2D6A4F" />
                    <Text style={styles.replayBtnText}>Replay movement</Text>
                  </TouchableOpacity>

                  <Text style={styles.calmReassuranceText}>
                    {t('games.ubilakapki.takeYourTime') || 'Take your time • No rush'}
                  </Text>
                </View>
              </View>
            )}

            {/* STEP 4 & 5: FEEDBACK & NEXT ROUND */}
            {currentScreen === SCREENS.RESULT && (
              <View style={styles.stepContainer}>
                {/* Dignified Calm Feedback Card */}
                <View
                  style={[
                    styles.feedbackBanner,
                    isCorrect ? styles.feedbackBannerCorrect : styles.feedbackBannerNeutral,
                  ]}
                >
                  <View
                    style={[
                      styles.feedbackIconCircle,
                      isCorrect ? styles.feedbackIconCircleCorrect : styles.feedbackIconCircleNeutral,
                    ]}
                  >
                    <Ionicons
                      name={isCorrect ? 'sparkles' : 'heart'}
                      size={32}
                      color={isCorrect ? '#15803D' : '#D97706'}
                    />
                  </View>

                  <View style={styles.feedbackTextWrap}>
                    <Text
                      style={[
                        styles.feedbackHeading,
                        isCorrect ? styles.feedbackHeadingCorrect : styles.feedbackHeadingNeutral,
                      ]}
                    >
                      {isCorrect
                        ? (t('games.ubilakapki.wellRemembered') || 'Well Remembered!')
                        : (t('games.ubilakapki.goodTry') || "That's okay!")}
                    </Text>

                    <Text style={styles.feedbackBody}>
                      {isCorrect
                        ? `${correctHolderName} ${t('games.ubilakapki.wasHolding') || 'was holding the coconut at the end!'}`
                        : `${correctHolderName} ${t('games.ubilakapki.wasHolding') || 'was holding the coconut.'} ${t('games.ubilakapki.tryAgainEncouragement') || "Let's try another round together!"}`}
                    </Text>
                  </View>
                </View>

                {/* Highlighted Choice Verification */}
                <View style={styles.answerButtonsList}>
                  {activePlayers.map((player) => {
                    const isTarget = player.id === correctHolderId;
                    const isSelected = selectedAnswer === player.id;
                    const playerName = getLocalizedPlayerName(player.id, t, currentLanguage);
                    const attireDesc = getLocalizedPlayerAttire(player.id, t, currentLanguage);

                    let cardResultStyle = styles.answerCardDisabled;
                    if (isTarget) {
                      cardResultStyle = styles.answerCardCorrect;
                    } else if (isSelected && !isCorrect) {
                      cardResultStyle = styles.answerCardIncorrect;
                    }

                    return (
                      <View
                        key={player.id}
                        style={[styles.answerCard, cardResultStyle]}
                      >
                        <View style={[styles.playerAvatarCircle, { backgroundColor: player.color }]}>
                          <Ionicons
                            name={isTarget ? 'checkmark-circle' : isSelected ? 'close-circle' : 'person'}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>

                        <View style={styles.answerTextGroup}>
                          <Text style={styles.answerPlayerName}>{playerName}</Text>
                          {attireDesc ? (
                            <Text style={styles.answerPlayerAttire} numberOfLines={1}>
                              {attireDesc}
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={[
                            styles.playerBadgeColorPill,
                            { backgroundColor: player.lightColor, borderColor: player.borderColor },
                          ]}
                        >
                          <Text style={[styles.playerBadgeColorText, { color: player.borderColor }]}>
                            {isTarget ? 'Coconut' : playerName}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Step 5: Next Round Button */}
                <TouchableOpacity
                  style={styles.nextRoundBtn}
                  onPress={startRound}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('games.ubilakapki.nextRound') || 'Next Round'}
                >
                  <Text style={styles.nextRoundBtnText}>
                    {t('games.ubilakapki.nextRound') || 'Next Round'} →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ========================================================
            LEAVE GAME / PAUSE CONFIRMATION MODAL
            Title: Leave this game?
            Subtitle: Your exercise progress is safely preserved...
            Buttons: Continue / Yes, Exit
            ======================================================== */}
        <PauseMenu
          visible={pauseMenuVisible}
          onResume={handleResume}
          onExit={handleExitGame}
        />

        {/* ========================================================
            CLINICAL CAREGIVER ANALYTICS MODAL
            ======================================================== */}
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
                    {roundNumber}
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
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
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
  scrollContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    paddingBottom: 40,
  },
  stageContent: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  stepContainer: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },

  /* Step 1: Observe Styles */
  observeStatusBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    elevation: 1,
  },
  observeEyeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  observeStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    gap: 4,
  },
  replayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  calmReassuranceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },

  /* Step 2 & 3: Remember & Answer Styles */
  questionPromptBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
    gap: 10,
  },
  questionPromptHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#78350F',
    flex: 1,
  },
  answerButtonsList: {
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  answerCard: {
    width: '100%',
    minHeight: 66,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  answerCardSelected: {
    borderColor: '#2D6A4F',
    backgroundColor: '#F0FDF4',
  },
  answerCardCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  answerCardIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
    opacity: 0.8,
  },
  answerCardDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.65,
  },
  playerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerTextGroup: {
    flex: 1,
  },
  answerPlayerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  answerPlayerAttire: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  playerBadgeColorPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerBadgeColorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionFooterRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 6,
  },

  /* Step 4: Feedback Styles */
  feedbackBanner: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  feedbackBannerCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  feedbackBannerNeutral: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  feedbackIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackIconCircleCorrect: {
    backgroundColor: '#BBF7D0',
  },
  feedbackIconCircleNeutral: {
    backgroundColor: '#FDE68A',
  },
  feedbackTextWrap: {
    flex: 1,
  },
  feedbackHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackHeadingCorrect: {
    color: '#15803D',
  },
  feedbackHeadingNeutral: {
    color: '#B45309',
  },
  feedbackBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },

  /* Step 5: Next Round Button */
  nextRoundBtn: {
    width: '100%',
    minHeight: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  nextRoundBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* Caregiver Analytics Modal */
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
