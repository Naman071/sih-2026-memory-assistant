/**
 * SIH 2026 Memory Assistant - Namespaced Game-Specific Audio Architecture
 * 
 * Provides isolated, culturally authentic, dementia-friendly acoustic soundscapes:
 * 
 * Namespaces:
 * - SoundManager.common: Universal tactile UI sounds (button press, navigation, notification)
 * - SoundManager.ubilakapi: Coconut mechanics, coastal marimba correct, hollow oops, valley finish
 * - SoundManager.dhopKhel: Assamese cloth ball memory game (isolated dhopkhel_correct.wav, dhopkhel_wrong.wav)
 * - SoundManager.memoryStories: Paper page turn, bell start, reading finished, reflective harp recall, thoughtful hesitation
 * - SoundManager.suhTahLam: Heavy bamboo pole clack, gliding pole open, dancer barefoot steps, Khuang drum, Darbu brass chime
 * 
 * Technical Features:
 * - Zero sound reuse between games (every game has its own sound world)
 * - Built-in per-key debounce to eliminate React re-render double-firing
 * - Channel volume control & global mute
 * - Dual-layer playback: Native expo-audio (SDK 57) + Web HTML5 Audio fallback
 */

import { Platform } from 'react-native';

let ExpoAudio = null;
try {
  ExpoAudio = require('expo-audio');
} catch (_) {
  ExpoAudio = null;
}

// Static bundle asset registries grouped by game domain
const ASSETS_COMMON = {
  gentle_button: require('../../../assets/audio/common/gentle_button_press.wav'),
  app_navigation: require('../../../assets/audio/common/app_navigation.wav'),
  soft_notification: require('../../../assets/audio/common/soft_notification.wav'),
};

const ASSETS_UBILAKAPI = {
  coconut_pickup: require('../../../assets/audio/ubilakapi/coconut_pickup.wav'),
  coconut_pass: require('../../../assets/audio/ubilakapi/coconut_pass.wav'),
  coconut_catch: require('../../../assets/audio/ubilakapi/coconut_catch.wav'),
  coconut_drop: require('../../../assets/audio/ubilakapi/coconut_drop.wav'),
  correct: require('../../../assets/audio/ubilakapi/ubilakapi_correct.wav'),
  wrong: require('../../../assets/audio/ubilakapi/ubilakapi_wrong.wav'),
  round_complete: require('../../../assets/audio/ubilakapi/ubilakapi_round_complete.wav'),
};

const ASSETS_DHOPKHEL = {
  correct: require('../../../assets/audio/dhopKhel/dhopkhel_correct.wav'),
  wrong: require('../../../assets/audio/dhopKhel/dhopkhel_wrong.wav'),
};

const ASSETS_MEMORYSTORIES = {
  page_turn: require('../../../assets/audio/memoryStories/page_turn.wav'),
  story_start: require('../../../assets/audio/memoryStories/story_start.wav'),
  story_complete: require('../../../assets/audio/memoryStories/story_complete.wav'),
  correct: require('../../../assets/audio/memoryStories/recall_correct.wav'),
  wrong: require('../../../assets/audio/memoryStories/recall_wrong.wav'),
};

const ASSETS_SUHTAHLAM = {
  bamboo_clack: require('../../../assets/audio/suhTahLam/bamboo_clack.wav'),
  bamboo_open: require('../../../assets/audio/suhTahLam/bamboo_open.wav'),
  movement_step: require('../../../assets/audio/suhTahLam/movement_step.wav'),
  action_complete: require('../../../assets/audio/suhTahLam/action_complete.wav'),
  correct: require('../../../assets/audio/suhTahLam/suhtahlam_correct.wav'),
  wrong: require('../../../assets/audio/suhTahLam/suhtahlam_wrong.wav'),
};

class AudioEngineCore {
  constructor() {
    this.players = new Map();
    this.muted = false;
    this.masterVolume = 0.85;
    this.sfxVolume = 0.90;
    this.lastPlayedTimes = new Map();
    this.expoAudio = ExpoAudio;
    this.expoAudio = ExpoAudio?.default || ExpoAudio;
    this.isInitialized = false;

    this.initAudioMode();
  }

