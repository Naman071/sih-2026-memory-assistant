import { Ionicons } from "@expo/vector-icons";
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

const ICONS = ['heart', 'star', 'musical-notes', 'flower', 'leaf', 'paw', 'sunny', 'moon'];

const DIFFICULTY_SETTINGS = {
  Easy: { pairs: 3, columns: 3, flipBackDuration: 1400, descKey: 'games.memoryMatch.gentleDesc', description: 'Gentle: 3 Pairs (6 Cards)' },
  Medium: { pairs: 6, columns: 4, flipBackDuration: 1000, descKey: 'games.memoryMatch.standardDesc', description: 'Standard: 6 Pairs (12 Cards)' },
  Hard: { pairs: 8, columns: 4, flipBackDuration: 650, descKey: 'games.memoryMatch.challengingDesc', description: 'Challenging: 8 Pairs (16 Cards)' },
};

// Helper to shuffle cards using Fisher-Yates algorithm
function createShuffledDeck(diff = 'Easy') {
  const settings = DIFFICULTY_SETTINGS[diff] || DIFFICULTY_SETTINGS.Easy;
  const chosenIcons = ICONS.slice(0, settings.pairs);
  const deck = [...chosenIcons, ...chosenIcons].map((icon, index) => ({
    id: index,
    icon,
  }));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export default function MemoryMatchGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [cards, setCards] = useState(() => createShuffledDeck(initialDifficulty));
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [score, setScore] = useState(0); // number of attempts
  const [statusDescriptor, setStatusDescriptor] = useState({ key: 'statusStart', fallback: 'Press "Start Game" to begin!', params: {} });
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isProcessingMismatch, setIsProcessingMismatch] = useState(false);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer while game is active
  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && startTime) {
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
    return t(`games.memoryMatch.${statusDescriptor.key}`, statusDescriptor.fallback, statusDescriptor.params);
  }, [statusDescriptor, t, currentLanguage]);

  // Start or restart the game
  const startGame = () => {
    clearAllTimeouts();
    const newDeck = createShuffledDeck(difficulty);
    setCards(newDeck);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setScore(0);
    setIsProcessingMismatch(false);

    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setGameState('playing');
    setStatusDescriptor({ key: 'statusFind', fallback: 'Find matching pairs of cards!', params: {} });
  };

  // End game handler
  const handleGameCompletion = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    setFlippedIndices([]);

    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusDescriptor({ key: 'statusComplete', fallback: 'Wonderful! You found all pairs!', params: {} });

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  // Handle card tap
  const handleCardPress = (index) => {
    if (gameState !== 'playing' || isProcessingMismatch) return;

    // Card already flipped or matched
    if (flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    if (flippedIndices.length === 0) {
      // First card flipped
      setFlippedIndices([index]);
    } else if (flippedIndices.length === 1) {
      // Second card flipped
      const firstIndex = flippedIndices[0];
      const newFlipped = [firstIndex, index];
      setFlippedIndices(newFlipped);

      const nextScore = score + 1;
      setScore(nextScore);

      if (cards[firstIndex].icon === cards[index].icon) {
        // Matched!
        const nextMatched = [...matchedIndices, firstIndex, index];
        setMatchedIndices(nextMatched);
        setFlippedIndices([]);

        const pairsRemaining = (cards.length - nextMatched.length) / 2;
        if (pairsRemaining === 0) {
          // All pairs matched - victory!
          const finishTimeout = setTimeout(() => {
            handleGameCompletion(nextScore);
          }, 600);
          timeoutsRef.current.push(finishTimeout);
        } else {
          setStatusDescriptor({
            key: pairsRemaining === 1 ? 'statusMatchSingle' : 'statusMatch',
            fallback: `Match found! ${pairsRemaining} ${pairsRemaining === 1 ? 'pair' : 'pairs'} left.`,
            params: { pairs: pairsRemaining },
          });
        }
      } else {
        // Not a match - flip back after delay
        setIsProcessingMismatch(true);
        setStatusDescriptor({ key: 'statusMismatch', fallback: 'Not a match, try again!', params: {} });

        const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy;
        const flipBackTimeout = setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessingMismatch(false);
          setStatusDescriptor({ key: 'statusFind', fallback: 'Find matching pairs of cards!', params: {} });
        }, settings.flipBackDuration);

        timeoutsRef.current.push(flipBackTimeout);
      }
    }
  };

  const matchedPairsCount = Math.floor(matchedIndices.length / 2);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>{t('games.memoryMatch.title', 'Memory Match')}</Text>

      {/* Stats Header: Pairs Matched, Attempts/Score, Time */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
          <Text style={[styles.statLabel, { color: theme.subText }]}>{t('games.memoryMatch.pairs', 'PAIRS')}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {matchedPairsCount}/{cards.length / 2}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
          <Text style={[styles.statLabel, { color: theme.subText }]}>{t('games.memoryMatch.attempts', 'ATTEMPTS')}</Text>
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
                onPress={() => {
                  setDifficulty(diff);
                  setCards(createShuffledDeck(diff));
                }}
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
          gameState === 'gameover' && (isDarkMode ? { backgroundColor: '#143823' } : styles.statusBannerGameOver),
          gameState === 'playing' && (isDarkMode ? { backgroundColor: '#142a42' } : styles.statusBannerPlaying),
        ]}
      >
        <Text style={[styles.statusText, { color: theme.text }]}>{statusMessage}</Text>
      </View>

      {/* Dynamic Cards Grid */}
      <View style={styles.gridContainer}>
        {Array.from(
          { length: Math.ceil(cards.length / (DIFFICULTY_SETTINGS[difficulty]?.columns || 4)) },
          (_, rowIndex) => {
            const cols = DIFFICULTY_SETTINGS[difficulty]?.columns || 4;
            return (
              <View key={rowIndex} style={styles.row}>
                {cards
                  .slice(rowIndex * cols, rowIndex * cols + cols)
                  .map((card, colIndex) => {
                    const cardIndex = rowIndex * cols + colIndex;
                    return renderCard(card, cardIndex);
                  })}
              </View>
            );
          }
        )}
      </View>

      {/* Game Over Summary */}
      {gameState === 'gameover' && (
        <View style={[styles.gameOverCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={styles.gameOverTitle}>{t('games.memoryMatch.gameComplete', 'Game Complete!')}</Text>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.memoryMatch.totalAttempts', 'Total Attempts:')}</Text>
            <Text style={[styles.resultValue, { color: theme.text }]}>{score}</Text>
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
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.memoryMatch.pairsMatched', 'Pairs Matched:')}</Text>
            <Text style={[styles.resultValue, { color: theme.text }]}>{cards.length / 2} / {cards.length / 2}</Text>
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

  function renderCard(card, index) {
    const isFlipped = flippedIndices.includes(index);
    const isMatched = matchedIndices.includes(index);
    const isRevealed = isFlipped || isMatched;
    const isInteractive = gameState === 'playing' && !isRevealed && !isProcessingMismatch;

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          difficulty === 'Easy' && styles.cardLarge,
          isRevealed
            ? [styles.cardFlipped, { backgroundColor: theme.cardBackground, borderColor: isDarkMode ? '#60a5fa' : '#3B82F6' }]
            : styles.cardCovered,
          isMatched && [styles.cardMatched, isDarkMode && { backgroundColor: '#064e3b', borderColor: '#22c55e' }],
          isFlipped && styles.cardActive,
        ]}
        onPress={() => handleCardPress(index)}
        disabled={!isInteractive}
        activeOpacity={0.7}
        accessibilityLabel={
          isRevealed
            ? t('games.memoryMatch.cardRevealed', `${card.icon} card`, { icon: card.icon })
            : t('games.memoryMatch.cardAtPosition', `Card at position ${index + 1}`, { pos: index + 1 })
        }
        accessibilityRole="button"
      >
        {isRevealed ? (
          <Ionicons name={card.icon} size={34} color={theme.primary} />
        ) : (
          <Ionicons name="help" size={26} color="#93C5FD" />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 88,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  difficultyHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#2563EB',
  },
  difficultyButtonText: {
    fontSize: 13,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  statusBannerPlaying: {
    backgroundColor: '#EFF6FF',
  },
  statusBannerGameOver: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  card: {
    width: 74,
    height: 74,
    borderRadius: 12,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  cardLarge: {
    width: 94,
    height: 94,
    marginHorizontal: 6,
    marginVertical: 6,
  },
  cardCovered: {
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  cardFlipped: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  cardActive: {
    borderColor: '#2563EB',
    transform: [{ scale: 1.04 }],
    elevation: 6,
  },
  cardMatched: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2.5,
    borderColor: '#16A34A',
    opacity: 0.9,
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardCoverText: {
    fontSize: 26,
    color: '#93C5FD',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  resultLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
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

