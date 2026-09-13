import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SUPERMARKET_ITEMS = [
  { id: 'apple', label: 'Apple', icon: 'food-apple' },
  { id: 'bread', label: 'Bread', icon: 'bread-slice' },
  { id: 'milk', label: 'Milk', icon: 'cup-water' },
  { id: 'croissant', label: 'Croissant', icon: 'food-croissant' },
  { id: 'cheese', label: 'Cheese', icon: 'cheese' },
  { id: 'carrot', label: 'Carrot', icon: 'carrot' },
  { id: 'egg', label: 'Eggs', icon: 'egg' },
  { id: 'meat', label: 'Steak', icon: 'food-steak' },
  { id: 'orange', label: 'Orange', icon: 'fruit-citrus' },
  { id: 'chicken', label: 'Chicken', icon: 'food-drumstick' },
  { id: 'fish', label: 'Fish', icon: 'fish' },
  { id: 'grapes', label: 'Grapes', icon: 'fruit-grapes' },
  { id: 'corn', label: 'Corn', icon: 'corn' },
  { id: 'cookie', label: 'Cookie', icon: 'cookie' },
  { id: 'cupcake', label: 'Cupcake', icon: 'cupcake' },
  { id: 'pizza', label: 'Pizza', icon: 'pizza' },
];

const MAX_ROUNDS = 5;

const DIFFICULTY_CONFIG = {
  Easy: { listSize: 2, shelfSize: 4, descKey: 'games.supermarket.gentleDesc', description: 'Gentle: 2 Items on List • 4 on Shelf' },
  Medium: { listSize: 3, shelfSize: 6, descKey: 'games.supermarket.standardDesc', description: 'Standard: 3 Items on List • 6 on Shelf' },
  Hard: { listSize: 5, shelfSize: 10, descKey: 'games.supermarket.challengingDesc', description: 'Challenging: 5 Items on List • 10 on Shelf' },
};

function generateRoundData(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
  const listSize = config.listSize;
  const shelfSize = config.shelfSize;

  // Shuffle items to pick
  const shuffled = [...SUPERMARKET_ITEMS].sort(() => Math.random() - 0.5);
  
  // Pick target items
  const targetItems = shuffled.slice(0, listSize);
  
  // Pick distractors
  const distractorItems = shuffled.slice(listSize, shelfSize);
  
  // Combine and shuffle for the shelf
  const shelfItems = [...targetItems, ...distractorItems].sort(() => Math.random() - 0.5);

  return {
    targetItems,
    shelfItems,
  };
}