  async initAudioMode() {
    if (this.isInitialized) return;
    try {
      if (this.expoAudio?.setAudioModeAsync) {
        await this.expoAudio.setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'mixWithOthers',
        }).catch(() => {});
      }
    } catch (_) {}
    this.isInitialized = true;
  }

  setMuted(isMuted) {
    this.muted = Boolean(isMuted);
    if (this.muted) {
      this.stopAll();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Internal player trigger with per-key debouncing
   */
  async playAsset(assetMap, key, options = {}) {
    if (this.muted) return;

    const source = assetMap[key];
    if (!source) return;

    // Debounce to strictly prevent duplicate sounds from React re-renders
    const now = Date.now();
    const minInterval = options.minIntervalMs ?? 110;
    const cacheKey = `${options.domain || 'core'}_${key}`;
    const lastPlayed = this.lastPlayedTimes.get(cacheKey) || 0;
    if (now - lastPlayed < minInterval) {
      return;
    }
    this.lastPlayedTimes.set(cacheKey, now);

    await this.initAudioMode();

    const targetVolume = Math.max(0, Math.min(1, (options.volume ?? 1.0) * this.masterVolume * this.sfxVolume));

    // Native Strategy (expo-audio SDK 57)
    if (this.expoAudio?.createAudioPlayer) {
      try {
        let player = this.players.get(cacheKey);
        if (!player) {
          player = this.expoAudio.createAudioPlayer(source);
          this.players.set(cacheKey, player);
        } else {
          try {
            player.seekTo?.(0);
          } catch (_) {}
        }
        if (player) {
          player.volume = targetVolume;
          player.play?.();
          return;
        }
      } catch (_) {}
    }

    // Web Fallback (HTML5 Audio with WebAudio synthetic fallback)
    if (Platform.OS === 'web') {
      let played = false;
      if (typeof window !== 'undefined' && typeof window.Audio !== 'undefined') {
        try {
          const uri = typeof source === 'string' ? source : (source?.default || source?.uri);
          if (uri && typeof uri === 'string') {
            const webAudio = new window.Audio(uri);
            webAudio.volume = targetVolume;
            const p = webAudio.play();
            if (p && typeof p.then === 'function') {
              p.then(() => {
                played = true;
              }).catch(() => {
                this.playSyntheticTone(key, targetVolume);
              });
              return;
            }
            played = true;
          }
        } catch (_) {}
      }
      if (!played) {
        this.playSyntheticTone(key, targetVolume);
      }
    }
  }

  playSyntheticTone(key, volume = 0.8) {
    if (this.muted) return;
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.synthCtx) {
        this.synthCtx = new AudioContextClass();
      }
      if (this.synthCtx.state === 'suspended') {
        this.synthCtx.resume().catch(() => {});
      }
      const ctx = this.synthCtx;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume * 0.35, now);
      master.connect(ctx.destination);

      if (key === 'correct' || key === 'round_complete' || key === 'story_complete') {
        // Calming harmonic chime (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.001, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.08 + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(g);
          g.connect(master);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.45);
        });
      } else if (key === 'wrong') {
        // Gentle, soft supportive tone (G3 -> E3) - non-punitive, warm
        [196.0, 164.81].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          g.gain.setValueAtTime(0.001, now + idx * 0.12);
          g.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.12 + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          osc.connect(g);
          g.connect(master);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      }
    } catch (_) {}
  }

  stopAll() {
    this.players.forEach((player) => {
      try {
        player?.pause?.();
        player?.seekTo?.(0);
      } catch (_) {}
    });
  }

  stopDomain(domain) {
    this.players.forEach((player, key) => {
      if (key.startsWith(`${domain}_`)) {
        try {
          player?.pause?.();
          player?.seekTo?.(0);
        } catch (_) {}
      }
    });
  }
}

// Global Core Instance
const core = new AudioEngineCore();

/**
 * Public SoundManager API with Game-Isolated Namespaces
 */
