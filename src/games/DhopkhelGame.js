import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import { PerformanceTracker } from '../modules/performance';
import LanguageSelector from '../components/LanguageSelector';

// Screen states
const SCREENS = {
  WELCOME: 'welcome',
  INSTRUCTIONS: 'instructions',
  PLAYING: 'playing',
  RECALL: 'recall',
  FEEDBACK: 'feedback',
  LEVEL_UNLOCKED: 'level_unlocked',
  COMPLETE: 'complete',
  SETTINGS: 'settings',
};

// Difficulty level configurations (keys mapped to translations)
const LEVEL_CONFIGS = {
  easy: {
    id: 'easy',
    nameKey: 'games.dhopkhel.levelEasyName',
    badgeKey: 'games.dhopkhel.levelEasyBadge',
    subtitleKey: 'games.dhopkhel.levelEasySubtitle',
    descKey: 'games.dhopkhel.levelEasyDesc',
    moves: 2,
    holdDuration: 1200,
    travelDuration: 900,
    dots: 2,
  },
  medium: {
    id: 'medium',
    nameKey: 'games.dhopkhel.levelMediumName',
    badgeKey: 'games.dhopkhel.levelMediumBadge',
    subtitleKey: 'games.dhopkhel.levelMediumSubtitle',
    descKey: 'games.dhopkhel.levelMediumDesc',
    moves: 4,
    holdDuration: 1000,
    travelDuration: 750,
    dots: 4,
  },
  hard: {
    id: 'hard',
    nameKey: 'games.dhopkhel.levelHardName',
    badgeKey: 'games.dhopkhel.levelHardBadge',
    subtitleKey: 'games.dhopkhel.levelHardSubtitle',
    descKey: 'games.dhopkhel.levelHardDesc',
    moves: 6,
    holdDuration: 900,
    travelDuration: 700,
    dots: 6,
  },
};

// Player configurations (keys mapped to translations)
const PLAYER_CONFIGS = [
  {
    id: 1,
    nameKey: 'games.dhopkhel.player1',
    labelKey: 'games.dhopkhel.player1Label',
    color: '#059669', // Emerald
    bgLight: '#D1FAE5',
    bgDark: '#064E3B',
    accentText: '#065F46',
  },
  {
    id: 2,
    nameKey: 'games.dhopkhel.player2',
    labelKey: 'games.dhopkhel.player2Label',
    color: '#2563EB', // Blue
    bgLight: '#DBEAFE',
    bgDark: '#1E3A8A',
    accentText: '#1E40AF',
  },
  {
    id: 3,
    nameKey: 'games.dhopkhel.player3',
    labelKey: 'games.dhopkhel.player3Label',
    color: '#D97706', // Amber / Terracotta
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    accentText: '#92400E',
  },
];

/* -------------------------------------------------------------
   Visual Subcomponents
------------------------------------------------------------- */

// Soft Assamese Dhop ball
function DhopBall({ size = 46, contrast = 'normal', accessibilityLabel }) {
  const isHighContrast = contrast === 'high';
  const mainColor = isHighContrast ? '#FFFF00' : '#DC2626';
  const borderColor = isHighContrast ? '#000000' : '#991B1B';
  const stitchColor = isHighContrast ? '#000000' : '#FEE2E2';

  return (
    <View
      style={[
        styles.dhopContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: mainColor,
          borderColor: borderColor,
          borderWidth: isHighContrast ? 3 : 2,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || 'Dhop ball'}
    >
      {/* Traditional cloth quarter-stitching details */}
      <View
        style={[
          styles.dhopInnerRing,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: (size * 0.62) / 2,
            borderColor: stitchColor,
          },
        ]}
      />
      <View
        style={[
          styles.dhopStitchHorizontal,
          {
            width: size * 0.75,
            backgroundColor: stitchColor,
          },
        ]}
      />
      <View
        style={[
          styles.dhopStitchVertical,
          {
            height: size * 0.75,
            backgroundColor: stitchColor,
          },
        ]}
      />
      {/* Soft cloth highlight */}
      <View
        style={[
          styles.dhopHighlight,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: (size * 0.22) / 2,
            backgroundColor: isHighContrast ? '#FFFFFF' : '#FEF2F2',
          },
        ]}
      />
    </View>
  );
}

// Respectful adult/elderly player avatar
function PlayerAvatar({
  player,
  hasDhop = false,
  contrast = 'normal',
  isDarkMode = false,
  scale = 1,
}) {
  const isHighContrast = contrast === 'high';
  const avatarSize = 92 * scale;
  const numBadgeSize = 34 * scale;

  return (
    <View style={[styles.avatarWrapper, { width: avatarSize + 24 }]}>
      {/* Halo highlight if holding the Dhop */}
      <View
        style={[
          styles.avatarCircle,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: isHighContrast
              ? '#111827'
              : isDarkMode
              ? player.bgDark
              : player.bgLight,
            borderColor: hasDhop
              ? isHighContrast
                ? '#FFFF00'
                : player.color
              : isHighContrast
              ? '#FFFFFF'
              : player.color,
            borderWidth: hasDhop ? 4 : 2,
            shadowColor: hasDhop ? player.color : '#000',
            shadowOpacity: hasDhop ? 0.35 : 0.1,
            shadowRadius: hasDhop ? 8 : 4,
            elevation: hasDhop ? 6 : 2,
          },
        ]}
      >
        {/* Stylized serene face & shoulders */}
        <View style={styles.characterContainer}>
          {/* Head & gentle hair */}
          <View
            style={[
              styles.characterHead,
              {
                backgroundColor: isHighContrast
                  ? '#374151'
                  : isDarkMode
                  ? '#4B5563'
                  : '#E2E8F0',
                borderColor: player.color,
              },
            ]}
          >
            {/* Mature gray hair cap */}
            <View
              style={[
                styles.characterHair,
                {
                  backgroundColor: isHighContrast ? '#FFFFFF' : '#CBD5E1',
                },
              ]}
            />
            {/* Friendly calm eyes */}
            <View style={styles.characterEyesRow}>
              <View
                style={[
                  styles.characterEye,
                  { backgroundColor: isHighContrast ? '#FFFF00' : '#1E293B' },
                ]}
              />
              <View
                style={[
                  styles.characterEye,
                  { backgroundColor: isHighContrast ? '#FFFF00' : '#1E293B' },
                ]}
              />
            </View>
          </View>
          {/* Shoulders / dignified shirt in player color */}
          <View
            style={[
              styles.characterShoulders,
              {
                backgroundColor: player.color,
              },
            ]}
          />
        </View>

        {/* Prominent Number Badge */}
        <View
          style={[
            styles.playerNumBadge,
            {
              width: numBadgeSize,
              height: numBadgeSize,
              borderRadius: numBadgeSize / 2,
              backgroundColor: player.color,
              borderColor: '#FFFFFF',
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[styles.playerNumText, { fontSize: 18 * scale }]}>
            {player.id}
          </Text>
        </View>
      </View>

      {/* Player Label */}
      <View
        style={[
          styles.playerLabelContainer,
          {
            backgroundColor: hasDhop
              ? player.color
              : isHighContrast
              ? '#1E293B'
              : isDarkMode
              ? '#334155'
              : '#F1F5F9',
            borderColor: player.color,
            borderWidth: hasDhop ? 2 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.playerLabelText,
            {
              color: hasDhop
                ? '#FFFFFF'
                : isHighContrast
                ? '#FFFF00'
                : isDarkMode
                ? '#F8FAFC'
                : '#0F172A',
              fontSize: 14 * scale,
              fontWeight: hasDhop ? 'bold' : '600',
            },
          ]}
        >
          {player.name}
        </Text>
      </View>
    </View>
  );
}

// Calm Assam landscape background (soft green hills & sky, secondary & uncluttered)
function AssamLandscape({ contrast = 'normal', isDarkMode = false }) {
  if (contrast === 'high') {
    return <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000' }]} />;
  }

  const skyColor = isDarkMode ? '#0F172A' : '#ECFDF5'; // Soft daylight mint
  const hillFar = isDarkMode ? '#1E293B' : '#A7F3D0';  // Distant gentle rolling hill
  const hillNear = isDarkMode ? '#14532D' : '#6EE7B7'; // Near meadow field
  const fieldFloor = isDarkMode ? '#064E3B' : '#34D399';

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: skyColor }]} pointerEvents="none">
      {/* Sun / soft warm daylight */}
      <View
        style={[
          styles.landscapeSun,
          { backgroundColor: isDarkMode ? '#334155' : '#FEF3C7' },
        ]}
      />
      {/* Distant gentle hill */}
      <View
        style={[
          styles.landscapeHillFar,
          { backgroundColor: hillFar },
        ]}
      />
      {/* Closer green meadow */}
      <View
        style={[
          styles.landscapeHillNear,
          { backgroundColor: hillNear },
        ]}
      />
      {/* Clean open playing field floor */}
      <View
        style={[
          styles.landscapeFloor,
          { backgroundColor: fieldFloor },
        ]}
      />
    </View>
  );
}

