import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const COLORS = [
  {
    id: 'red',
    label: 'Red',
    labelKey: 'games.sequence.colors.red',
    baseColor: '#EF4444',
    activeColor: '#FCA5A5',
    textColor: '#FFFFFF',
  },
  {
    id: 'blue',
    label: 'Blue',
    labelKey: 'games.sequence.colors.blue',
    baseColor: '#3B82F6',
    activeColor: '#93C5FD',
    textColor: '#FFFFFF',
  },
  {
    id: 'green',
    label: 'Green',
    labelKey: 'games.sequence.colors.green',
    baseColor: '#10B981',
    activeColor: '#6EE7B7',
    textColor: '#FFFFFF',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    labelKey: 'games.sequence.colors.yellow',
    baseColor: '#F59E0B',
    activeColor: '#FDE68A',
    textColor: '#78350F',
  },
];

const DIFFICULTY_SETTINGS = {
  Easy: { circleCount: 3, flashDuration: 850, pauseDuration: 450, descKey: 'games.sequence.gentleDesc', description: 'Gentle: 3 Colors • Relaxed Pace' },
  Medium: { circleCount: 4, flashDuration: 600, pauseDuration: 300, descKey: 'games.sequence.standardDesc', description: 'Standard: 4 Colors • Moderate Pace' },
  Hard: { circleCount: 4, flashDuration: 400, pauseDuration: 180, descKey: 'games.sequence.challengingDesc', description: 'Challenging: 4 Colors • Fast Pace' },
};

