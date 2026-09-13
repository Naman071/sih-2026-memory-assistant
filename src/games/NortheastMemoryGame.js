import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import {
  getNextMemoryScene,
  getSceneQuestions,
  recordSceneView,
  recordPerformance,
} from '../modules/database';
import { supabase } from '../modules/supabaseClient';

/* -------------------------------------------------------------
   Security, Sanitization & Dev Logging Helpers
------------------------------------------------------------- */

// Strips HTML tags, removes script-like content, limits length to 200
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
    .trim()
    .slice(0, 200);
};

// Regex validation: alphanumeric + underscores + hyphens
const isValidId = (str) => {
  if (typeof str !== 'string' || !str) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(str.trim());
};

// Dev-only logger to satisfy Task 7 (never logs in production)
const logDev = (message, ...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(`[NorthEastMemory] ${message}`, ...args);
  }
};

const errorDev = (message, ...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error(`[NorthEastMemory] ${message}`, ...args);
  }
};

// Defensive validation for question object & options
const isValidQuestion = (q) => {
  if (!q || typeof q !== 'object') return false;
  if (!q.question_id || !q.scene_id) return false;
  if (typeof q.question !== 'string' || !q.question.trim()) return false;
  if (q.answer === undefined || q.answer === null || String(q.answer).trim() === '') return false;

  let opts = q.options;
  if (typeof opts === 'string') {
    try {
      opts = JSON.parse(opts);
    } catch {
      opts = q.options.split(',').map((s) => s.trim());
    }
  }
  if (!Array.isArray(opts) || opts.length < 2) return false;
  return opts.some((opt) => String(opt).trim().length > 0);
};