// Spoken voice caption banner
function VoiceCaption({ text, enabled = true, contrast = 'normal', accessibilityLabel }) {
  if (!text || !enabled) return null;
  const isHighContrast = contrast === 'high';

  return (
    <View
      style={[
        styles.voiceCaptionContainer,
        {
          backgroundColor: isHighContrast ? '#000000' : '#1E293B',
          borderColor: isHighContrast ? '#FFFF00' : '#334155',
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || `Voice instruction: ${text}`}
    >
      <Ionicons
        name="volume-medium"
        size={22}
        color={isHighContrast ? '#FFFF00' : '#38BDF8'}
        style={{ marginRight: 8 }}
      />
      <Text
        style={[
          styles.voiceCaptionText,
          { color: isHighContrast ? '#FFFF00' : '#F8FAFC' },
        ]}
      >
        "{text}"
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------
   Main DhopkhelGame Component
------------------------------------------------------------- */
export default function DhopkhelGame({ onExit }) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { currentPatientId, patientId } = usePatient();
  const activePlayerId = currentPatientId || patientId || 'P001';

  // Navigation screen
  const [screen, setScreen] = useState(SCREENS.WELCOME);

  // Difficulty (always starts at easy, dynamically unlocked & advanced via adaptive engine)
  const [selectedLevel, setSelectedLevel] = useState('easy');

  // Unlocked difficulty levels (gated progression: starts with easy)
  const [unlockedLevels, setUnlockedLevels] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  // Current progress percentage towards tier mastery / promotion (0% - 100%)
  const [tierProgressPercent, setTierProgressPercent] = useState(0);

  // Unlocked level meta for milestone celebrations
  const [unlockedTierInfo, setUnlockedTierInfo] = useState(null);

  // Caregiver stats summary
  const [caregiverStats, setCaregiverStats] = useState(null);

  // Performance tracker instance
  const trackerRef = useRef(null);
  if (!trackerRef.current) {
    trackerRef.current = new PerformanceTracker({
      gameType: 'dhop_khel',
      playerId: activePlayerId,
    });
  }

  // Accessibility settings state
  const [textSize, setTextSize] = useState('large'); // 'large' | 'extraLarge'
  const [buttonSize, setButtonSize] = useState('large'); // 'large' | 'extraLarge'
  const [audio, setAudio] = useState(true); // true | false
  const [animationSpeed, setAnimationSpeed] = useState('slow'); // 'slow' | 'normal'
  const [contrast, setContrast] = useState('normal'); // 'normal' | 'high'

  // Gameplay state
  const [moveSequence, setMoveSequence] = useState([]); // e.g. [1, 2, 3]
  const [stepIndex, setStepIndex] = useState(0);
  const [currentHolder, setCurrentHolder] = useState(1);
  const [isBallVisible, setIsBallVisible] = useState(true);

  // Structured message descriptors for instant translation reactivity
  const [statusDescriptor, setStatusDescriptor] = useState({ key: '', params: {} });
  const [voiceDescriptor, setVoiceDescriptor] = useState({ key: 'voiceWelcome', params: {} });

  const [userChoice, setUserChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [roundStats, setRoundStats] = useState({ roundsCompleted: 0, score: 0 });

  // Timers ref for safe cleanup
  const activeTimers = useRef([]);

  // Ball animation value (coordinates relative to playing field)
  const ballPosAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballOpacityAnim = useRef(new Animated.Value(1)).current;

  // Clear pending timers safely
  const clearTimers = useCallback(() => {
    activeTimers.current.forEach((tId) => clearTimeout(tId));
    activeTimers.current = [];
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Requirement: Game must always start at Easy difficulty whenever a new game begins.
    // Ensure no stale Medium or Hard state is reused from prior sessions.
    setSelectedLevel('easy');
    setUnlockedLevels({ easy: true, medium: false, hard: false });
    setTierProgressPercent(0);
    setRoundStats({ roundsCompleted: 0, score: 0 });

    trackerRef.current
      .initialize({ playerId: activePlayerId, initialDifficulty: 'easy' })
      .then(() => {
        if (isMounted) {
          setSelectedLevel('easy');
          setCaregiverStats(trackerRef.current.getCaregiverProfile());
        }
      })
      .catch((err) => {
        console.warn('PerformanceTracker initialize notice:', err);
      });

    return () => {
      isMounted = false;
      clearTimers();
      trackerRef.current?.endSession();
    };
  }, [activePlayerId, clearTimers]);

  // Reactive localized levels
  const levels = useMemo(() => {
    const localized = {};
    for (const [key, cfg] of Object.entries(LEVEL_CONFIGS)) {
      localized[key] = {
        ...cfg,
        name: t(cfg.nameKey),
        badge: t(cfg.badgeKey),
        subtitle: t(cfg.subtitleKey),
        description: t(cfg.descKey),
      };
    }
    return localized;
  }, [t, currentLanguage]);

  // Reactive localized players
  const players = useMemo(() => {
    return PLAYER_CONFIGS.map((p) => ({
      ...p,
      name: t(p.nameKey, { id: p.id }),
      label: t(p.labelKey, { id: p.id }),
    }));
  }, [t, currentLanguage]);

  // Reactive status & voice strings computed from descriptors
  const statusMessage = useMemo(() => {
    if (!statusDescriptor.key) return '';
    return t(`games.dhopkhel.${statusDescriptor.key}`, statusDescriptor.params);
  }, [statusDescriptor, t, currentLanguage]);

  const voiceText = useMemo(() => {
    if (!voiceDescriptor.key) return '';
    return t(`games.dhopkhel.${voiceDescriptor.key}`, voiceDescriptor.params);
  }, [voiceDescriptor, t, currentLanguage]);

  // Accessibility multipliers
  const fontScale = textSize === 'extraLarge' ? 1.22 : 1.0;
  const btnScale = buttonSize === 'extraLarge' ? 1.2 : 1.0;
  const animMultiplier = animationSpeed === 'slow' ? 1.5 : 1.0;

  // Derived color scheme
  const colors = useMemo(() => {
    if (contrast === 'high') {
      return {
        bg: '#000000',
        cardBg: '#121212',
        cardBorder: '#FFFF00',
        text: '#FFFF00',
        subText: '#FFFFFF',
        primary: '#00FF66',
        primaryText: '#000000',
        accent: '#FFD700',
        btnText: '#000000',
        divider: '#FFFF00',
      };
    }
    return {
      bg: isDarkMode ? '#0B1320' : '#F0FDF4',
      cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
      cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
      text: isDarkMode ? '#F8FAFC' : '#0F172A',
      subText: isDarkMode ? '#94A3B8' : '#475569',
      primary: '#059669',
      primaryText: '#FFFFFF',
      accent: '#D97706',
      btnText: '#FFFFFF',
      divider: isDarkMode ? '#334155' : '#CBD5E1',
    };
  }, [contrast, isDarkMode]);

  // Speech helper with language-aware synthesis
  const speakText = useCallback(
    (key, params = {}) => {
      setVoiceDescriptor({ key, params });
      if (!audio) return;
      const textToSpeak = t(`games.dhopkhel.${key}`, params);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 0.85; // Calm, slow pace
          utterance.pitch = 1.0;

          // Language-aware speech synthesis code
          const langMap = {
            en: 'en-US',
            as: 'as-IN',
            bn: 'bn-IN',
            hi: 'hi-IN',
          };
          utterance.lang = langMap[currentLanguage] || 'en-US';
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // Graceful fallback
        }
      }
    },
    [audio, currentLanguage, t]
  );

  // Generate a random valid passing sequence
  const generateSequence = useCallback((levelKey) => {
    const config = LEVEL_CONFIGS[levelKey] || LEVEL_CONFIGS.easy;
    const numMoves = config.moves;
    let current = Math.floor(Math.random() * 3) + 1;
    const seq = [current];

    for (let i = 0; i < numMoves; i++) {
      const choices = [1, 2, 3].filter((p) => p !== current);
      const next = choices[Math.floor(Math.random() * choices.length)];
      seq.push(next);
      current = next;
    }
    return seq;
  }, []);

  // Player positions on the gameplay stage (layout coordinates)
  const stagePositions = useMemo(() => {
    return {
      1: { x: 0, y: -95 },
      2: { x: -95, y: 85 },
      3: { x: 95, y: 85 },
    };
  }, []);

  // Start a round
  const handleStartRound = useCallback(
    (levelKey = selectedLevel) => {
      clearTimers();

      // Track round initialization
      trackerRef.current?.startRound({
        difficulty: levelKey,
        sequenceLength: LEVEL_CONFIGS[levelKey]?.moves || 2,
        metadata: { animMultiplier, contrast },
      });

      const seq = generateSequence(levelKey);
      setMoveSequence(seq);
      setStepIndex(0);
      setCurrentHolder(seq[0]);
      setIsBallVisible(true);
      ballOpacityAnim.setValue(1);

      // Place ball at starting player
      const startCoord = stagePositions[seq[0]];
      ballPosAnim.setValue(startCoord);

      setScreen(SCREENS.PLAYING);
      const startPlayerObj = players.find((p) => p.id === seq[0]) || { name: `Player ${seq[0]}` };
      setStatusDescriptor({ key: 'statusStart', params: { player: startPlayerObj.name } });
      speakText('voiceWatchBall');

      const config = LEVEL_CONFIGS[levelKey];
      const holdTime = Math.round(config.holdDuration * animMultiplier);
      const travelTime = Math.round(config.travelDuration * animMultiplier);

      let accumulatedTime = holdTime;

      for (let move = 1; move < seq.length; move++) {
        const fromPlayerId = seq[move - 1];
        const toPlayerId = seq[move];
        const moveNum = move;

        const passTimer = setTimeout(() => {
          setStepIndex(moveNum);
          const fromObj = players.find((p) => p.id === fromPlayerId) || { name: `Player ${fromPlayerId}` };
          const toObj = players.find((p) => p.id === toPlayerId) || { name: `Player ${toPlayerId}` };

          setStatusDescriptor({
            key: 'statusPass',
            params: { from: fromObj.name, to: toObj.name },
          });
          speakText('voicePass', { from: fromObj.name, to: toObj.name });

          const targetCoord = stagePositions[toPlayerId];
          Animated.timing(ballPosAnim, {
            toValue: targetCoord,
            duration: travelTime,
            useNativeDriver: false,
          }).start(() => {
            setCurrentHolder(toPlayerId);
          });
        }, accumulatedTime);

        activeTimers.current.push(passTimer);
        accumulatedTime += travelTime + holdTime;
      }

      // After all passes complete, transition to memory pause & recall
      const endTimer = setTimeout(() => {
        setStatusDescriptor({ key: 'statusRemember', params: {} });
        speakText('voiceRemember');

        Animated.timing(ballOpacityAnim, {
          toValue: 0,
          duration: Math.round(900 * animMultiplier),
          useNativeDriver: false,
        }).start(() => {
          setIsBallVisible(false);

          const recallTimer = setTimeout(() => {
            setScreen(SCREENS.RECALL);
            speakText('voiceWhoHasDhop');
            // Record recall start for response-time calculation
            trackerRef.current?.recordRecallStart();
          }, Math.round(700 * animMultiplier));
          activeTimers.current.push(recallTimer);
        });
      }, accumulatedTime);

      activeTimers.current.push(endTimer);
    },
    [
      selectedLevel,
      clearTimers,
      generateSequence,
      stagePositions,
      ballPosAnim,
      ballOpacityAnim,
      animMultiplier,
      players,
      speakText,
      contrast,
    ]
  );

  // User submits guess on Recall screen
  const handleAnswer = useCallback(
    (chosenPlayerId) => {
      setUserChoice(chosenPlayerId);
      const finalHolder = moveSequence[moveSequence.length - 1];
      const correct = chosenPlayerId === finalHolder;
      setIsCorrect(correct);

      if (correct) {
        setRoundStats((prev) => ({
          roundsCompleted: prev.roundsCompleted + 1,
          score: (prev.score || 0) + 1,
        }));
        speakText('voiceWellDone');
      } else {
        speakText('voiceTryAgain');
      }

      // Track answer & complete round
      if (trackerRef.current) {
        trackerRef.current.recordAnswer({
          chosenPlayerId,
          correctPlayerId: finalHolder,
          isCorrect: correct,
        });

        trackerRef.current
          .completeRound()
          .then((res) => {
            if (res && res.decision) {
              const rollingScore =
                typeof res.decision.rollingScore === 'number'
                  ? res.decision.rollingScore
                  : correct
                  ? 1.0
                  : 0.0;
              const progressPct = Math.min(100, Math.max(0, Math.round(rollingScore * 100)));
              setTierProgressPercent(progressPct);

              // Requirement: Progress through the game automatically according to percentage-based rules.
              // When required percentage is reached, automatically unlock and enter next difficulty.
              if (res.decision.decision === 'promote' && res.decision.nextDifficulty) {
                const nextDiff = res.decision.nextDifficulty;
                setUnlockedLevels((prev) => ({ ...prev, [nextDiff]: true }));
                setSelectedLevel(nextDiff);
                setUnlockedTierInfo(nextDiff);
                setScreen(SCREENS.LEVEL_UNLOCKED);
                setCaregiverStats(trackerRef.current.getCaregiverProfile());
                return;
              } else if (res.decision.decision === 'demote' && res.decision.nextDifficulty) {
                setSelectedLevel(res.decision.nextDifficulty);
              } else if (
                selectedLevel === 'hard' &&
                correct &&
                roundStats.roundsCompleted >= 6 &&
                rollingScore >= 0.85
              ) {
                setScreen(SCREENS.COMPLETE);
                setCaregiverStats(trackerRef.current.getCaregiverProfile());
                return;
              }
            }
            setCaregiverStats(trackerRef.current.getCaregiverProfile());
            setScreen(SCREENS.FEEDBACK);
          })
          .catch((e) => {
            console.warn('completeRound notice:', e);
            setScreen(SCREENS.FEEDBACK);
          });
      } else {
        setScreen(SCREENS.FEEDBACK);
      }
    },
    [moveSequence, speakText, selectedLevel, roundStats.roundsCompleted]
  );

  // Replay current round with fresh sequence
  const handleTryAgain = useCallback(() => {
    handleStartRound(selectedLevel);
  }, [handleStartRound, selectedLevel]);

  // Restart the whole game: strictly reset to Easy mode, zero progress
  const handleRestart = useCallback(() => {
    clearTimers();
    setSelectedLevel('easy');
    setUnlockedLevels({ easy: true, medium: false, hard: false });
    setTierProgressPercent(0);
    setRoundStats({ roundsCompleted: 0, score: 0 });
    setUserChoice(null);
    setIsCorrect(false);
    setUnlockedTierInfo(null);
    trackerRef.current?.startSession({ playerId: activePlayerId, initialDifficulty: 'easy' });
    setCaregiverStats(trackerRef.current.getCaregiverProfile());
    setScreen(SCREENS.WELCOME);
    speakText('voiceWelcome');
  }, [clearTimers, activePlayerId, speakText]);

  // Back button handler (no manual difficulty screen in navigation)
  const handleHeaderBack = useCallback(() => {
    clearTimers();
    if (screen === SCREENS.PLAYING || screen === SCREENS.RECALL) {
      trackerRef.current?.abandonRound();
    }

    if (screen === SCREENS.WELCOME) {
      trackerRef.current?.endSession();
      if (onExit) onExit();
    } else if (
      screen === SCREENS.INSTRUCTIONS ||
      screen === SCREENS.PLAYING ||
      screen === SCREENS.RECALL ||
      screen === SCREENS.FEEDBACK
    ) {
      setScreen(SCREENS.WELCOME);
      speakText('voiceWelcome');
    } else if (screen === SCREENS.LEVEL_UNLOCKED || screen === SCREENS.COMPLETE) {
      handleRestart();
    } else if (screen === SCREENS.SETTINGS) {
      setScreen(SCREENS.WELCOME);
    }
  }, [screen, onExit, clearTimers, speakText, handleRestart]);

  /* -----------------------------------------------------------
     Screen 1: WELCOME
  ----------------------------------------------------------- */
  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Hero Badge */}
      <View
        style={[
          styles.taglineBadge,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Ionicons name="sparkles" size={16} color={colors.accent} style={{ marginRight: 6 }} />
        <Text style={[styles.taglineText, { color: colors.subText, fontSize: 13 * fontScale }]}>
          {t('games.dhopkhel.tagline')}
        </Text>
      </View>

      {/* Main Title */}
      <Text style={[styles.mainTitle, { color: colors.text, fontSize: 32 * fontScale }]}>
        {t('games.dhopkhel.title')}
      </Text>
      <Text style={[styles.mainSubtitle, { color: colors.primary, fontSize: 19 * fontScale }]}>
        {t('games.dhopkhel.subtitle')}
      </Text>
      <Text style={[styles.culturalNotice, { color: colors.subText, fontSize: 14 * fontScale }]}>
        {t('games.dhopkhel.culturalNotice')}
      </Text>

      {/* Visual illustration of Dhop & 3 Players */}
      <View
        style={[
          styles.welcomeHeroCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.welcomeDhopHero}>
          <DhopBall
            size={64}
            contrast={contrast}
            accessibilityLabel={t('games.dhopkhel.accessibilityDhopBall')}
          />
          <Text
            style={[
              styles.dhopBallLabel,
              { color: colors.text, fontSize: 15 * fontScale, marginTop: 10 },
            ]}
          >
            {t('games.dhopkhel.softDhopBall')}
          </Text>
        </View>

        <View style={styles.heroPlayersRow}>
          {players.map((p) => (
            <PlayerAvatar
              key={p.id}
              player={p}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.78}
            />
          ))}
        </View>
      </View>

      {/* Spoken voice cue */}
      <VoiceCaption
        text={voiceText}
        enabled={audio}
        contrast={contrast}
        accessibilityLabel={t('games.dhopkhel.accessibilityVoiceInstruction', { text: voiceText })}
      />

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[
          styles.largePrimaryBtn,
          {
            backgroundColor: colors.primary,
            paddingVertical: 18 * btnScale,
          },
        ]}
        onPress={() => {
          setSelectedLevel('easy');
          setScreen(SCREENS.INSTRUCTIONS);
          speakText('voiceInstructions');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('games.dhopkhel.accessibilityPlay')}
      >
        <Ionicons name="play" size={26 * btnScale} color={colors.btnText} style={{ marginRight: 10 }} />
        <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
          {t('games.dhopkhel.play')}
        </Text>
      </TouchableOpacity>

      {/* Settings & Accessibility link */}
      <TouchableOpacity
        style={[
          styles.secondaryBtn,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            marginTop: 14,
            paddingVertical: 14 * btnScale,
          },
        ]}
        onPress={() => setScreen(SCREENS.SETTINGS)}
        accessibilityRole="button"
        accessibilityLabel={t('games.dhopkhel.accessibilitySettingsBtn')}
      >
        <Ionicons name="settings-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
        <Text style={[styles.secondaryBtnText, { color: colors.text, fontSize: 16 * fontScale }]}>
          {t('games.dhopkhel.accessibilitySettings')}
        </Text>
      </TouchableOpacity>

      {/* Medical disclaimer note */}
      <Text style={[styles.disclaimerSmall, { color: colors.subText, fontSize: 12 * fontScale }]}>
        {t('games.dhopkhel.shortDisclaimer')}
      </Text>
    </ScrollView>
  );

  /* -----------------------------------------------------------
     Re-usable Progress & Mastery Header Bar
  ----------------------------------------------------------- */
  const renderProgressHeader = () => {
    const activeLevelObj = levels[selectedLevel] || levels.easy;
    return (
      <View
        style={[
          styles.progressHeaderCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.progressTopRow}>
          {/* Level Pill */}
          <View
            style={[
              styles.progressLevelPill,
              {
                backgroundColor:
                  selectedLevel === 'easy'
                    ? isDarkMode
                      ? '#064E3B'
                      : '#D1FAE5'
                    : selectedLevel === 'medium'
                    ? isDarkMode
                      ? '#1E3A8A'
                      : '#DBEAFE'
                    : isDarkMode
                    ? '#78350F'
                    : '#FEF3C7',
              },
            ]}
          >
            <Ionicons
              name={selectedLevel === 'hard' ? 'trophy' : selectedLevel === 'medium' ? 'ribbon' : 'leaf'}
              size={15}
              color={
                selectedLevel === 'easy'
                  ? '#059669'
                  : selectedLevel === 'medium'
                  ? '#2563EB'
                  : '#D97706'
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.progressLevelPillText,
                {
                  color:
                    selectedLevel === 'easy'
                      ? '#059669'
                      : selectedLevel === 'medium'
                      ? '#2563EB'
                      : '#D97706',
                  fontSize: 13 * fontScale,
                },
              ]}
            >
              {activeLevelObj.badge}
            </Text>
          </View>

          {/* Progress Percentage Display */}
          <View style={styles.progressPercentContainer}>
            <Text style={[styles.progressPercentLabel, { color: colors.subText, fontSize: 13 * fontScale }]}>
              {t('games.dhopkhel.progress', { percent: tierProgressPercent })}
            </Text>
          </View>

          {/* Star / Score Counter */}
          <View
            style={[
              styles.progressScorePill,
              { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' },
            ]}
          >
            <Ionicons name="star" size={14} color="#EAB308" style={{ marginRight: 4 }} />
            <Text style={[styles.progressScoreText, { color: colors.text, fontSize: 13 * fontScale }]}>
              {roundStats.score || 0}
            </Text>
          </View>
        </View>

        {/* Visual Progress Bar Track */}
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.max(6, Math.min(100, tierProgressPercent))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  /* -----------------------------------------------------------
     Screen 2: LEVEL UNLOCKED CELEBRATION
  ----------------------------------------------------------- */
  const renderLevelUnlocked = () => {
    const nextLevelObj = levels[selectedLevel] || levels.medium;
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.milestoneCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.primary,
            },
          ]}
        >
          <View
            style={[
              styles.milestoneIconCircle,
              { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' },
            ]}
          >
            <Ionicons name="sparkles" size={56} color={colors.primary} />
          </View>

          <Text style={[styles.milestoneTitle, { color: colors.primary, fontSize: 28 * fontScale }]}>
            {t('games.dhopkhel.levelUnlockedTitle')}
          </Text>

          <Text style={[styles.milestoneSub, { color: colors.text, fontSize: 18 * fontScale }]}>
            {t('games.dhopkhel.levelUnlockedSub', { level: nextLevelObj.badge })}
          </Text>

          <View
            style={[
              styles.unlockedLevelPreview,
              {
                backgroundColor: isDarkMode ? '#0B1320' : '#F0FDF4',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.unlockedLevelName, { color: colors.primary, fontSize: 20 * fontScale }]}>
              {nextLevelObj.name}
            </Text>
            <Text style={[styles.unlockedLevelDetail, { color: colors.subText, fontSize: 14 * fontScale }]}>
              {nextLevelObj.subtitle} · {nextLevelObj.description}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 20,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={() => {
            handleStartRound(selectedLevel);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.continueNextLevel', { level: nextLevelObj.badge })}
        >
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 20 * fontScale }]}>
            {t('games.dhopkhel.continueNextLevel', { level: nextLevelObj.badge })}
          </Text>
          <Ionicons name="arrow-forward" size={24} color={colors.btnText} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen: GAME COMPLETE MASTERY
  ----------------------------------------------------------- */
  const renderComplete = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.milestoneCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.accent,
            },
          ]}
        >
          <View
            style={[
              styles.milestoneIconCircle,
              { backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7' },
            ]}
          >
            <Ionicons name="trophy" size={56} color={colors.accent} />
          </View>

          <Text style={[styles.milestoneTitle, { color: colors.accent, fontSize: 28 * fontScale }]}>
            {t('games.dhopkhel.gameCompleteTitle')}
          </Text>

          <Text style={[styles.milestoneSub, { color: colors.text, fontSize: 18 * fontScale }]}>
            {t('games.dhopkhel.gameCompleteSub')}
          </Text>

          <View
            style={[
              styles.unlockedLevelPreview,
              {
                backgroundColor: isDarkMode ? '#0B1320' : '#FFFBEB',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.unlockedLevelName, { color: colors.text, fontSize: 18 * fontScale }]}>
              Total Rounds: {roundStats.roundsCompleted}
            </Text>
            <Text style={[styles.unlockedLevelDetail, { color: colors.subText, fontSize: 14 * fontScale }]}>
              Final Score: {roundStats.score || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 20,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={handleRestart}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.playAgain')}
        >
          <Ionicons name="refresh" size={24} color={colors.btnText} style={{ marginRight: 8 }} />
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 20 * fontScale }]}>
            {t('games.dhopkhel.playAgain')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              marginTop: 12,
              paddingVertical: 14 * btnScale,
            },
          ]}
          onPress={() => {
            if (onExit) onExit();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.backToGames')}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryBtnText, { color: colors.text, fontSize: 16 * fontScale }]}>
            {t('games.dhopkhel.backToGames')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen 3: INSTRUCTIONS
  ----------------------------------------------------------- */
  const renderInstructions = () => {
    const activeLevelObj = levels[selectedLevel] || levels.easy;
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 26 * fontScale }]}>
          {t('games.dhopkhel.howToPlay')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.primary, fontSize: 17 * fontScale }]}>
          {activeLevelObj.name} · {activeLevelObj.subtitle}
        </Text>

        <View
          style={[
            styles.instructionBox,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Step 1 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                {t('games.dhopkhel.step1Title')}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                {t('games.dhopkhel.step1Desc')}
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                {t('games.dhopkhel.step2Title')}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                {t('games.dhopkhel.step2Desc')}
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                {t('games.dhopkhel.step3Title')}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                {t('games.dhopkhel.step3Desc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Voice caption */}
        <VoiceCaption
          text={voiceText}
          enabled={audio}
          contrast={contrast}
          accessibilityLabel={t('games.dhopkhel.accessibilityVoiceInstruction', { text: voiceText })}
        />

        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 20,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={() => handleStartRound(selectedLevel)}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.accessibilityStart')}
        >
          <Ionicons name="play" size={24} color={colors.btnText} style={{ marginRight: 8 }} />
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
            {t('games.dhopkhel.start')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen 4: PLAYING (Observation Stage)
  ----------------------------------------------------------- */
  const renderPlaying = () => {
    const activeLevelObj = levels[selectedLevel] || levels.easy;
    return (
      <View style={styles.playingContainer}>
        {/* Landscape scenery */}
        <AssamLandscape contrast={contrast} isDarkMode={isDarkMode} />

        {/* Progress & Tier Indicator */}
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          {renderProgressHeader()}
        </View>

        {/* Status card at top */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: colors.text, fontSize: 17 * fontScale }]}>
            {statusMessage}
          </Text>
          <Text style={[styles.statusSub, { color: colors.subText, fontSize: 13 * fontScale }]}>
            {t('games.dhopkhel.moveCounter', { current: stepIndex, total: activeLevelObj.moves })}
          </Text>
        </View>

        {/* Interactive Field with 3 Players */}
        <View style={styles.playingField}>
          {/* Player 1 (Top Center) */}
          <View style={styles.playerPosTop}>
            <PlayerAvatar
              player={players[0]}
              hasDhop={currentHolder === 1 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
          </View>

          {/* Player 2 (Bottom Left) & Player 3 (Bottom Right) */}
          <View style={styles.playerPosBottomRow}>
            <PlayerAvatar
              player={players[1]}
              hasDhop={currentHolder === 2 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
            <PlayerAvatar
              player={players[2]}
              hasDhop={currentHolder === 3 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
          </View>

          {/* Animated Dhop Ball */}
          {isBallVisible && (
            <Animated.View
              style={[
                styles.animatedDhop,
                {
                  transform: [
                    { translateX: ballPosAnim.x },
                    { translateY: ballPosAnim.y },
                  ],
                  opacity: ballOpacityAnim,
                },
              ]}
              pointerEvents="none"
            >
              <DhopBall
                size={50}
                contrast={contrast}
                accessibilityLabel={t('games.dhopkhel.accessibilityDhopBall')}
              />
            </Animated.View>
          )}
        </View>

        {/* Voice caption at bottom */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <VoiceCaption
            text={voiceText}
            enabled={audio}
            contrast={contrast}
            accessibilityLabel={t('games.dhopkhel.accessibilityVoiceInstruction', { text: voiceText })}
          />
        </View>
      </View>
    );
  };

  /* -----------------------------------------------------------
     Screen 5: RECALL ("WHO HAS THE DHOP?")
  ----------------------------------------------------------- */
  const renderRecall = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Progress & Tier Indicator */}
      {renderProgressHeader()}

      {/* Header prompt */}
      <View
        style={[
          styles.recallPromptCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.recallDhopIcon}>
          <DhopBall
            size={54}
            contrast={contrast}
            accessibilityLabel={t('games.dhopkhel.accessibilityDhopBall')}
          />
        </View>
        <Text style={[styles.recallTitle, { color: colors.text, fontSize: 26 * fontScale }]}>
          {t('games.dhopkhel.recallTitle')}
        </Text>
        <Text style={[styles.recallSubtitle, { color: colors.subText, fontSize: 16 * fontScale }]}>
          {t('games.dhopkhel.recallSubtitle')}
        </Text>
      </View>

      {/* Voice caption */}
      <VoiceCaption
        text={voiceText}
        enabled={audio}
        contrast={contrast}
        accessibilityLabel={t('games.dhopkhel.accessibilityVoiceInstruction', { text: voiceText })}
      />

      {/* Three large answer buttons */}
      <View style={styles.answersContainer}>
        {players.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.playerAnswerBtn,
              {
                backgroundColor: colors.cardBg,
                borderColor: p.color,
                borderLeftWidth: 10,
                paddingVertical: 18 * btnScale,
              },
            ]}
            onPress={() => handleAnswer(p.id)}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilityChoosePlayer', { player: p.name })}
          >
            <View
              style={[
                styles.answerNumBadge,
                { backgroundColor: p.color },
              ]}
            >
              <Text style={styles.answerNumText}>{p.id}</Text>
            </View>

            <View style={styles.answerTextContainer}>
              <Text style={[styles.answerBtnTitle, { color: colors.text, fontSize: 22 * fontScale }]}>
                {p.name}
              </Text>
              <Text style={[styles.answerBtnSub, { color: colors.subText, fontSize: 14 * fontScale }]}>
                {p.label}
              </Text>
            </View>

            <Ionicons name="chevron-forward-circle" size={28} color={p.color} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  /* -----------------------------------------------------------
     Screen 6: FEEDBACK (Positive & Encouraging)
  ----------------------------------------------------------- */
  const renderFeedback = () => {
    const finalHolder = moveSequence[moveSequence.length - 1];
    const correctPlayer = players.find((p) => p.id === finalHolder) || { name: `Player ${finalHolder}` };

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress & Tier Indicator */}
        {renderProgressHeader()}

        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: isCorrect ? colors.primary : colors.accent,
              borderWidth: 3,
            },
          ]}
        >
          {/* Gentle Icon */}
          <View
            style={[
              styles.feedbackIconCircle,
              {
                backgroundColor: isCorrect
                  ? isDarkMode
                    ? '#064E3B'
                    : '#D1FAE5'
                  : isDarkMode
                  ? '#78350F'
                  : '#FEF3C7',
              },
            ]}
          >
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'heart'}
              size={56}
              color={isCorrect ? colors.primary : colors.accent}
            />
          </View>

          {/* Heading */}
          <Text
            style={[
              styles.feedbackTitle,
              {
                color: isCorrect ? colors.primary : colors.accent,
                fontSize: 28 * fontScale,
              },
            ]}
          >
            {isCorrect ? t('games.dhopkhel.feedbackCorrectTitle') : t('games.dhopkhel.feedbackIncorrectTitle')}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.feedbackSub, { color: colors.text, fontSize: 18 * fontScale }]}>
            {isCorrect
              ? t('games.dhopkhel.feedbackCorrectSub')
              : t('games.dhopkhel.feedbackIncorrectSub', { player: correctPlayer?.name })}
          </Text>

          {/* Visual confirmation showing who held the Dhop */}
          <View style={styles.revealedPlayerContainer}>
            <DhopBall
              size={42}
              contrast={contrast}
              accessibilityLabel={t('games.dhopkhel.accessibilityDhopBall')}
            />
            <Text style={[styles.revealedPlayerText, { color: colors.text, fontSize: 16 * fontScale }]}>
              {t('games.dhopkhel.revealedPlayer', { player: correctPlayer?.name })}
            </Text>
          </View>
        </View>

        {/* Voice caption */}
        <VoiceCaption
          text={voiceText}
          enabled={audio}
          contrast={contrast}
          accessibilityLabel={t('games.dhopkhel.accessibilityVoiceInstruction', { text: voiceText })}
        />

        {/* Action Buttons */}
        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 18,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={handleTryAgain}
          accessibilityRole="button"
          accessibilityLabel={
            isCorrect
              ? t('games.dhopkhel.accessibilityNextRound')
              : t('games.dhopkhel.accessibilityTryAgain')
          }
        >
          <Ionicons
            name={isCorrect ? 'arrow-forward' : 'refresh'}
            size={24}
            color={colors.btnText}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
            {isCorrect ? t('games.dhopkhel.nextRound') : t('games.dhopkhel.tryAgain')}
          </Text>
        </TouchableOpacity>

        {/* Restart Game button: resets to Easy mode */}
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              marginTop: 12,
              paddingVertical: 14 * btnScale,
            },
          ]}
          onPress={handleRestart}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.restartGame')}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryBtnText, { color: colors.text, fontSize: 16 * fontScale }]}>
            {t('games.dhopkhel.restartGame')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen 7: SETTINGS & ACCESSIBILITY
  ----------------------------------------------------------- */
  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 26 * fontScale }]}>
        {t('games.dhopkhel.settingsTitle')}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.subText, fontSize: 15 * fontScale }]}>
        {t('games.dhopkhel.settingsSub')}
      </Text>

      {/* Text Size Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          {t('games.dhopkhel.textSize')}
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              textSize === 'large' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTextSize('large')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetTextLarge')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: textSize === 'large' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.sizeLarge')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              textSize === 'extraLarge' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTextSize('extraLarge')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetTextExtraLarge')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: textSize === 'extraLarge' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.sizeExtraLarge')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Button Size Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          {t('games.dhopkhel.buttonSize')}
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              buttonSize === 'large' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setButtonSize('large')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetButtonLarge')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: buttonSize === 'large' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.sizeLarge')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              buttonSize === 'extraLarge' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setButtonSize('extraLarge')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetButtonExtraLarge')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: buttonSize === 'extraLarge' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.sizeExtraLarge')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animation Speed Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          {t('games.dhopkhel.animationSpeed')}
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              animationSpeed === 'slow' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAnimationSpeed('slow')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetSpeedSlow')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: animationSpeed === 'slow' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.speedSlow')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              animationSpeed === 'normal' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAnimationSpeed('normal')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetSpeedNormal')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: animationSpeed === 'normal' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.speedNormal')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio Voice Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          {t('games.dhopkhel.audioGuidance')}
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              audio === true && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAudio(true)}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetAudioOn')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: audio === true ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.audioOn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              audio === false && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAudio(false)}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetAudioOff')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: audio === false ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.audioOff')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contrast Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          {t('games.dhopkhel.contrast')}
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              contrast === 'normal' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setContrast('normal')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetContrastStandard')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: contrast === 'normal' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.contrastStandard')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              contrast === 'high' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setContrast('high')}
            accessibilityRole="button"
            accessibilityLabel={t('games.dhopkhel.accessibilitySetContrastHigh')}
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: contrast === 'high' ? colors.btnText : colors.text },
              ]}
            >
              {t('games.dhopkhel.contrastHigh')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cultural Information Card */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: isDarkMode ? '#1E293B' : '#ECFDF5',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.infoCardTitle, { color: colors.primary, fontSize: 16 * fontScale }]}>
          {t('games.dhopkhel.aboutTitle')}
        </Text>
        <Text style={[styles.infoCardText, { color: colors.text, fontSize: 14 * fontScale }]}>
          {t('games.dhopkhel.aboutText')}
        </Text>
      </View>

      {/* Medical Disclaimer Card */}
      <View
        style={[
          styles.disclaimerCard,
          {
            backgroundColor: isDarkMode ? '#281E15' : '#FFFBEB',
            borderColor: colors.accent,
          },
        ]}
      >
        <Ionicons name="information-circle" size={24} color={colors.accent} style={{ marginBottom: 6 }} />
        <Text style={[styles.disclaimerCardTitle, { color: colors.accent, fontSize: 15 * fontScale }]}>
          {t('games.dhopkhel.medicalDisclaimerTitle')}
        </Text>
        <Text style={[styles.disclaimerCardText, { color: colors.text, fontSize: 13 * fontScale }]}>
          {t('games.dhopkhel.medicalDisclaimerText')}
        </Text>
      </View>

      {/* Private Caregiver Performance & Analytics Section (Requirement 25) */}
      <View
        style={[
          styles.caregiverCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.caregiverHeaderRow}>
          <Ionicons name="stats-chart" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.caregiverTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
            Performance & Analytics Profile
          </Text>
        </View>
        <Text style={[styles.caregiverSub, { color: colors.subText, fontSize: 12 * fontScale }]}>
          Private data for caregivers & wellness monitoring (hidden from player)
        </Text>

        <View style={styles.caregiverMetricsGrid}>
          <View style={[styles.caregiverMetricBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
            <Text style={[styles.caregiverMetricVal, { color: colors.primary }]}>
              {caregiverStats && caregiverStats.roundsPlayed > 0 ? `${caregiverStats.accuracy}%` : '—'}
            </Text>
            <Text style={[styles.caregiverMetricLabel, { color: colors.subText }]}>Accuracy</Text>
          </View>

          <View style={[styles.caregiverMetricBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
            <Text style={[styles.caregiverMetricVal, { color: colors.text }]}>
              {caregiverStats && caregiverStats.averageResponseTimeSec > 0
                ? `${caregiverStats.averageResponseTimeSec}s`
                : '—'}
            </Text>
            <Text style={[styles.caregiverMetricLabel, { color: colors.subText }]}>Avg Response</Text>
          </View>

          <View style={[styles.caregiverMetricBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
            <Text style={[styles.caregiverMetricVal, { color: colors.text }]}>
              {caregiverStats && caregiverStats.roundsPlayed > 0 ? `${caregiverStats.consistencyScore}%` : '—'}
            </Text>
            <Text style={[styles.caregiverMetricLabel, { color: colors.subText }]}>Consistency</Text>
          </View>

          <View style={[styles.caregiverMetricBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
            <Text style={[styles.caregiverMetricVal, { color: colors.primary, textTransform: 'capitalize' }]}>
              {caregiverStats?.currentDifficulty || selectedLevel}
            </Text>
            <Text style={[styles.caregiverMetricLabel, { color: colors.subText }]}>Difficulty</Text>
          </View>
        </View>

        <View style={styles.caregiverTrendRow}>
          <Text style={[styles.caregiverTrendLabel, { color: colors.subText, fontSize: 13 * fontScale }]}>
            Rounds Played: <Text style={{ color: colors.text, fontWeight: '700' }}>{caregiverStats?.roundsPlayed || 0}</Text>
          </Text>
          <Text style={[styles.caregiverTrendLabel, { color: colors.subText, fontSize: 13 * fontScale }]}>
            Trend: <Text style={{ color: colors.primary, fontWeight: '700' }}>{caregiverStats?.trend || 'Stable'}</Text>
          </Text>
        </View>
      </View>

      {/* Done Button */}
      <TouchableOpacity
        style={[
          styles.largePrimaryBtn,
          {
            backgroundColor: colors.primary,
            marginTop: 18,
            paddingVertical: 16 * btnScale,
          },
        ]}
        onPress={() => setScreen(SCREENS.WELCOME)}
        accessibilityRole="button"
        accessibilityLabel={t('games.dhopkhel.accessibilitySaveReturn')}
      >
        <Ionicons name="checkmark" size={24} color={colors.btnText} style={{ marginRight: 8 }} />
        <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 20 * fontScale }]}>
          {t('games.dhopkhel.saveAndReturn')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      {/* Top Navigation Bar with Back Button */}
      <View
        style={[
          styles.gameTopBar,
          {
            backgroundColor: colors.cardBg,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backTouchTarget}
          onPress={handleHeaderBack}
          accessibilityRole="button"
          accessibilityLabel={t('games.dhopkhel.accessibilityGoBack')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
          <Text style={[styles.backButtonLabel, { color: colors.primary, fontSize: 16 * fontScale }]}>
            {screen === SCREENS.WELCOME ? t('games.dhopkhel.backToGames') : t('common.back')}
          </Text>
        </TouchableOpacity>

        {/* Audio Mute Quick Toggle and Language Selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageSelector compact={true} />
          <TouchableOpacity
            style={[
              styles.muteQuickToggle,
              { backgroundColor: audio ? colors.cardBg : '#EF4444', marginLeft: 8 },
            ]}
            onPress={() => setAudio((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              audio
                ? t('games.dhopkhel.accessibilityMuteAudio')
                : t('games.dhopkhel.accessibilityUnmuteAudio')
            }
          >
            <Ionicons
              name={audio ? 'volume-high-outline' : 'volume-mute'}
              size={22}
              color={audio ? colors.text : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Active Screen */}
      {screen === SCREENS.WELCOME && renderWelcome()}
      {screen === SCREENS.INSTRUCTIONS && renderInstructions()}
      {screen === SCREENS.PLAYING && renderPlaying()}
      {screen === SCREENS.RECALL && renderRecall()}
      {screen === SCREENS.FEEDBACK && renderFeedback()}
      {screen === SCREENS.LEVEL_UNLOCKED && renderLevelUnlocked()}
      {screen === SCREENS.COMPLETE && renderComplete()}
      {screen === SCREENS.SETTINGS && renderSettings()}
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------
   Styles
------------------------------------------------------------- */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  gameTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backTouchTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButtonLabel: {
    fontWeight: '600',
    marginLeft: 6,
  },
  muteQuickToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tagline & Header
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  taglineText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  mainSubtitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  culturalNotice: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Welcome Hero Card
  welcomeHeroCard: {
    width: '100%',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  welcomeDhopHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  dhopBallLabel: {
    fontWeight: '700',
  },
  heroPlayersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },

  // Spoken voice caption banner
  voiceCaptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    marginBottom: 16,
  },
  voiceCaptionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Action buttons
  largePrimaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 18,
    minHeight: 58,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  largePrimaryBtnText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 52,
  },
  secondaryBtnText: {
    fontWeight: '600',
  },
  disclaimerSmall: {
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },

  // Section Headers
  sectionHeading: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '600',
  },

  // Difficulty Level Card
  levelCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    elevation: 1,
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelTitleText: {
    fontWeight: '800',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    marginHorizontal: 2,
  },
  levelSubtitleText: {
    fontWeight: '600',
  },
  levelDescText: {
    lineHeight: 18,
  },

  // Instructions
  instructionBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '800',
    marginBottom: 2,
  },
  stepDesc: {
    lineHeight: 20,
  },

  // Playing Scene
  playingContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  statusText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSub: {
    marginTop: 2,
    fontWeight: '600',
  },
  playingField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 330,
  },
  playerPosTop: {
    alignItems: 'center',
    marginBottom: 24,
  },
  playerPosBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    paddingHorizontal: 10,
  },
  animatedDhop: {
    position: 'absolute',
    zIndex: 99,
  },

  // Dhop Ball Component
  dhopContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  dhopInnerRing: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  dhopStitchHorizontal: {
    position: 'absolute',
    height: 1.5,
  },
  dhopStitchVertical: {
    position: 'absolute',
    width: 1.5,
  },
  dhopHighlight: {
    position: 'absolute',
    top: 5,
    left: 7,
    opacity: 0.7,
  },

  // Player Avatar Component
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 50,
  },
  characterHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  characterHair: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: 14,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  characterEyesRow: {
    flexDirection: 'row',
    width: 18,
    justifyContent: 'space-between',
    marginTop: 6,
  },
  characterEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  characterShoulders: {
    width: 58,
    height: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 4,
  },
  playerNumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  playerNumText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  playerLabelContainer: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  playerLabelText: {
    letterSpacing: 0.3,
  },

  // Assam Landscape Background Elements
  landscapeSun: {
    position: 'absolute',
    top: 30,
    right: 36,
    width: 54,
    height: 54,
    borderRadius: 27,
    opacity: 0.6,
  },
  landscapeHillFar: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    right: -40,
    height: 180,
    borderTopLeftRadius: 240,
    borderTopRightRadius: 260,
    opacity: 0.5,
  },
  landscapeHillNear: {
    position: 'absolute',
    bottom: 40,
    left: -60,
    right: -40,
    height: 170,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 220,
    opacity: 0.7,
  },
  landscapeFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    opacity: 0.8,
  },

  // Recall Screen
  recallPromptCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  recallDhopIcon: {
    marginBottom: 12,
  },
  recallTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  recallSubtitle: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  answersContainer: {
    width: '100%',
    gap: 12,
  },
  playerAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 68,
    elevation: 2,
  },
  answerNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  answerNumText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  answerTextContainer: {
    flex: 1,
  },
  answerBtnTitle: {
    fontWeight: '800',
  },
  answerBtnSub: {
    marginTop: 2,
  },

  // Feedback Screen
  feedbackCard: {
    width: '100%',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  feedbackIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedbackTitle: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  feedbackSub: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    fontWeight: '600',
  },
  revealedPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  revealedPlayerText: {
    fontWeight: '700',
    marginLeft: 10,
  },

  // Settings
  settingsGroupCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  settingsGroupTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  settingOptionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  settingOptionText: {
    fontWeight: '700',
    fontSize: 15,
  },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontWeight: '800',
    marginBottom: 6,
  },
  infoCardText: {
    lineHeight: 20,
  },
  disclaimerCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  disclaimerCardTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  disclaimerCardText: {
    lineHeight: 19,
    fontStyle: 'italic',
  },
  caregiverCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  caregiverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  caregiverTitle: {
    fontWeight: '800',
  },
  caregiverSub: {
    marginBottom: 14,
    lineHeight: 16,
  },
  caregiverMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  caregiverMetricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  caregiverMetricVal: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  caregiverMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  caregiverTrendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  caregiverTrendLabel: {
    fontWeight: '500',
  },

  // Progress Header Card
  progressHeaderCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  progressLevelPillText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressPercentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  progressPercentLabel: {
    fontWeight: '700',
  },
  progressScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressScoreText: {
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Milestone / Level Unlocked Cards
  milestoneCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  milestoneIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  milestoneSub: {
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 18,
  },
  unlockedLevelPreview: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  unlockedLevelName: {
    fontWeight: '800',
    marginBottom: 4,
  },
  unlockedLevelDetail: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
