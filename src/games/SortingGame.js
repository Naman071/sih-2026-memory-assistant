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

const CATEGORY_ICONS = {
  Fruits: 'fruit-cherries',
  Vegetables: 'carrot',
  Animals: 'paw',
  Vehicles: 'car',
};

const SORTING_DATA = [
  {
    category: 'Fruits',
    items: [
      { id: 'apple', label: 'Apple', icon: 'food-apple' },
      { id: 'grapes', label: 'Grapes', icon: 'fruit-grapes' },
      { id: 'cherries', label: 'Cherries', icon: 'fruit-cherries' },
      { id: 'watermelon', label: 'Watermelon', icon: 'fruit-watermelon' },
      { id: 'pineapple', label: 'Pineapple', icon: 'fruit-pineapple' },
      { id: 'orange', label: 'Orange', icon: 'fruit-citrus' },
    ]
  },
  {
    category: 'Vegetables',
    items: [
      { id: 'carrot', label: 'Carrot', icon: 'carrot' },
      { id: 'corn', label: 'Corn', icon: 'corn' },
      { id: 'mushroom', label: 'Mushroom', icon: 'mushroom' },
      { id: 'pepper', label: 'Pepper', icon: 'chili-mild' },
      { id: 'sprout', label: 'Sprout', icon: 'sprout' },
      { id: 'salad', label: 'Salad', icon: 'leaf' },
    ]
  },
  {
    category: 'Animals',
    items: [
      { id: 'dog', label: 'Dog', icon: 'dog' },
      { id: 'cat', label: 'Cat', icon: 'cat' },
      { id: 'rabbit', label: 'Rabbit', icon: 'rabbit' },
      { id: 'bird', label: 'Bird', icon: 'bird' },
      { id: 'fish', label: 'Fish', icon: 'fish' },
      { id: 'horse', label: 'Horse', icon: 'horse' },
    ]
  },
  {
    category: 'Vehicles',
    items: [
      { id: 'car', label: 'Car', icon: 'car' },
      { id: 'bus', label: 'Bus', icon: 'bus' },
      { id: 'taxi', label: 'Taxi', icon: 'taxi' },
      { id: 'ambulance', label: 'Ambulance', icon: 'ambulance' },
      { id: 'tractor', label: 'Tractor', icon: 'tractor' },
      { id: 'bicycle', label: 'Bicycle', icon: 'bicycle' },
    ]
  }
];

const MAX_ROUNDS = 5;

const DIFFICULTY_CONFIG = {
  Easy: { categoryCount: 2, itemsPerCategory: 2, descKey: 'games.sorting.gentleDesc', description: 'Gentle: 2 Categories • 4 Items' },
  Medium: { categoryCount: 2, itemsPerCategory: 3, descKey: 'games.sorting.standardDesc', description: 'Standard: 2 Categories • 6 Items' },
  Hard: { categoryCount: 3, itemsPerCategory: 3, descKey: 'games.sorting.challengingDesc', description: 'Challenging: 3 Categories • 9 Items' },
};

function generateRoundData(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
  const itemsPerCategory = config.itemsPerCategory;
  const categoryCount = config.categoryCount;

  // Pick random categories
  const shuffledCategories = [...SORTING_DATA].sort(() => Math.random() - 0.5);
  const selectedCats = shuffledCategories.slice(0, categoryCount);

  const categories = selectedCats.map(c => c.category);
  
  let roundItems = [];
  
  selectedCats.forEach(catObj => {
    const shuffledItems = [...catObj.items].sort(() => Math.random() - 0.5);
    const picked = shuffledItems.slice(0, itemsPerCategory).map(item => ({
      ...item,
      category: catObj.category,
    }));
    roundItems = [...roundItems, ...picked];
  });

  // Shuffle the final item list
  roundItems.sort(() => Math.random() - 0.5);

  return { categories, items: roundItems };
}

