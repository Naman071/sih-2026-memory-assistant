/**
 * SUH TAH LAM - SequencePlayer (Mode 1: OBSERVE)
 *
 * Orchestrates the full 3D deterministic animation:
 * - Bamboo poles opening and closing
 * - Left & Right holders moving synchronously
 * - Dancer stepping dynamically between 3D ground positions (1 to 9)
 * - Dementia-friendly controls: Pause, Resume, Watch Again, Continue
 * - Fully reactive: subscribes to useLanguage() directly.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import PerspectiveStage from './PerspectiveStage';
import Environment3D from './Environment3D';
import BambooGroup3D from './BambooGroup3D';
import Character3D from './Character3D';

// 3D Ground Coordinate Mapping for 3x3 Dance Arena
export const GRID_COORDINATES = {
  1: { x: -65, y: -42 },
  2: { x: 0, y: -42 },
  3: { x: 65, y: -42 },
  4: { x: -65, y: 0 },
  5: { x: 0, y: 0 }, // Center between poles
  6: { x: 65, y: 0 },
  7: { x: -65, y: 42 },
  8: { x: 0, y: 42 },
  9: { x: 65, y: 42 },
};

const BAMBOO_OPEN_X = 36;
const BAMBOO_CLOSE_X = 7;

export default function SequencePlayer({
  sequence,
  isDarkMode = false,
  soundEnabled = true,
  onComplete,
}) {
  const { t, currentLanguage } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasFinishedOnce, setHasFinishedOnce] = useState(false);
  const [currentDancerAction, setCurrentDancerAction] = useState('idle');

  // Animation values for 3D elements
  const leftPoleX = useRef(new Animated.Value(-BAMBOO_OPEN_X)).current;
  const rightPoleX = useRef(new Animated.Value(BAMBOO_OPEN_X)).current;
  const dancerX = useRef(new Animated.Value(0)).current;
  const dancerY = useRef(new Animated.Value(0)).current;

  const timerRef = useRef(null);
  const events = sequence.events || [];

  const startPlayback = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
    playStep(0);
  };

  const playStep = (stepIdx) => {
    if (stepIdx >= events.length) {
      setIsPlaying(false);
      setHasFinishedOnce(true);
      setCurrentDancerAction('idle');
      return;
    }

    setCurrentStepIndex(stepIdx);
    const event = events[stepIdx];
    const isBambooOpen = event.bambooAction === 'open';
    const targetLeftX = isBambooOpen ? -BAMBOO_OPEN_X : -BAMBOO_CLOSE_X;
    const targetRightX = isBambooOpen ? BAMBOO_OPEN_X : BAMBOO_CLOSE_X;

    const targetPos = GRID_COORDINATES[event.dancerPosition] || GRID_COORDINATES[5];
    setCurrentDancerAction(event.dancerAction || 'step_center');

    const stepDuration = sequence.tier === 'hard' ? 1200 : sequence.tier === 'medium' ? 1500 : 1900;

    // Execute physical 3D animations
    Animated.parallel([
      Animated.timing(leftPoleX, {
        toValue: targetLeftX,
        duration: stepDuration * 0.45,
        useNativeDriver: true,
      }),
      Animated.timing(rightPoleX, {
        toValue: targetRightX,
        duration: stepDuration * 0.45,
        useNativeDriver: true,
      }),
      Animated.timing(dancerX, {
        toValue: targetPos.x,
        duration: stepDuration * 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(dancerY, {
        toValue: targetPos.y,
        duration: stepDuration * 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    // Schedule next step
    timerRef.current = setTimeout(() => {
      playStep(stepIdx + 1);
    }, stepDuration);
  };

  useEffect(() => {
    startPlayback();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sequence.id]);

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      playStep(currentStepIndex);
    } else {
      setIsPaused(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startPlayback();
  };

  return (
    <View style={styles.container}>
      {/* 3D Visual Stage */}
      <PerspectiveStage cameraMode={isPlaying ? 'normal' : 'wide'}>
        <Environment3D isDarkMode={isDarkMode} />

        {/* Dual Bamboo Poles */}
        <BambooGroup3D leftPoleAnimX={leftPoleX} rightPoleAnimX={rightPoleX} />

        {/* Left Seated Bamboo Holder */}
        <Character3D
          role="holder_left"
          positionX={-112}
          positionY={0}
          actionState={isPlaying ? 'push_pull' : 'holding_bamboo'}
        />

        {/* Right Seated Bamboo Holder */}
        <Character3D
          role="holder_right"
          positionX={112}
          positionY={0}
          actionState={isPlaying ? 'push_pull' : 'holding_bamboo'}
        />

        {/* Central Articulated Dancer */}
        <Character3D
          role="dancer"
          positionX={dancerX}
          positionY={dancerY}
          actionState={currentDancerAction}
        />
      </PerspectiveStage>

      {/* Observation Guidance Banner */}
      <View style={[styles.guidanceCard, isDarkMode && styles.guidanceCardDark]}>
        <Ionicons name="eye-outline" size={24} color="#D97706" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.guidanceTitle, isDarkMode && styles.textDark]}>
            {isPlaying
              ? t('games.suhTahLam.observeTitle', 'Watch the movement carefully')
              : t('games.suhTahLam.readyTitle', 'Ready to remember?')}
          </Text>
          <Text style={[styles.guidanceSubtitle, isDarkMode && styles.subTextDark]}>
            {isPlaying
              ? t('games.suhTahLam.observeSub', 'Follow the dancer and the rhythm of the bamboo.')
              : t('games.suhTahLam.readySub', 'You can watch again or proceed to recall.')}
          </Text>
        </View>
      </View>

      {/* Controls: Pause / Replay / Continue */}
      <View style={styles.controlRow}>
        {isPlaying ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.pauseBtn]}
            onPress={handleTogglePause}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? t('common.resume', 'Resume') : t('common.pause', 'Pause')}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>{isPaused ? t('common.resume', 'Resume') : t('common.pause', 'Pause')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.replayBtn]}
            onPress={handleReplay}
            accessibilityRole="button"
            accessibilityLabel={t('games.suhTahLam.watchAgain', 'Watch Again')}
          >
            <Ionicons name="reload" size={22} color="#4338CA" style={{ marginRight: 8 }} />
            <Text style={[styles.btnText, { color: '#4338CA' }]}>{t('games.suhTahLam.watchAgain', 'Watch Again')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.continueBtn, isPlaying && !hasFinishedOnce && styles.btnDisabled]}
          onPress={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onComplete && onComplete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue', 'Continue')}
        >
          <Text style={styles.btnText}>{t('common.continue', 'Continue')}</Text>
          <Ionicons name="arrow-forward" size={22} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  guidanceCardDark: {
    backgroundColor: '#312E81',
    borderColor: '#4338CA',
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  guidanceSubtitle: {
    fontSize: 14,
    color: '#B45309',
    marginTop: 2,
  },
  textDark: {
    color: '#E0E7FF',
  },
  subTextDark: {
    color: '#C7D2FE',
  },
  controlRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBtn: {
    backgroundColor: '#D97706',
  },
  replayBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  continueBtn: {
    backgroundColor: '#16A34A',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
