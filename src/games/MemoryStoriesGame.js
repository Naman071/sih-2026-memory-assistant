import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import {
  STORY_DATA,
  STORY_QUESTIONS,
  TOTAL_QUESTIONS,
  LEVEL_METADATA,
  getQuestionsByDifficulty,
} from '../modules/storyGameData';

const SCREENS = {
  STORY: 'story',
  QUESTION: 'question',
  LEVEL_UNLOCKED: 'level_unlocked',
  COMPLETE: 'complete',
};

export default function MemoryStoriesGame({ onExit }) {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();

  // Screen flow state
  const [screen, setScreen] = useState(SCREENS.STORY);

  // Difficulty & progress state
  const [currentTier, setCurrentTier] = useState('easy'); // 'easy' | 'medium' | 'hard'
  const [tierQuestionIndex, setTierQuestionIndex] = useState(0); // index inside current tier
  const [unlockedTiers, setUnlockedTiers] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  // Answering state
  const [selectedChoice, setSelectedChoice] = useState(null); // index (0, 1, 2)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null); // boolean | null
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState(new Set());

  // Modal to re-read story mid-game
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Questions for current tier
  const currentTierQuestions = useMemo(() => {
    return getQuestionsByDifficulty(currentTier);
  }, [currentTier]);

  const currentQuestion = currentTierQuestions[tierQuestionIndex] || currentTierQuestions[0];

  // Colors adapted for dementia-friendly contrast & theme
  const colors = useMemo(() => {
    return {
      background: theme.background,
      cardBg: theme.cardBackground,
      cardBorder: theme.cardBorder,
      text: theme.text,
      subText: theme.subText,
      primary: theme.primary,
      successGreen: '#059669',
      successBg: isDarkMode ? '#064E3B' : '#ECFDF5',
      successBorder: '#10B981',
      retryAmber: '#D97706',
      retryBg: isDarkMode ? '#451A03' : '#FFFBEB',
      retryBorder: '#F59E0B',
      neutralBorder: isDarkMode ? '#374151' : '#D1D5DB',
      badgeBg: isDarkMode ? '#1F2937' : '#F3F4F6',
    };
  }, [theme, isDarkMode]);

  // Handle choice selection
  const handleSelectChoice = useCallback(
    (choiceIndex) => {
      if (isAnswerCorrect === true) {
        // Already answered correctly, waiting for "Next"
        return;
      }

      setSelectedChoice(choiceIndex);
      const isCorrect = choiceIndex === currentQuestion.correctIndex;
      setIsAnswerCorrect(isCorrect);

      if (isCorrect) {
        setAnsweredQuestionIds((prev) => {
          const next = new Set(prev);
          next.add(currentQuestion.id);
          return next;
        });
      }
    },
    [currentQuestion, isAnswerCorrect]
  );

  // Proceed to next question or trigger level unlock / game complete
  const handleNext = useCallback(() => {
    const nextIdx = tierQuestionIndex + 1;

    // Reset answering state for next question
    setSelectedChoice(null);
    setIsAnswerCorrect(null);

    if (nextIdx < currentTierQuestions.length) {
      // More questions in current tier
      setTierQuestionIndex(nextIdx);
    } else {
      // Completed all questions in current tier!
      if (currentTier === 'easy') {
        setUnlockedTiers((prev) => ({ ...prev, medium: true }));
        setScreen(SCREENS.LEVEL_UNLOCKED);
      } else if (currentTier === 'medium') {
        setUnlockedTiers((prev) => ({ ...prev, hard: true }));
        setScreen(SCREENS.LEVEL_UNLOCKED);
      } else if (currentTier === 'hard') {
        setScreen(SCREENS.COMPLETE);
      }
    }
  }, [tierQuestionIndex, currentTierQuestions.length, currentTier]);

  // Handle continuing to the next tier from the level unlock milestone screen
  const handleContinueNextTier = useCallback(() => {
    if (currentTier === 'easy') {
      setCurrentTier('medium');
      setTierQuestionIndex(0);
      setSelectedChoice(null);
      setIsAnswerCorrect(null);
      setScreen(SCREENS.QUESTION);
    } else if (currentTier === 'medium') {
      setCurrentTier('hard');
      setTierQuestionIndex(0);
      setSelectedChoice(null);
      setIsAnswerCorrect(null);
      setScreen(SCREENS.QUESTION);
    }
  }, [currentTier]);

  // Restart the whole game cleanly
  const handleRestart = useCallback(() => {
    setCurrentTier('easy');
    setTierQuestionIndex(0);
    setUnlockedTiers({
      easy: true,
      medium: false,
      hard: false,
    });
    setSelectedChoice(null);
    setIsAnswerCorrect(null);
    setAnsweredQuestionIds(new Set());
    setScreen(SCREENS.STORY);
  }, []);

  // Score count
  const score = answeredQuestionIds.size;

  // Render Tier Progress Badge row
  const renderTierIndicator = () => {
    return (
      <View style={styles.tierIndicatorRow}>
        {['easy', 'medium', 'hard'].map((tierKey) => {
          const meta = LEVEL_METADATA[tierKey];
          const isCurrent = currentTier === tierKey;
          const isUnlocked = unlockedTiers[tierKey];

          let pillBg = colors.badgeBg;
          let pillBorder = colors.cardBorder;
          let pillTextColor = colors.subText;

          if (isCurrent) {
            pillBg = isDarkMode ? '#1E3A8A' : '#DBEAFE';
            pillBorder = colors.primary;
            pillTextColor = colors.primary;
          } else if (isUnlocked) {
            pillBg = isDarkMode ? '#064E3B' : '#D1FAE5';
            pillBorder = colors.successBorder;
            pillTextColor = colors.successGreen;
          }

          return (
            <View
              key={tierKey}
              style={[
                styles.tierPill,
                { backgroundColor: pillBg, borderColor: pillBorder },
              ]}
              accessibilityLabel={`${t(meta.titleKey)}, ${
                isUnlocked ? 'Unlocked' : 'Locked'
              }${isCurrent ? ', Current' : ''}`}
            >
              <Ionicons
                name={
                  isUnlocked
                    ? isCurrent
                      ? 'radio-button-on'
                      : 'checkmark-circle'
                    : 'lock-closed'
                }
                size={16}
                color={pillTextColor}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tierPillText,
                  { color: pillTextColor, fontWeight: isCurrent ? '700' : '600' },
                ]}
              >
                {t(meta.titleKey)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  /* -------------------------------------------------------------
     SCREEN 1: Story Screen
  ------------------------------------------------------------- */
  if (screen === SCREENS.STORY) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.headerBar,
            { backgroundColor: colors.cardBg, borderBottomColor: colors.cardBorder, justifyContent: 'space-between' },
          ]}
        >
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel={t('games.memoryStories.accessibility.backBtn')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={26} color={colors.primary} />
            <Text style={[styles.headerBackText, { color: colors.primary }]}>
              {t('games.memoryStories.backToGames')}
            </Text>
          </TouchableOpacity>
          <LanguageSelector compact={true} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introductory Title & Tagline Banner */}
          <View style={styles.introHeader}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' },
              ]}
            >
              <Ionicons name="book" size={36} color={colors.primary} />
            </View>
            <Text
              style={[styles.mainTitle, { color: colors.text }]}
              accessibilityRole="header"
            >
              {t('games.memoryStories.title')}
            </Text>
            <Text style={[styles.tagline, { color: colors.subText }]}>
              {t('games.memoryStories.tagline')}
            </Text>
          </View>

          {/* Story Card */}
          <View
            style={[
              styles.storyCard,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
            ]}
            accessibilityRole="text"
            accessibilityLabel={t('games.memoryStories.accessibility.storyCard')}
          >
            <View style={styles.storyCardHeader}>
              <Ionicons
                name="sunny-outline"
                size={26}
                color="#D97706"
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.storyTitle, { color: colors.text }]}>
                {t(STORY_DATA.titleKey)}
              </Text>
            </View>

            <Text style={[styles.storyParagraph, { color: colors.text }]}>
              {t(STORY_DATA.paragraph1Key)}
            </Text>

            <Text style={[styles.storyParagraph, { color: colors.text, marginTop: 14 }]}>
              {t(STORY_DATA.paragraph2Key)}
            </Text>
          </View>

          {/* Gentle Instruction Prompt */}
          <View
            style={[
              styles.promptBox,
              { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB' },
            ]}
          >
            <Ionicons
              name="bulb-outline"
              size={24}
              color={colors.primary}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.promptText, { color: colors.subText }]}>
              {t('games.memoryStories.readStoryPrompt')}
            </Text>
          </View>

          {/* Start Questions Button */}
          <TouchableOpacity
            style={[styles.largePrimaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => setScreen(SCREENS.QUESTION)}
            accessibilityRole="button"
            accessibilityLabel={t('games.memoryStories.startQuestions')}
          >
            <Text style={styles.largePrimaryBtnText}>
              {t('games.memoryStories.startQuestions')}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------
     SCREEN 2: Level Unlocked Interstitial
  ------------------------------------------------------------- */
  if (screen === SCREENS.LEVEL_UNLOCKED) {
    const isMediumUnlock = currentTier === 'easy';
    const titleKey = isMediumUnlock
      ? 'games.memoryStories.unlockedMediumTitle'
      : 'games.memoryStories.unlockedHardTitle';
    const subKey = isMediumUnlock
      ? 'games.memoryStories.unlockedMediumSub'
      : 'games.memoryStories.unlockedHardSub';
    const btnKey = isMediumUnlock
      ? 'games.memoryStories.continueMedium'
      : 'games.memoryStories.continueHard';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, styles.centerContainer]}>
          <View
            style={[
              styles.milestoneCard,
              { backgroundColor: colors.cardBg, borderColor: colors.successBorder },
            ]}
          >
            <View
              style={[
                styles.milestoneIconCircle,
                { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' },
              ]}
            >
              <Ionicons name="sparkles" size={48} color={colors.successGreen} />
            </View>

            <Text style={[styles.milestoneTitle, { color: colors.text }]}>
              {t(titleKey)}
            </Text>

            <Text style={[styles.milestoneSub, { color: colors.subText }]}>
              {t(subKey)}
            </Text>

            {/* Score so far */}
            <View style={[styles.scoreBadge, { backgroundColor: colors.badgeBg }]}>
              <Ionicons name="trophy-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.scoreBadgeText, { color: colors.text }]}>
                {t('games.memoryStories.scoreLabel', { score })}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.largePrimaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={handleContinueNextTier}
              accessibilityRole="button"
              accessibilityLabel={t(btnKey)}
            >
              <Text style={styles.largePrimaryBtnText}>{t(btnKey)}</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------
     SCREEN 3: Game Complete Screen
  ------------------------------------------------------------- */
  if (screen === SCREENS.COMPLETE) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, styles.centerContainer]}>
          <View
            style={[
              styles.milestoneCard,
              { backgroundColor: colors.cardBg, borderColor: colors.successBorder },
            ]}
          >
            <View
              style={[
                styles.milestoneIconCircle,
                { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' },
              ]}
            >
              <Ionicons name="ribbon" size={54} color={colors.successGreen} />
            </View>

            <Text style={[styles.milestoneTitle, { color: colors.text }]}>
              {t('games.memoryStories.completionTitle')}
            </Text>

            <Text style={[styles.milestoneSub, { color: colors.subText }]}>
              {t('games.memoryStories.completionSub')}
            </Text>

            {/* Final Score */}
            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5',
                  borderColor: colors.successBorder,
                  borderWidth: 2,
                  marginTop: 16,
                },
              ]}
            >
              <Ionicons name="star" size={26} color="#EAB308" style={{ marginRight: 8 }} />
              <Text
                style={[
                  styles.scoreBadgeText,
                  { color: colors.successGreen, fontSize: 22, fontWeight: '700' },
                ]}
              >
                {t('games.memoryStories.finalScore', { score, total: TOTAL_QUESTIONS })}
              </Text>
            </View>

            {/* Restart Button */}
            <TouchableOpacity
              style={[styles.largePrimaryBtn, { backgroundColor: colors.primary, marginTop: 28 }]}
              onPress={handleRestart}
              accessibilityRole="button"
              accessibilityLabel={t('games.memoryStories.accessibility.playAgainBtn')}
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.largePrimaryBtnText}>{t('games.memoryStories.playAgain')}</Text>
            </TouchableOpacity>

            {/* Back to Games Button */}
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                { borderColor: colors.cardBorder, backgroundColor: colors.cardBg, marginTop: 14 },
              ]}
              onPress={onExit}
              accessibilityRole="button"
              accessibilityLabel={t('games.memoryStories.accessibility.backBtn')}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                {t('games.memoryStories.backToGames')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------
     SCREEN 4: Active Question Screen
  ------------------------------------------------------------- */
  const choiceLetters = ['A', 'B', 'C'];
  const currentLevelMeta = LEVEL_METADATA[currentTier];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.cardBg, borderBottomColor: colors.cardBorder },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => setScreen(SCREENS.STORY)}
          accessibilityRole="button"
          accessibilityLabel={t('games.memoryStories.accessibility.backBtn')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
          <Text style={[styles.headerBackText, { color: colors.primary }]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>

        {/* Read Story Button to re-read anytime without losing state */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageSelector compact={true} />
          <TouchableOpacity
            style={[styles.readStoryHeaderBtn, { borderColor: colors.primary, marginLeft: 8 }]}
            onPress={() => setShowStoryModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t('games.memoryStories.accessibility.readStoryBtn')}
          >
            <Ionicons name="book-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.readStoryHeaderText, { color: colors.primary }]}>
              {t('games.memoryStories.readStoryBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier Indicators */}
        {renderTierIndicator()}

        {/* Level & Question Progress Header */}
        <View style={styles.progressRow}>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: isDarkMode ? '#1E3A8A' : currentLevelMeta.bgLight },
            ]}
          >
            <Text style={[styles.tierBadgeText, { color: currentLevelMeta.color }]}>
              {t(currentLevelMeta.badgeKey)}
            </Text>
          </View>

          <Text style={[styles.progressCounterText, { color: colors.subText }]}>
            {t('games.memoryStories.questionProgress', {
              current: tierQuestionIndex + 1,
              total: currentTierQuestions.length,
            })}
          </Text>

          <View style={[styles.scorePill, { backgroundColor: colors.badgeBg }]}>
            <Ionicons name="star" size={16} color="#EAB308" style={{ marginRight: 4 }} />
            <Text style={[styles.scorePillText, { color: colors.text }]}>
              {score}/{TOTAL_QUESTIONS}
            </Text>
          </View>
        </View>

        {/* Question Card */}
        <View
          style={[
            styles.questionCard,
            { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
          ]}
          accessibilityRole="header"
          accessibilityLabel={t('games.memoryStories.accessibility.questionCard', {
            number: currentQuestion.number,
            text: t(currentQuestion.questionKey),
          })}
        >
          <Text style={[styles.questionNumberText, { color: colors.primary }]}>
            {t('games.memoryStories.questionProgress', {
              current: currentQuestion.number,
              total: TOTAL_QUESTIONS,
            })}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {t(currentQuestion.questionKey)}
          </Text>
        </View>

        {/* Answer Choices (3 options) */}
        <View style={styles.choicesContainer}>
          {currentQuestion.choiceKeys.map((choiceKey, index) => {
            const isSelected = selectedChoice === index;
            const isThisCorrect = isSelected && isAnswerCorrect === true;
            const isThisIncorrect = isSelected && isAnswerCorrect === false;

            let choiceBg = colors.cardBg;
            let choiceBorder = colors.cardBorder;
            let badgeBg = colors.badgeBg;
            let badgeTextColor = colors.text;

            if (isThisCorrect) {
              choiceBg = colors.successBg;
              choiceBorder = colors.successBorder;
              badgeBg = colors.successGreen;
              badgeTextColor = '#FFFFFF';
            } else if (isThisIncorrect) {
              choiceBg = colors.retryBg;
              choiceBorder = colors.retryBorder;
              badgeBg = colors.retryAmber;
              badgeTextColor = '#FFFFFF';
            }

            const choiceText = t(choiceKey);

            return (
              <TouchableOpacity
                key={choiceKey}
                style={[
                  styles.choiceButton,
                  {
                    backgroundColor: choiceBg,
                    borderColor: choiceBorder,
                    borderWidth: isSelected ? 3 : 2,
                  },
                ]}
                onPress={() => handleSelectChoice(index)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('games.memoryStories.accessibility.choiceOption', {
                  letter: choiceLetters[index],
                  text: choiceText,
                })}
              >
                {/* Letter badge: A, B, C */}
                <View style={[styles.choiceBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.choiceBadgeText, { color: badgeTextColor }]}>
                    {choiceLetters[index]}
                  </Text>
                </View>

                {/* Choice Text */}
                <Text style={[styles.choiceText, { color: colors.text }]}>
                  {choiceText}
                </Text>

                {/* Status Indicator Icon */}
                {isThisCorrect && (
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color={colors.successGreen}
                    style={{ marginLeft: 8 }}
                  />
                )}
                {isThisIncorrect && (
                  <Ionicons
                    name="refresh-circle"
                    size={28}
                    color={colors.retryAmber}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Gentle, Supportive Feedback Banner */}
        {isAnswerCorrect === true && (
          <View
            style={[
              styles.feedbackCard,
              { backgroundColor: colors.successBg, borderColor: colors.successBorder },
            ]}
          >
            <View style={styles.feedbackHeaderRow}>
              <Ionicons
                name="checkmark-circle"
                size={30}
                color={colors.successGreen}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.feedbackTitle, { color: colors.successGreen }]}>
                {t('games.memoryStories.correctTitle')}
              </Text>
            </View>
            <Text style={[styles.feedbackSub, { color: colors.text }]}>
              {t('games.memoryStories.correctSub')}
            </Text>

            {/* Next Question Button */}
            <TouchableOpacity
              style={[
                styles.largePrimaryBtn,
                { backgroundColor: colors.successGreen, marginTop: 16 },
              ]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={t('games.memoryStories.accessibility.nextQuestionBtn')}
            >
              <Text style={styles.largePrimaryBtnText}>
                {t('games.memoryStories.nextQuestion')}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {isAnswerCorrect === false && (
          <View
            style={[
              styles.feedbackCard,
              { backgroundColor: colors.retryBg, borderColor: colors.retryBorder },
            ]}
          >
            <View style={styles.feedbackHeaderRow}>
              <Ionicons
                name="heart-circle"
                size={30}
                color={colors.retryAmber}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.feedbackTitle, { color: colors.retryAmber }]}>
                {t('games.memoryStories.incorrectTitle')}
              </Text>
            </View>
            <Text style={[styles.feedbackSub, { color: colors.text }]}>
              {t('games.memoryStories.incorrectSub')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Story Popover Modal (allows re-reading the story without losing progress) */}
      <Modal
        visible={showStoryModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowStoryModal(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.headerBar,
              { backgroundColor: colors.cardBg, borderBottomColor: colors.cardBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={() => setShowStoryModal(false)}
              accessibilityRole="button"
              accessibilityLabel={t('games.memoryStories.accessibility.closeStoryBtn')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={28} color={colors.primary} />
              <Text style={[styles.headerBackText, { color: colors.primary }]}>
                {t('games.memoryStories.closeStory')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View
              style={[
                styles.storyCard,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.storyCardHeader}>
                <Ionicons
                  name="book"
                  size={26}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.storyTitle, { color: colors.text }]}>
                  {t(STORY_DATA.titleKey)}
                </Text>
              </View>

              <Text style={[styles.storyParagraph, { color: colors.text }]}>
                {t(STORY_DATA.paragraph1Key)}
              </Text>

              <Text style={[styles.storyParagraph, { color: colors.text, marginTop: 14 }]}>
                {t(STORY_DATA.paragraph2Key)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.largePrimaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={() => setShowStoryModal(false)}
              accessibilityRole="button"
              accessibilityLabel={t('games.memoryStories.accessibility.closeStoryBtn')}
            >
              <Text style={styles.largePrimaryBtnText}>
                {t('games.memoryStories.closeStory')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  readStoryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  readStoryHeaderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  storyCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  storyParagraph: {
    fontSize: 19,
    lineHeight: 30,
    fontWeight: '400',
  },
  promptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  largePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderRadius: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  largePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 20,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  tierIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tierPillText: {
    fontSize: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressCounterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scorePillText: {
    fontSize: 15,
    fontWeight: '700',
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  choicesContainer: {
    marginBottom: 16,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  choiceBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  choiceBadgeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  choiceText: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600',
    flex: 1,
  },
  feedbackCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  feedbackSub: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
  },
  milestoneCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  milestoneSub: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  scoreBadgeText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