export default function SequenceGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'showing' | 'playing' | 'gameover'
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [activeCircle, setActiveCircle] = useState(null);
  const [userTappedCircle, setUserTappedCircle] = useState(null);
  const [statusDescriptor, setStatusDescriptor] = useState({ key: 'statusStart', fallback: 'Press "Start Game" to begin!', params: {} });
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer while game is active
  useEffect(() => {
    let interval = null;
    if ((gameState === 'showing' || gameState === 'playing') && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, startTime]);

  // Reactive status message
  const statusMessage = useMemo(() => {
    if (!statusDescriptor.key) return '';
    return t(`games.sequence.${statusDescriptor.key}`, statusDescriptor.fallback, statusDescriptor.params);
  }, [statusDescriptor, t, currentLanguage]);

  // Flash the sequence to the user
  const playSequence = (seqToPlay) => {
    clearAllTimeouts();
    setGameState('showing');
    setActiveCircle(null);
    setUserTappedCircle(null);
    setStatusDescriptor({ key: 'statusWatch', fallback: 'Watch the sequence...' });

    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy;
    const { flashDuration, pauseDuration } = settings;
    const initialDelay = 600;

    seqToPlay.forEach((colorId, index) => {
      // Light up the circle
      const onTimeout = setTimeout(() => {
        setActiveCircle(colorId);
      }, initialDelay + index * (flashDuration + pauseDuration));
      timeoutsRef.current.push(onTimeout);

      // Turn off the circle
      const offTimeout = setTimeout(() => {
        setActiveCircle(null);

        // Check if this was the last item in the sequence
        if (index === seqToPlay.length - 1) {
          const readyTimeout = setTimeout(() => {
            setGameState('playing');
            setUserStep(0);
            setStatusDescriptor({ key: 'statusYourTurn', fallback: 'Your turn! Tap the circles in order.' });
          }, pauseDuration);
          timeoutsRef.current.push(readyTimeout);
        }
      }, initialDelay + index * (flashDuration + pauseDuration) + flashDuration);
      timeoutsRef.current.push(offTimeout);
    });
  };

  // Start or reset the game
  const startGame = () => {
    clearAllTimeouts();
    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setScore(0);
    setRound(1);
    setUserStep(0);

    const activeColors = COLORS.slice(0, (DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy).circleCount);
    const firstColor = activeColors[Math.floor(Math.random() * activeColors.length)].id;
    const initialSeq = [firstColor];
    setSequence(initialSeq);

    playSequence(initialSeq);
  };

  // End game handler
  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    setActiveCircle(null);
    setUserTappedCircle(null);

    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusDescriptor({ key: 'statusGameOver', fallback: 'Game Over! Good try!' });

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  // Handle user tap on a circle
  const handleCirclePress = (colorId) => {
    if (gameState !== 'playing') return;

    // Brief tactile visual feedback for user tap
    setUserTappedCircle(colorId);
    const feedbackTimeout = setTimeout(() => {
      setUserTappedCircle(null);
    }, 250);
    timeoutsRef.current.push(feedbackTimeout);

    const expectedColor = sequence[userStep];

    if (colorId === expectedColor) {
      const nextStep = userStep + 1;

      // Completed the entire sequence for this round!
      if (nextStep === sequence.length) {
        const nextScore = score + 1;
        const nextRound = round + 1;
        setScore(nextScore);
        setRound(nextRound);
        setGameState('showing');
        setStatusDescriptor({ key: 'statusNextRound', fallback: 'Great job! Get ready for the next color...' });

        // Add a new random color to sequence from active colors
        const activeColors = COLORS.slice(0, (DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy).circleCount);
        const randomColor = activeColors[Math.floor(Math.random() * activeColors.length)].id;
        const nextSequence = [...sequence, randomColor];
        setSequence(nextSequence);

        const nextRoundTimeout = setTimeout(() => {
          playSequence(nextSequence);
        }, 1100);
        timeoutsRef.current.push(nextRoundTimeout);
      } else {
        // Correct tap, advance to next expected step
        setUserStep(nextStep);
      }
    } else {
      // Incorrect tap
      handleGameOver(score);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>{t('games.sequence.title', 'Sequence Recall')}</Text>

      {/* Stats Header: Round, Score, Time */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
          <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.round', 'ROUND')}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{gameState === 'idle' ? '-' : round}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
          <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.score', 'SCORE')}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
          <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.time', 'TIME')}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{duration}s</Text>
        </View>
      </View>

      {/* Difficulty Selector (available before starting) */}
      {gameState === 'idle' && (
        <View style={styles.difficultyContainer}>
          <Text style={[styles.difficultyHeading, { color: theme.subText }]}>{t('games.sequence.selectDifficulty', 'Select Difficulty:')}</Text>
          <View style={styles.difficultyButtons}>
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: isDarkMode ? theme.cardBorder : '#E2E8F0' },
                  difficulty === diff && styles.difficultyButtonActive,
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    { color: difficulty === diff ? '#FFFFFF' : theme.text },
                    difficulty === diff && styles.difficultyButtonTextActive,
                  ]}
                >
                  {diff === 'Easy' ? t('common.easy', 'Easy') : diff === 'Medium' ? t('common.medium', 'Medium') : t('common.hard', 'Hard')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.difficultySubtitle, { color: theme.primary }]}>
            {t(DIFFICULTY_SETTINGS[difficulty]?.descKey, DIFFICULTY_SETTINGS[difficulty]?.description)}
          </Text>
        </View>
      )}

      {/* Status Banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: isDarkMode ? '#1e293b' : '#E0F2FE' },
          gameState === 'gameover' && (isDarkMode ? { backgroundColor: '#450a0a' } : styles.statusBannerGameOver),
          gameState === 'playing' && (isDarkMode ? { backgroundColor: '#052e16' } : styles.statusBannerPlaying),
        ]}
      >
        <Text style={[styles.statusText, { color: theme.text }]}>{statusMessage}</Text>
        {gameState === 'playing' && (
          <Text style={[styles.progressSubText, isDarkMode && { color: '#86efac' }]}>
            {t('games.sequence.progressStep', `Step ${userStep + 1} of ${sequence.length}`, { step: userStep + 1, total: sequence.length })}
          </Text>
        )}
      </View>

      {/* Circles Grid */}
      <View style={styles.gridContainer}>
        {difficulty === 'Easy' ? (
          <View style={styles.row}>
            {COLORS.slice(0, 3).map((item) => renderCircle(item, true))}
          </View>
        ) : (
          <>
            <View style={styles.row}>
              {COLORS.slice(0, 2).map((item) => renderCircle(item, false))}
            </View>
            <View style={styles.row}>
              {COLORS.slice(2, 4).map((item) => renderCircle(item, false))}
            </View>
          </>
        )}
      </View>

      {/* Game Over Summary */}
      {gameState === 'gameover' && (
        <View style={[styles.gameOverCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={styles.gameOverTitle}>{t('games.sequence.gameOver', 'Game Over')}</Text>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.sequence.finalScore', 'Final Score:')}</Text>
            <Text style={[styles.resultValue, { color: theme.text }]}>
              {t('games.sequence.correctRounds', `${score} correct rounds`, { score })}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.sequence.duration', 'Duration:')}</Text>
            <Text style={[styles.resultValue, { color: theme.text }]}>
              {t('games.sequence.seconds', `${duration} seconds`, { duration })}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.sequence.difficulty', 'Difficulty:')}</Text>
            <Text style={[styles.resultValue, { color: theme.text }]}>
              {difficulty === 'Easy' ? t('common.easy', 'Easy') : difficulty === 'Medium' ? t('common.medium', 'Medium') : t('common.hard', 'Hard')}
            </Text>
          </View>
        </View>
      )}

      {/* Primary Action Button: Start / Play Again */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          gameState === 'playing' && styles.secondaryButton,
        ]}
        onPress={startGame}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          gameState === 'idle'
            ? t('common.startGame', 'Start Game')
            : gameState === 'gameover'
            ? t('common.playAgain', 'Play Again')
            : t('common.restartGame', 'Restart Game')
        }
      >
        <Text style={styles.primaryButtonText}>
          {gameState === 'idle'
            ? t('common.startGame', 'Start Game')
            : gameState === 'gameover'
            ? t('common.playAgain', 'Play Again')
            : t('common.restartGame', 'Restart Game')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  function renderCircle(item, isLarge = false) {
    const isLit = activeCircle === item.id || userTappedCircle === item.id;
    const isInteractive = gameState === 'playing';
    const label = t(item.labelKey, item.label);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.circle,
          isLarge && styles.circleEasy,
          {
            backgroundColor: isLit ? item.activeColor : item.baseColor,
            borderColor: isLit ? '#FFFFFF' : '#1E293B',
            transform: [{ scale: isLit ? 1.08 : 1.0 }],
          },
          isLit && styles.circleActive,
        ]}
        onPress={() => handleCirclePress(item.id)}
        disabled={!isInteractive}
        activeOpacity={0.75}
        accessibilityLabel={`${label} circle`}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.circleLabel,
            { color: item.textColor },
            isLit && styles.circleLabelActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#3B82F6',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  difficultySubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusBanner: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  statusBannerPlaying: {
    backgroundColor: '#DCFCE7',
  },
  statusBannerGameOver: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  progressSubText: {
    fontSize: 14,
    color: '#166534',
    marginTop: 4,
    fontWeight: '500',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  circle: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    borderWidth: 3,
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  circleEasy: {
    width: 95,
    height: 95,
    borderRadius: 47.5,
    marginHorizontal: 8,
  },
  circleActive: {
    borderWidth: 4,
    elevation: 10,
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  circleLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  circleLabelActive: {
    fontWeight: '900',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: '#64748B',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