// Ensures the options array always has exactly 4 distinct options including the correct answer
const normalizeToFourOptions = (rawOptions, rawAnswer) => {
  const answer = String(rawAnswer).trim();
  let list = [];

  if (Array.isArray(rawOptions)) {
    list = rawOptions.map((o) => String(o).trim()).filter(Boolean);
  } else if (typeof rawOptions === 'string') {
    try {
      const parsed = JSON.parse(rawOptions);
      if (Array.isArray(parsed)) {
        list = parsed.map((o) => String(o).trim()).filter(Boolean);
      }
    } catch {
      list = rawOptions.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  // Ensure answer is present
  if (!list.includes(answer)) {
    list.unshift(answer);
  }

  // Deduplicate
  list = Array.from(new Set(list));

  // Plausible fallback options if fewer than 4 are provided
  const fallbacks = [
    'Assam',
    'Meghalaya',
    'Lush Green',
    'Morning Light',
    'Village Path',
    'Hills',
    'Blue',
    'Yellow',
  ];

  for (const item of fallbacks) {
    if (list.length >= 4) break;
    if (!list.includes(item)) {
      list.push(item);
    }
  }

  return list.slice(0, 4);
};

// Secure Image URL builder: ensures path stays strictly within memory-photos bucket
const getSafeImageUrl = (imagePath) => {
  if (typeof imagePath !== 'string' || !imagePath) return null;
  const imageUrl = supabase.storage.from('memory-photos').getPublicUrl(imagePath).data.publicUrl;
  if (__DEV__) console.log('IMG_URL:', imageUrl);
  return imageUrl;
};

const DIFFICULTY_CONFIG = {
  Easy: { duration: 8, label: 'Easy (8s observation)' },
  Medium: { duration: 6, label: 'Medium (6s observation)' },
  Hard: { duration: 4, label: 'Hard (4s observation)' },
};

/* -------------------------------------------------------------
   Main Component
------------------------------------------------------------- */
export default function NortheastMemoryGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
  onExit,
}) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getDifficultyLabel = (lvl) => {
    if (lvl === 'Easy') return t('games.northeastGame.easyLabel') || 'Easy (30s)';
    if (lvl === 'Medium') return t('games.northeastGame.mediumLabel') || 'Medium (20s)';
    return t('games.northeastGame.hardLabel') || 'Hard (10s)';
  };
  const { patientId } = usePatient();

  // Validate patientId - fallback to P001 for seamless play
  const activePatientId = patientId && isValidId(patientId) ? patientId : 'P001';

  const handleExit = useCallback(() => {
    onExit?.();
    onFinish?.();
  }, [onExit, onFinish]);

  // Game States: 'idle' | 'loading' | 'showing' | 'question' | 'round-complete' | 'gameover' | 'no-scenes' | 'no-patient' | 'error'
  const [gameState, setGameState] = useState('idle');
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  // Active scene and validated questions
  const [scene, setScene] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timing & metrics
  const [observationTimeLeft, setObservationTimeLeft] = useState(8);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [scenesCompleted, setScenesCompleted] = useState(0);

  // Feedback & Rate Limiting
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [isAnswerDisabled, setIsAnswerDisabled] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for cleanup and double submission guard
  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const rateLimitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Current Question
  const currentQuestion = questions[currentQuestionIndex];

  // Options shuffled inside useMemo with dependency on currentQuestion?.question_id
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const baseOptions = normalizeToFourOptions(
      currentQuestion.options,
      currentQuestion.answer
    ).map(sanitizeText);
    return [...baseOptions].sort(() => Math.random() - 0.5);
  }, [currentQuestion?.question_id]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current);
    };
  }, []);

  // Total duration timer during active gameplay
  useEffect(() => {
    if (gameState === 'showing' || gameState === 'question') {
      const interval = setInterval(() => {
        setTotalDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  /* -----------------------------------------------------------
     Load Next Scene (Tasks 1, 3, 4: Retries, Guards, Error States)
  ----------------------------------------------------------- */
  const loadNextScene = useCallback(async () => {
    logDev(`LOADING, fetching scene for patientId=${activePatientId}`);
    setGameState('loading');
    setImageLoadError(false);
    setIsImageLoading(true);
    setSelectedAnswer(null);
    setRoundScore(0);
    setCurrentQuestionIndex(0);
    setErrorMessage('');
    isSubmittingRef.current = false;

    let attempts = 0;
    let foundScene = null;
    let foundQuestions = [];

    try {
      while (attempts < 5) {
        attempts++;
        logDev(`[Attempt ${attempts}] Fetching scene from database...`);
        const nextScene = await getNextMemoryScene(activePatientId);
        logDev('SCENE RESULT:', JSON.stringify(nextScene));

        if (!nextScene || !nextScene.scene_id) {
          logDev('No unseen scene returned for patient.');
          break;
        }

        const rawQuestions = await getSceneQuestions(nextScene.scene_id);
        logDev(
          `QUESTIONS RESULT: count=${rawQuestions?.length || 0}, data=`,
          JSON.stringify(rawQuestions)
        );

        const filtered = Array.isArray(rawQuestions)
          ? rawQuestions.filter(isValidQuestion)
          : [];
        logDev(`FILTERED QUESTIONS: count=${filtered?.length || 0}`);

        if (filtered.length > 0) {
          foundScene = nextScene;
          foundQuestions = filtered.slice(0, 5);
          break;
        }
      }

      // If no unseen scene with questions was found, fetch ANY active scene with questions as fallback
      if (!foundScene) {
        logDev('Checking all active scenes as fallback...');
        const { data: allScenes, error: dbErr } = await supabase
          .from('memory_scenes')
          .select('*')
          .eq('active', true);

        if (dbErr) {
          errorDev('ERROR in memory_scenes query:', dbErr);
          setErrorMessage('Could not connect to the database. Please check your network.');
          setGameState('error');
          return;
        }

        if (allScenes && allScenes.length > 0) {
          for (const s of allScenes) {
            const rawQ = await getSceneQuestions(s.scene_id);
            const validQ = (rawQ || []).filter(isValidQuestion);
            if (validQ.length > 0) {
              foundScene = s;
              foundQuestions = validQ.slice(0, 5);
              break;
            }
          }
        }
      }

      if (!foundScene || foundQuestions.length === 0) {
        setErrorMessage('No photos or memory questions are ready yet. Please check back shortly.');
        setGameState('error');
        return;
      }

      setScene(foundScene);
      setQuestions(foundQuestions);

      const durationSeconds = DIFFICULTY_CONFIG[difficulty]?.duration || 8;
      setObservationTimeLeft(durationSeconds);
      logDev(`SHOWING scene=${foundScene.scene_id}, duration=${durationSeconds}s`);
      setGameState('showing');
    } catch (err) {
      errorDev('ERROR in loadNextScene:', err);
      setErrorMessage('Something went wrong while loading the photo. Please try again.');
      setGameState('error');
    }
  }, [activePatientId, difficulty]);

  /* -----------------------------------------------------------
     Observation Countdown Timer (STATE 3: showing)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (gameState === 'showing') {
      const durationSeconds = DIFFICULTY_CONFIG[difficulty]?.duration || 8;
      setObservationTimeLeft(durationSeconds);

      timerRef.current = setInterval(() => {
        setObservationTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Record scene view securely
            if (scene?.scene_id && isValidId(scene.scene_id)) {
              recordSceneView(activePatientId, scene.scene_id).catch((err) =>
                errorDev('ERROR in recordSceneView:', err)
              );
            }
            logDev(`QUESTION 0: ${questions[0]?.question}`);
            setGameState('question');
            setQuestionStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, difficulty, scene, activePatientId, questions]);

  /* -----------------------------------------------------------
     Handle Answer Selection (STATE 4: question)
  ----------------------------------------------------------- */
  const handleAnswerSelect = async (rawOption) => {
    if (isSubmittingRef.current || isAnswerDisabled || gameState !== 'question') {
      return;
    }

    isSubmittingRef.current = true;
    setIsAnswerDisabled(true);

    // Rate limit taps for 300ms
    rateLimitTimeoutRef.current = setTimeout(() => {
      setIsAnswerDisabled(false);
    }, 300);

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    const sanitizedSelected = sanitizeText(String(rawOption));
    const sanitizedCorrect = sanitizeText(String(currentQ.answer));
    const isCorrect =
      sanitizedSelected.toLowerCase() === sanitizedCorrect.toLowerCase();

    // Response time calculation
    const responseTimeMs = Math.max(0, Date.now() - questionStartTime);
    const responseTimeSec = Math.max(1, Math.round(responseTimeMs / 1000));

    logDev(
      `Answer: "${sanitizedSelected}" | Correct: "${sanitizedCorrect}" | Time: ${responseTimeSec}s | isCorrect: ${isCorrect}`
    );

    setSelectedAnswer(sanitizedSelected);
    setIsLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setRoundScore((prev) => prev + 1);
      setTotalScore((prev) => prev + 1);
    }

    // Record performance securely
    try {
      await recordPerformance({
        patient_id: activePatientId,
        scene_id: scene?.scene_id || 'unknown',
        question_id: currentQ.question_id,
        selected_answer: sanitizedSelected,
        correct_answer: sanitizedCorrect,
        is_correct: isCorrect,
        response_time: responseTimeSec,
        difficulty: difficulty,
        game_name: 'North East Memory',
      });
    } catch (recordErr) {
      errorDev('ERROR in recordPerformance:', recordErr);
    }

    // Show feedback for 1.5s, then advance
    feedbackTimeoutRef.current = setTimeout(() => {
      isSubmittingRef.current = false;
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < questions.length) {
        logDev(`QUESTION ${nextIndex}: ${questions[nextIndex]?.question}`);
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      } else {
        setScenesCompleted((prev) => prev + 1);
        logDev('Round complete! Moving to round-complete state.');
        setGameState('round-complete');
      }
    }, 1500);
  };

  // Replay all photos by clearing seen history for this patient
  const handleResetHistoryAndPlay = async () => {
    try {
      setGameState('loading');
      logDev('Resetting seen scene history for patient:', activePatientId);
      await supabase
        .from('player_scene_history')
        .delete()
        .eq('patient_id', activePatientId);
      loadNextScene();
    } catch (err) {
      errorDev('ERROR in resetting scene history:', err);
      loadNextScene();
    }
  };

  const handleStartGamePress = () => {
    logDev(`START pressed, difficulty=${difficulty}, patientId=${activePatientId}`);
    loadNextScene();
  };

  const handleFinishGame = () => {
    const summary = {
      score: totalScore,
      duration: totalDuration,
      difficulty,
      scenesCompleted,
    };
    onComplete?.(summary);
    onGameOver?.(summary);
    onFinish?.(summary);
    onExit?.(summary);
  };

  /* -----------------------------------------------------------
     STATE: Patient Guard (Task 4: Patient ID guard)
  ----------------------------------------------------------- */
  if (gameState === 'no-patient') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.centerContainer, { padding: 24 }]}>
          <Ionicons name="person-circle-outline" size={72} color={theme.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
            Patient Profile Required
          </Text>
          <Text style={[styles.bodyText, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
            Please select a patient first to track memory exercises and progress.
          </Text>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.primary, marginTop: 32 }]}
            onPress={() => {
              logDev('Proceeding with testing profile P001');
              setGameState('idle');
              loadNextScene();
            }}
          >
            <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
              Continue as Guest (P001)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
            onPress={handleExit}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              Back to Games
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 1: Idle Screen
  ----------------------------------------------------------- */
  if (gameState === 'idle') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header with Exit Button (Task 4: Back Button) */}
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={[styles.backIconBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
              onPress={handleExit}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
              <Text style={[styles.backIconText, { color: theme.text }]}>{t('common.back') || 'Back'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 12 }]}>
            <Text style={[styles.largeTitle, { color: theme.text }]}>
              {t('games.northeastGame.title') || '🏞️ North East Memory'}
            </Text>
            <Text style={[styles.bodyText, { color: theme.subText, marginTop: 12 }]}>
              {t('games.northeastGame.desc') || 'Look at the photo carefully. Then answer questions about what you saw.'}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('games.northeastGame.selectDifficulty') || 'Select Difficulty'}
            </Text>

            {['Easy', 'Medium', 'Hard'].map((lvl) => {
              const isSelected = difficulty === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.buttonBase,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                      marginTop: 12,
                    },
                  ]}
                  onPress={() => setDifficulty(lvl)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: isSelected ? theme.cardBackground : theme.text },
                    ]}
                  >
                    {getDifficultyLabel(lvl)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.primary, marginTop: 24 }]}
            onPress={handleStartGamePress}
          >
            <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
              {t('common.startGame') || 'Start Game'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 2: Loading Screen (Task 4: Loading Indicator)
  ----------------------------------------------------------- */
  if (gameState === 'loading') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
            {t('games.northeastGame.loadingScene') || 'Loading photo...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE: Error Screen (Tasks 3 & 4: Visible Error Message)
  ----------------------------------------------------------- */
  if (gameState === 'error') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.centerContainer, { padding: 24 }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
          <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
            {t('common.error') || 'Something went wrong'}
          </Text>
          <Text style={[styles.bodyText, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
            {errorMessage || t('games.northeastGame.loadFailed') || 'Something went wrong. Please try again.'}
          </Text>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.primary, marginTop: 32 }]}
            onPress={loadNextScene}
          >
            <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
              {t('common.tryAgain') || 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
            onPress={() => setGameState('idle')}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {t('common.back') || 'Back to Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE: No Scenes Available (Task 4: No scenes guard)
  ----------------------------------------------------------- */
  if (gameState === 'no-scenes') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.centerContainer, { padding: 24 }]}>
          <Ionicons name="trophy-outline" size={72} color="#059669" style={{ marginBottom: 16 }} />
          <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
            {t('games.northeastGame.completeTitle') || "You've seen all photos! Great job!"}
          </Text>
          <Text style={[styles.bodyText, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
            {t('games.northeastGame.noQuestions') || 'You have explored every photograph available in this memory exercise.'}
          </Text>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: '#059669', marginTop: 32 }]}
            onPress={handleResetHistoryAndPlay}
          >
            <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
              {t('common.playAgain') || 'Replay All Photos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
            onPress={handleExit}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {t('games.backToMenu') || 'Back to Games'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 3: Showing Screen (Calming 0.5 Opacity & Countdown)
  ----------------------------------------------------------- */
  if (gameState === 'showing') {
    const imageUrl = scene?.image_path
      ? supabase.storage.from('memory-photos').getPublicUrl(scene.image_path).data.publicUrl
      : null;
    if (__DEV__) console.log('IMG_URL:', imageUrl);

    const screenWidth = Dimensions.get('window').width;
    const cardWidth = Math.min(screenWidth - 40, 500);
    const cardHeight = Math.round(cardWidth * 0.75);

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={[styles.backIconBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
              onPress={handleExit}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
              <Text style={[styles.backIconText, { color: theme.text }]}>{t('common.exit') || 'Exit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, alignItems: 'center', marginTop: 12 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, textAlign: 'center' }]}>
              {t('games.northeastGame.lookCarefully') || 'Take your time. Look carefully.'}
            </Text>
            <Text style={[styles.timerText, { color: theme.primary, marginTop: 8 }]}>
              {observationTimeLeft}{t('common.seconds') || 's'}
            </Text>
          </View>

          <View style={[styles.imageContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16, height: cardHeight }]}>
            {imageUrl && !imageLoadError ? (
              <View style={{ width: cardWidth, height: cardHeight, justifyContent: 'center', alignItems: 'center' }}>
                {isImageLoading && (
                  <ActivityIndicator size="large" color={theme.primary} style={{ position: 'absolute', zIndex: 1 }} />
                )}
                <Image
                  source={{ uri: imageUrl }}
                  style={[styles.photo, { opacity: 0.5, width: cardWidth, height: cardHeight }]}
                  resizeMode="cover"
                  onLoad={() => {
                    if (__DEV__) console.log('IMG_OK:', imageUrl);
                    setIsImageLoading(false);
                  }}
                  onError={(e) => {
                    if (__DEV__) console.log('IMG_FAIL:', e.nativeEvent);
                    setImageLoadError(true);
                    setIsImageLoading(false);
                  }}
                />
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Ionicons name="image-outline" size={64} color={theme.subText} />
                <Text style={[styles.bodyText, { color: theme.subText, marginTop: 12 }]}>
                  {imageLoadError ? 'Image unavailable' : 'Scenic memory photo'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 4: Question Screen (Sanitized Text, 4 Options)
  ----------------------------------------------------------- */
  if (gameState === 'question') {
    const sanitizedQuestion = sanitizeText(currentQuestion?.question);

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={[styles.backIconBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
              onPress={handleExit}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
              <Text style={[styles.backIconText, { color: theme.text }]}>{t('common.exit') || 'Exit'}</Text>
            </TouchableOpacity>
          </View>

          {/* Question Card */}
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 12 }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {t('games.northeastGame.questionHeader', { current: currentQuestionIndex + 1, total: questions.length }) || `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </Text>
              <Text style={[styles.badgeText, { color: theme.subText }]}>
                {t('common.score')}: {roundScore}
              </Text>
            </View>

            <Text style={[styles.questionText, { color: theme.text, marginTop: 16 }]}>
              {sanitizedQuestion}
            </Text>
          </View>

          {/* 4 Answer Options */}
          <View style={{ marginTop: 16 }}>
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect =
                opt.toLowerCase() === sanitizeText(String(currentQuestion?.answer)).toLowerCase();

              let buttonBg = theme.cardBackground;
              let buttonBorder = theme.cardBorder;
              let textColor = theme.text;

              if (selectedAnswer !== null) {
                if (isSelected && isLastAnswerCorrect) {
                  buttonBg = '#10B981'; // standard emerald success
                  buttonBorder = '#10B981';
                  textColor = '#FFFFFF';
                } else if (isSelected && !isLastAnswerCorrect) {
                  buttonBg = '#EF4444'; // standard red error
                  buttonBorder = '#EF4444';
                  textColor = '#FFFFFF';
                } else if (isCorrect) {
                  buttonBg = theme.cardBackground;
                  buttonBorder = '#10B981';
                  textColor = '#10B981';
                }
              }

              return (
                <TouchableOpacity
                  key={`${opt}-${idx}`}
                  disabled={isAnswerDisabled || selectedAnswer !== null}
                  style={[
                    styles.buttonBase,
                    {
                      backgroundColor: buttonBg,
                      borderColor: buttonBorder,
                      marginBottom: 14,
                    },
                  ]}
                  onPress={() => handleAnswerSelect(opt)}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback Message */}
          {selectedAnswer !== null && (
            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 8 }]}>
              <Text
                style={[
                  styles.feedbackText,
                  {
                    color: isLastAnswerCorrect ? '#10B981' : '#EF4444',
                    textAlign: 'center',
                  },
                ]}
              >
                {isLastAnswerCorrect
                  ? (t('games.northeastGame.correctMsg') || '✨ Correct! Well done!')
                  : (t('games.northeastGame.correctAnswerWas', { answer: sanitizeText(String(currentQuestion?.answer)) }) || `Correct answer: ${sanitizeText(String(currentQuestion?.answer))}`)}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 5: Round Complete Screen
  ----------------------------------------------------------- */
  if (gameState === 'round-complete') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.centerContainer, { padding: 24 }]}>
          <Ionicons name="sparkles" size={64} color="#10B981" style={{ marginBottom: 16 }} />
          <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
            {t('common.correct') || 'Great job!'}
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
            {t('games.northeastGame.score', { score: roundScore, total: questions.length }) || `You found ${roundScore} out of ${questions.length} correct.`}
          </Text>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.primary, marginTop: 32 }]}
            onPress={loadNextScene}
          >
            <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
              {t('games.northeastGame.nextQuestion') || 'Next Photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
            onPress={() => setGameState('gameover')}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {t('common.done') || 'Finish Game'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* -----------------------------------------------------------
     STATE 6: Game Over / Summary Screen (Task 4 #6)
  ----------------------------------------------------------- */
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.centerContainer, { padding: 24 }]}>
        <Ionicons name="trophy-outline" size={72} color={theme.primary} style={{ marginBottom: 16 }} />
        <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
          {t('games.northeastGame.completeTitle') || 'Game Complete!'}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, width: '100%', marginTop: 24 }]}>
          <Text style={[styles.largeTitle, { color: theme.text, textAlign: 'center' }]}>
            {t('common.score')}: {totalScore}
          </Text>
          <Text style={[styles.bodyText, { color: theme.subText, marginTop: 10, textAlign: 'center' }]}>
            {t('common.level')}: {getDifficultyLabel(difficulty)} · {t('common.time')}: {totalDuration}{t('common.seconds') || 's'}
          </Text>
          <Text style={[styles.bodyText, { color: theme.subText, marginTop: 4, textAlign: 'center' }]}>
            {t('games.northeastGame.accuracy', { acc: Math.round((totalScore / Math.max(1, scenesCompleted * 4)) * 100) }) || `Scenes Completed: ${scenesCompleted}`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.buttonBase, { backgroundColor: theme.primary, marginTop: 32 }]}
          onPress={loadNextScene}
        >
          <Text style={[styles.buttonText, { color: theme.cardBackground, fontWeight: 'bold' }]}>
            {t('common.playAgain') || 'Play Again'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonBase, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
          onPress={handleFinishGame}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {t('games.backToMenu') || 'Back to Games'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------
   Styles (All text >= 20px, All buttons >= 60px, rounded 12-16)
------------------------------------------------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  backIconText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 6,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  bodyText: {
    fontSize: 20,
    lineHeight: 28,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  buttonBase: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