export default function SortingGame({
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
  const [statusDescriptor, setStatusDescriptor] = useState({ key: 'statusStart', fallback: 'Press "Start Game" to begin!', params: {} });
  
  const [currentRoundData, setCurrentRoundData] = useState(() => generateRoundData(initialDifficulty));
  const [sortedItemIds, setSortedItemIds] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [categoryError, setCategoryError] = useState('');
  const [wrongCategory, setWrongCategory] = useState(null);

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
    return t(`games.sorting.${statusDescriptor.key}`, statusDescriptor.fallback, statusDescriptor.params);
  }, [statusDescriptor, t, currentLanguage]);

  const startGame = () => {
    clearAllTimeouts();
    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setScore(0);
    setRound(1);
    setSortedItemIds([]);
    setSelectedItemId(null);
    setCategoryError('');
    setWrongCategory(null);
    setCurrentRoundData(generateRoundData(difficulty));
    setGameState('playing');
    setStatusDescriptor({ key: 'statusInstruction', fallback: 'Select an item, then tap its category.', params: {} });
  };

  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusDescriptor({ key: 'statusComplete', fallback: 'Sorting complete! Great job!', params: {} });

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
    if (sortedItemIds.includes(item.id)) return; // Already sorted
    
    // Toggle selection
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handleCategoryPress = (categoryName) => {
    if (gameState !== 'playing') return;
    if (!selectedItemId) {
      setStatusDescriptor({ key: 'statusSelectFirst', fallback: 'Please select an item to sort first.', params: {} });
      return;
    }

    const item = currentRoundData.items.find(i => i.id === selectedItemId);
    if (!item) return;

    clearAllTimeouts();

    if (item.category === categoryName) {
      // Correct!
      setCategoryError('');
      setWrongCategory(null);
      const newSorted = [...sortedItemIds, item.id];
      setSortedItemIds(newSorted);
      const nextScore = score + 1;
      setScore(nextScore);
      setSelectedItemId(null);
      
      if (newSorted.length === currentRoundData.items.length) {
        setStatusDescriptor({ key: 'statusAllSorted', fallback: 'Great job! All sorted!', params: {} });
        
        const nextRound = round + 1;
        const delayTimer = setTimeout(() => {
          if (nextRound > MAX_ROUNDS) {
            handleGameOver(nextScore);
          } else {
            setRound(nextRound);
            setCurrentRoundData(generateRoundData(difficulty));
            setSortedItemIds([]);
            setCategoryError('');
            setWrongCategory(null);
            setStatusDescriptor({ key: 'statusInstruction', fallback: 'Select an item, then tap its category.', params: {} });
          }
        }, 1500);
        timeoutsRef.current.push(delayTimer);
      } else {
        setStatusDescriptor({ key: 'statusGreat', fallback: 'Great job!', params: {} });
        const clearMsgTimer = setTimeout(() => {
          if (gameState === 'playing') {
            setStatusDescriptor({ key: 'statusKeepGoing', fallback: 'Keep going!', params: {} });
          }
        }, 1500);
        timeoutsRef.current.push(clearMsgTimer);
      }
    } else {
      // Wrong category!
      const errorMessage = t('games.sorting.statusIncorrectCategory', 'That item belongs in a different category.');
      setWrongCategory(categoryName);
      setCategoryError(errorMessage);
      setStatusDescriptor({ key: 'statusIncorrectCategory', fallback: errorMessage, params: {} });
      
      const wrongFeedbackTimer = setTimeout(() => {
        if (gameState === 'playing') {
          setCategoryError('');
          setWrongCategory(null);
          setStatusDescriptor({ key: 'statusInstruction', fallback: 'Select an item, then tap its category.', params: {} });
        }
      }, 2500);
      timeoutsRef.current.push(wrongFeedbackTimer);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>{t('games.sorting.title', 'Category Sorting')}</Text>

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
            (statusDescriptor.key === 'statusAllSorted' || statusDescriptor.key === 'statusGreat') && (isDarkMode ? { backgroundColor: '#143823', borderColor: '#16a34a' } : styles.bannerCorrect),
            statusDescriptor.key === 'statusIncorrectCategory' && (isDarkMode ? { backgroundColor: '#450a0a', borderColor: '#dc2626' } : styles.bannerIncorrect),
            gameState === 'gameover' && (isDarkMode ? { backgroundColor: '#1f2937', borderColor: theme.cardBorder } : styles.bannerGameOver),
          ]}
        >
          <Text style={[styles.statusText, { color: theme.text }]}>{statusMessage}</Text>
        </View>

        {/* Play Area */}
        {gameState === 'playing' && (
          <View style={styles.playArea}>
            
            {/* Items Grid */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('games.sorting.step1', '1. Tap an object to select it:')}</Text>
            <View style={[styles.itemsGrid, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              {currentRoundData.items.map(item => {
                const isSorted = sortedItemIds.includes(item.id);
                const isSelected = selectedItemId === item.id;
                const itemLabel = t(`games.sorting.items.${item.id}`, item.label);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemCard,
                      { backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#CBD5E1' },
                      isSelected && styles.itemCardSelected,
                      isSelected && {
                        backgroundColor: isDarkMode ? theme.cardBorder : '#EFF6FF',
                        borderColor: isDarkMode ? '#60A5FA' : '#2563EB',
                      },
                      isSorted && styles.itemCardSorted
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                    disabled={isSorted}
                    accessibilityRole="button"
                    accessibilityLabel={itemLabel}
                  >
                    <MaterialCommunityIcons name={item.icon} size={36} color={isSorted ? theme.subText : theme.primary} style={{ marginBottom: 4 }} />
                    <Text
                      style={[
                        styles.itemLabel,
                        { color: theme.text },
                        isSelected && { color: theme.text },
                        isSorted && styles.opacityLow,
                      ]}
                    >
                      {itemLabel}
                    </Text>
                    {isSorted && (
                      <View style={styles.sortedOverlay}>
                        <Text style={styles.sortedCheck}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Categories */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('games.sorting.step2', '2. Tap the correct category:')}</Text>
            <View style={styles.categoriesRow}>
              {currentRoundData.categories.map(category => {
                const categoryLabel = t(`games.sorting.categories.${category}`, category);
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isDarkMode ? theme.cardBackground : '#E0E7FF',
                        borderColor: isDarkMode ? theme.cardBorder : '#A5B4FC',
                      },
                      // Slightly highlight categories if an item is selected to prompt action
                      selectedItemId && styles.categoryCardPrompt,
                      selectedItemId && {
                        backgroundColor: isDarkMode ? '#334155' : '#DBEAFE',
                        borderColor: isDarkMode ? '#60A5FA' : '#2563EB',
                      },
                      wrongCategory === category && {
                        backgroundColor: isDarkMode ? '#450A0A' : '#FEE2E2',
                        borderColor: isDarkMode ? '#F87171' : '#DC2626',
                      },
                    ]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={categoryLabel}
                  >
                    <MaterialCommunityIcons
                      name={CATEGORY_ICONS[category] || 'folder'}
                      size={24}
                      color={wrongCategory === category ? '#EF4444' : (selectedItemId ? theme.primary : theme.subText)}
                      style={{ marginBottom: 4 }}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: theme.text },
                        wrongCategory === category && { color: isDarkMode ? '#FCA5A5' : '#991B1B' },
                      ]}
                    >
                      {categoryLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {categoryError ? (
              <Text
                style={[
                  styles.categoryErrorText,
                  {
                    backgroundColor: isDarkMode ? '#450A0A' : '#FEE2E2',
                    borderColor: isDarkMode ? '#F87171' : '#FCA5A5',
                    color: isDarkMode ? '#FCA5A5' : '#991B1B',
                  },
                ]}
              >
                {categoryError}
              </Text>
            ) : null}

          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={[styles.gameOverCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={styles.gameOverTitle}>{t('games.sorting.sortingComplete', 'Sorting Complete!')}</Text>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.sorting.totalSorted', 'Total Items Sorted:')}</Text>
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
    paddingBottom: 40,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  playArea: {
    width: '100%',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
    marginTop: 8,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  itemCard: {
    width: '45%',
    minHeight: 110, // Minimum 60px height
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
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
  itemCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.02 }],
  },
  itemCardSorted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 2,
  },
  itemEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#1E293B',
  },
  opacityLow: {
    opacity: 0.4,
  },
  sortedOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sortedCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minHeight: 120, // Huge touch target
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A5B4FC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryCardPrompt: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  categoryErrorText: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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