export default function SupermarketGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [statusDescriptor, setStatusDescriptor] = useState({ key: 'statusStart', fallback: 'Press "Start Game" to go shopping!', params: {} });
  
  const [currentRoundData, setCurrentRoundData] = useState(() => generateRoundData(initialDifficulty));
  const [foundItemIds, setFoundItemIds] = useState([]);
  const [wrongFeedbackId, setWrongFeedbackId] = useState(null);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer
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
    return t(`games.supermarket.${statusDescriptor.key}`, statusDescriptor.fallback, statusDescriptor.params);
  }, [statusDescriptor, t, currentLanguage]);

  const startGame = () => {
    clearAllTimeouts();
    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setScore(0);
    setRound(1);
    setFoundItemIds([]);
    setWrongFeedbackId(null);
    setCurrentRoundData(generateRoundData(difficulty));
    setGameState('playing');
    setStatusDescriptor({ key: 'statusFind', fallback: 'Find the items on your list.', params: {} });
  };

  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusDescriptor({ key: 'statusComplete', fallback: 'Shopping complete! Great job!', params: {} });

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  const handleItemPress = (item) => {
    if (gameState !== 'playing') return;
    if (foundItemIds.includes(item.id)) return; // Already found

    clearAllTimeouts();

    const isTarget = currentRoundData.targetItems.some(tItem => tItem.id === item.id);

    if (isTarget) {
      const newFound = [...foundItemIds, item.id];
      setFoundItemIds(newFound);
      const nextScore = score + 1;
      setScore(nextScore);
      setWrongFeedbackId(null);
      
      if (newFound.length === currentRoundData.targetItems.length) {
        setStatusDescriptor({ key: 'statusAllFound', fallback: 'Great job! All items found!', params: {} });
        
        const nextRound = round + 1;
        const delayTimer = setTimeout(() => {
          if (nextRound > MAX_ROUNDS) {
            handleGameOver(nextScore);
          } else {
            setRound(nextRound);
            setCurrentRoundData(generateRoundData(difficulty));
            setFoundItemIds([]);
            setStatusDescriptor({ key: 'statusFindNew', fallback: 'Find the items on your new list.', params: {} });
          }
        }, 1500);
        timeoutsRef.current.push(delayTimer);
      } else {
        setStatusDescriptor({ key: 'statusGreat', fallback: 'Great job!', params: {} });
        const clearMsgTimer = setTimeout(() => {
          if (gameState === 'playing') {
            setStatusDescriptor({ key: 'statusKeepGoing', fallback: 'Keep going!', params: {} });
          }
        }, 1200);
        timeoutsRef.current.push(clearMsgTimer);
      }
    } else {
      setStatusDescriptor({ key: 'statusNotOnList', fallback: 'That item is not on the list.', params: {} });
      setWrongFeedbackId(item.id);
      
      const wrongFeedbackTimer = setTimeout(() => {
        setWrongFeedbackId(null);
        if (gameState === 'playing') {
          setStatusDescriptor({ key: 'statusFind', fallback: 'Find the items on your list.', params: {} });
        }
      }, 1500);
      timeoutsRef.current.push(wrongFeedbackTimer);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>{t('games.supermarket.title', 'Supermarket Run')}</Text>

        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.round', 'ROUND')}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {gameState === 'idle' ? '-' : `${round}/${MAX_ROUNDS}`}
            </Text>
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

        {/* Difficulty Selector */}
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
                    setCurrentRoundData(generateRoundData(diff));
                  }}
                  activeOpacity={0.8}
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
              {t(DIFFICULTY_CONFIG[difficulty]?.descKey, DIFFICULTY_CONFIG[difficulty]?.description)}
            </Text>
          </View>
        )}

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: isDarkMode ? '#1e293b' : '#E0F2FE', borderColor: isDarkMode ? '#334155' : '#BAE6FD' },
            (statusDescriptor.key === 'statusAllFound' || statusDescriptor.key === 'statusGreat') && (isDarkMode ? { backgroundColor: '#143823', borderColor: '#16a34a' } : styles.bannerCorrect),
            statusDescriptor.key === 'statusNotOnList' && (isDarkMode ? { backgroundColor: '#450a0a', borderColor: '#dc2626' } : styles.bannerIncorrect),
            gameState === 'gameover' && (isDarkMode ? { backgroundColor: '#1f2937', borderColor: theme.cardBorder } : styles.bannerGameOver),
          ]}
        >
          <Text style={[styles.statusText, { color: theme.text }]}>{statusMessage}</Text>
        </View>

        {/* Shopping List */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <View style={[styles.listContainer, isDarkMode && { backgroundColor: '#292524', borderColor: '#44403c' }]}>
            <Text style={[styles.listTitle, isDarkMode && { color: '#fef08a' }]}>{t('games.supermarket.shoppingList', 'Shopping List')}</Text>
            <View style={styles.listItemsWrapper}>
              {currentRoundData.targetItems.map(item => {
                const isFound = foundItemIds.includes(item.id);
                const itemLabel = t(`games.supermarket.items.${item.id}`, item.label);
                return (
                  <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                    <Text style={styles.listCheckbox}>
                      <Ionicons name={isFound ? "checkmark-circle" : "ellipse-outline"} size={20} color={isFound ? theme.primary : theme.subText} />
                    </Text>
                    <Text style={[
                      styles.listText,
                      { color: theme.text },
                      isFound && styles.listTextFound
                    ]}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={theme.primary} style={{ marginRight: 4 }} /> {itemLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Supermarket Shelf */}
        {gameState === 'playing' && (
          <View style={[styles.shelfContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.shelfTitle, { color: theme.text }]}>{t('games.supermarket.supermarketShelf', 'Supermarket Shelf')}</Text>
            <View style={styles.shelfGrid}>
              {currentRoundData.shelfItems.map(item => {
                const isFound = foundItemIds.includes(item.id);
                const isWrong = wrongFeedbackId === item.id;
                const itemLabel = t(`games.supermarket.items.${item.id}`, item.label);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.shelfItem,
                      { backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#CBD5E1' },
                      isFound && styles.shelfItemFound,
                      isWrong && styles.shelfItemWrong
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                    disabled={isFound}
                    accessibilityRole="button"
                    accessibilityLabel={itemLabel}
                  >
                    <MaterialCommunityIcons name={item.icon} size={36} color={isFound ? theme.subText : theme.primary} style={{ marginBottom: 4 }} />
                    <Text style={[styles.shelfLabel, { color: theme.text }]}>{itemLabel}</Text>
                    {isFound && (
                      <View style={styles.foundOverlay}>
                        <Text style={styles.foundCheck}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={[styles.gameOverCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={styles.gameOverTitle}>{t('games.supermarket.tripComplete', 'Shopping Trip Complete!')}</Text>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.supermarket.totalFound', 'Total Items Found:')}</Text>
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
          </View>
        )}

        {/* Primary Action Button */}
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    paddingBottom: 40, // extra padding for scrolling
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#2563EB',
  },
  difficultyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  difficultySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusBanner: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  bannerCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  bannerIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  bannerGameOver: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusText: {
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    backgroundColor: '#FEF3C7', // Pale yellow like a notepad
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FDE68A',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
    textAlign: 'center',
  },
  listItemsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  listCheckbox: {
    fontSize: 24,
    marginRight: 8,
  },
  listText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  listTextFound: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  shelfContainer: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  shelfTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shelfItem: {
    width: '45%',
    minHeight: 100, // Large touch target > 60px
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shelfItemFound: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    opacity: 0.7,
  },
  shelfItemWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 3,
  },
  shelfEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  shelfLabel: {
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#1E293B',
  },
  foundOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  foundCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0284C7',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 20,
    color: '#475569',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    minHeight: 64, // Minimum 60px
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: '#64748B',
  },
  primaryButtonText: {
    fontSize: 24, // Minimum 22px
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