export const SoundManager = {
  // Global controls
  setMuted: (muted) => core.setMuted(muted),
  isMuted: () => core.isMuted(),
  setMasterVolume: (v) => core.setMasterVolume(v),
  setSfxVolume: (v) => core.setSfxVolume(v),
  stopAll: () => core.stopAll(),

  // 1. Common UI Domain
  common: {
    playGentleButtonPress: (volume = 0.7) =>
      core.playAsset(ASSETS_COMMON, 'gentle_button', { volume, minIntervalMs: 80, domain: 'common' }),
    playAppNavigation: (volume = 0.6) =>
      core.playAsset(ASSETS_COMMON, 'app_navigation', { volume, minIntervalMs: 120, domain: 'common' }),
    playSoftNotification: (volume = 0.8) =>
      core.playAsset(ASSETS_COMMON, 'soft_notification', { volume, minIntervalMs: 300, domain: 'common' }),
  },

  // 2. Ubilakapi Domain (Coconut Passing Game)
  ubilakapi: {
    playCoconutPickup: (volume = 0.75) =>
      core.playAsset(ASSETS_UBILAKAPI, 'coconut_pickup', { volume, minIntervalMs: 120, domain: 'ubilakapi' }),
    playCoconutPass: (volume = 0.75) =>
      core.playAsset(ASSETS_UBILAKAPI, 'coconut_pass', { volume, minIntervalMs: 140, domain: 'ubilakapi' }),
    playCoconutCatch: (volume = 0.85) =>
      core.playAsset(ASSETS_UBILAKAPI, 'coconut_catch', { volume, minIntervalMs: 140, domain: 'ubilakapi' }),
    playCoconutDrop: (volume = 0.75) =>
      core.playAsset(ASSETS_UBILAKAPI, 'coconut_drop', { volume, minIntervalMs: 160, domain: 'ubilakapi' }),
    playCorrect: (volume = 0.90) =>
      core.playAsset(ASSETS_UBILAKAPI, 'correct', { volume, minIntervalMs: 250, domain: 'ubilakapi' }),
    playWrong: (volume = 0.80) =>
      core.playAsset(ASSETS_UBILAKAPI, 'wrong', { volume, minIntervalMs: 250, domain: 'ubilakapi' }),
    playRoundComplete: (volume = 0.92) =>
      core.playAsset(ASSETS_UBILAKAPI, 'round_complete', { volume, minIntervalMs: 500, domain: 'ubilakapi' }),
    stop: () => core.stopDomain('ubilakapi'),
  },

  // 3. Dhop Khel Domain (Assamese Cloth Ball Memory Game)
  // Strictly only two sounds: correct and wrong. No action or environmental sounds.
  dhopKhel: {
    playCorrect: (volume = 0.90) =>
      core.playAsset(ASSETS_DHOPKHEL, 'correct', { volume, minIntervalMs: 250, domain: 'dhopKhel' }),
    playWrong: (volume = 0.80) =>
      core.playAsset(ASSETS_DHOPKHEL, 'wrong', { volume, minIntervalMs: 250, domain: 'dhopKhel' }),
    stop: () => core.stopDomain('dhopKhel'),
  },

  // 4. Memory Stories Domain (Episodic Recall)
  memoryStories: {
    playPageTurn: (volume = 0.70) =>
      core.playAsset(ASSETS_MEMORYSTORIES, 'page_turn', { volume, minIntervalMs: 160, domain: 'memoryStories' }),
    playStoryStart: (volume = 0.75) =>
      core.playAsset(ASSETS_MEMORYSTORIES, 'story_start', { volume, minIntervalMs: 300, domain: 'memoryStories' }),
    playStoryComplete: (volume = 0.85) =>
      core.playAsset(ASSETS_MEMORYSTORIES, 'story_complete', { volume, minIntervalMs: 400, domain: 'memoryStories' }),
    playRecallCorrect: (volume = 0.90) =>
      core.playAsset(ASSETS_MEMORYSTORIES, 'correct', { volume, minIntervalMs: 250, domain: 'memoryStories' }),
    playRecallWrong: (volume = 0.80) =>
      core.playAsset(ASSETS_MEMORYSTORIES, 'wrong', { volume, minIntervalMs: 250, domain: 'memoryStories' }),
    stop: () => core.stopDomain('memoryStories'),
  },

  // 5. Suh Tah Lam Domain (Traditional Mizo Bamboo Dance)
  suhTahLam: {
    playBambooClack: (volume = 0.85) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'bamboo_clack', { volume, minIntervalMs: 70, domain: 'suhTahLam' }),
    playBambooOpen: (volume = 0.65) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'bamboo_open', { volume, minIntervalMs: 70, domain: 'suhTahLam' }),
    playMovementStep: (volume = 0.60) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'movement_step', { volume, minIntervalMs: 120, domain: 'suhTahLam' }),
    playActionComplete: (volume = 0.85) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'action_complete', { volume, minIntervalMs: 300, domain: 'suhTahLam' }),
    playCorrect: (volume = 0.90) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'correct', { volume, minIntervalMs: 250, domain: 'suhTahLam' }),
    playWrong: (volume = 0.80) =>
      core.playAsset(ASSETS_SUHTAHLAM, 'wrong', { volume, minIntervalMs: 250, domain: 'suhTahLam' }),
    stop: () => core.stopDomain('suhTahLam'),
  },

  /* -------------------------------------------------------------
     Safe Backward-Compatibility Mappings
  ------------------------------------------------------------- */
  playCorrect: (volume = 0.9) => SoundManager.dhopKhel.playCorrect(volume),
  playWrong: (volume = 0.8) => SoundManager.dhopKhel.playWrong(volume),
  playCorrectAnswer: (volume = 0.9) => SoundManager.dhopKhel.playCorrect(volume),
  playWrongAnswer: (volume = 0.8) => SoundManager.dhopKhel.playWrong(volume),
  playRoundComplete: (volume = 0.9) => SoundManager.common.playSoftNotification(volume),
  playLevelComplete: (volume = 0.9) => SoundManager.common.playSoftNotification(volume),
  playGameComplete: (volume = 0.9) => SoundManager.common.playSoftNotification(volume),
  playBallPass: () => {},
  playBallCatch: () => {},
  playBallDrop: () => {},
  playBambooClack: () => {},
  playBambooOpen: () => {},
  playBambooTap: () => {},
  playBambooMove: () => {},
  playBambooPickup: () => {},
  playCoconutPass: (volume = 0.75) => SoundManager.ubilakapi.playCoconutPass(volume),
  playCoconutCatch: (volume = 0.85) => SoundManager.ubilakapi.playCoconutCatch(volume),
  playStoryComplete: (volume = 0.85) => SoundManager.memoryStories.playStoryComplete(volume),
  playPlayerStep: (volume = 0.6) => SoundManager.suhTahLam.playMovementStep(volume),
  playGentleButton: (volume = 0.7) => SoundManager.common.playGentleButtonPress(volume),
  startAmbient: () => {},
  stopAmbient: () => {},
};

export default SoundManager;
