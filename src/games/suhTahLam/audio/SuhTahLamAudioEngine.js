/**
 * SUH TAH LAM - Traditional Northeast Indian Acoustic Audio Engine
 * 
 * Physically-modeled acoustic synthesis for traditional bamboo dance wellness:
 * 1. Hollow Bamboo Clack (Raw-chhe): Resonant wooden impact of bamboo poles
 * 2. Khuang Indigenous Drum: Warm, low heartbeat pulse grounding the rhythm
 * 3. Traditional Bamboo Flute (Rawchhem / Sial Reng): Breath-modeled pentatonic melodies
 * 4. Ambient Mountain Valley Pad: Calming acoustic drone for quiet focus during recall
 * 5. Darbu Brass Resonator: Warm celebratory harmonic chimes on successful recall
 * 
 * 100% offline, zero-bandwidth, dementia-friendly (calm 72 BPM, no harsh frequencies).
 */

// Northeast Traditional Pentatonic Scale Frequencies (Key of D)
const PENTATONIC_SCALE = {
  D3: 146.83,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  F5: 698.46,
};

// Soothing folk melody phrases (notes and rhythmic beat lengths)
const TRADITIONAL_FOLK_PHRASES = [
  // Phrase A: Gentle opening invocation
  [
    { note: 'D4', duration: 0.6 },
    { note: 'F4', duration: 0.4 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.9 },
    { note: 'G4', duration: 0.4 },
    { note: 'F4', duration: 0.5 },
    { note: 'D4', duration: 1.1 },
  ],
  // Phrase B: Rhythmic ascending sway
  [
    { note: 'F4', duration: 0.5 },
    { note: 'G4', duration: 0.4 },
    { note: 'A4', duration: 0.6 },
    { note: 'C5', duration: 0.8 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'F4', duration: 0.9 },
  ],
  // Phrase C: High floating mountain breeze
  [
    { note: 'A4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'D5', duration: 0.9 },
    { note: 'C5', duration: 0.4 },
    { note: 'A4', duration: 0.6 },
    { note: 'G4', duration: 0.5 },
    { note: 'D4', duration: 1.2 },
  ],
  // Phrase D: Peaceful grounding resolution
  [
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'F4', duration: 0.6 },
    { note: 'D4', duration: 0.7 },
    { note: 'C4', duration: 0.5 },
    { note: 'D4', duration: 1.4 },
  ],
];

export class SuhTahLamAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.masterVolume = 0.4;
    this.isMelodyPlaying = false;
    this.melodyTimer = null;
    this.currentPhraseIdx = 0;
    this.activeNodes = new Set();
    this.ambientOscillators = [];
  }

  /**
   * Initializes or returns the active Web Audio Context safely
   */
  initContext() {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();

          // Master Gain Node
          this.masterGain = this.audioCtx.createGain();
          this.masterGain.gain.setValueAtTime(
            this.isMuted ? 0 : this.masterVolume,
            this.audioCtx.currentTime
          );
          this.masterGain.connect(this.audioCtx.destination);

          // Ambient Sub-Bus
          this.ambientGain = this.audioCtx.createGain();
          this.ambientGain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
          this.ambientGain.connect(this.masterGain);
        }
      } catch (err) {
        console.warn('AudioContext initialization notice:', err);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Toggles mute state cleanly
   */
  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(
      this.isMuted ? 0 : this.masterVolume,
      now + 0.05
    );
  }

  /**
   * Adjusts master volume level (0.0 to 1.0)
   */
  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.audioCtx && this.masterGain && !this.isMuted) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterVolume, now);
    }
  }

  /**
   * 1. HOLLOW BAMBOO CLACK (Raw-chhe)
   * Simulates the organic physics of two hollow cured bamboo poles striking together:
   * - Sharp wooden transient strike
   * - Resonant hollow tubular body resonance (bandpass filtered)
   */
  playBambooClack() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Body Resonance Oscillator (Wood tube fundamental ~540 Hz)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(560, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(240, now + 0.07);

      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(580, now);
      bodyFilter.Q.setValueAtTime(6.0, now);

      bodyGain.gain.setValueAtTime(0.35, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.masterGain);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.09);

      // Transient Impact Click (Wooden slap high snap ~1600 Hz)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1450, now);
      clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.035);

      clickGain.gain.setValueAtTime(0.22, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);

      clickOsc.start(now);
      clickOsc.stop(now + 0.045);
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * 2. KHUANG TRADITIONAL DRUM
   * Deep, warm indigenous hide drum pulse providing a grounded heartbeat
   */
  playKhuangPulse() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(105, now);
      osc.frequency.exponentialRampToValueAtTime(64, now + 0.16);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * 3. TRADITIONAL BAMBOO FLUTE NOTE (Rawchhem / Sial Reng)
   * Breath-modeled acoustic tone with gentle vibrato and soft embouchure swell
   */
  playFluteNote(noteName, durationSec = 0.8, startTimeOffset = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const freq = PENTATONIC_SCALE[noteName] || 440;

    try {
      const start = ctx.currentTime + startTimeOffset;
      const attack = 0.09;
      const decay = durationSec - attack;

      // Primary Breath Tone (Pure Bamboo Cavity)
      const primaryOsc = ctx.createOscillator();
      primaryOsc.type = 'sine';
      primaryOsc.frequency.setValueAtTime(freq, start);

      // Upper Octave Harmonic (Warm reed overtones)
      const harmonicOsc = ctx.createOscillator();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(freq * 2, start);

      // Natural Breath Vibrato LFO (5.2 Hz gentle mountain vibrato)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, start);
      lfoGain.gain.setValueAtTime(freq * 0.012, start); // Subtle 1.2% vibrato depth
      lfo.connect(primaryOsc.frequency);

      // Warm Bamboo Low-Pass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, start);

      // Natural Breath Envelope Swell
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, start);
      gainNode.gain.linearRampToValueAtTime(0.18, start + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + durationSec);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.04, start);

      primaryOsc.connect(filter);
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(filter);

      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      lfo.start(start);
      primaryOsc.start(start);
      harmonicOsc.start(start);

      lfo.stop(start + durationSec);
      primaryOsc.stop(start + durationSec);
      harmonicOsc.stop(start + durationSec);
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Plays a flowing sequence of traditional folk melody phrases
   */
  startFluteMelody() {
    if (this.isMelodyPlaying) return;
    this.isMelodyPlaying = true;
    this.initContext();

    const playNextPhrase = () => {
      if (!this.isMelodyPlaying) return;

      const phrase = TRADITIONAL_FOLK_PHRASES[this.currentPhraseIdx];
      let offset = 0.1;

      phrase.forEach((item) => {
        this.playFluteNote(item.note, item.duration, offset);
        // Accompany selected notes with grounding Khuang drum
        if (item.note === 'D4' || item.note === 'A4') {
          setTimeout(() => {
            if (this.isMelodyPlaying) this.playKhuangPulse();
          }, offset * 1000);
        }
        offset += item.duration * 0.95;
      });

      this.currentPhraseIdx = (this.currentPhraseIdx + 1) % TRADITIONAL_FOLK_PHRASES.length;

      // Natural pause between melodic breath phrases (1.2s - 1.8s)
      const pauseBetweenPhrases = 1400;
      this.melodyTimer = setTimeout(playNextPhrase, (offset * 1000) + pauseBetweenPhrases);
    };

    playNextPhrase();
  }

  /**
   * Stops the active melody gracefully
   */
  stopFluteMelody() {
    this.isMelodyPlaying = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  /**
   * 4. AMBIENT MOUNTAIN VALLEY DRONE
   * Soft, continuous acoustic drone during recall/question answering to avoid cold silence
   */
  startAmbientDrone() {
    if (this.ambientOscillators.length > 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [PENTATONIC_SCALE.D3, PENTATONIC_SCALE.A3, PENTATONIC_SCALE.D4];

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(now);
        this.ambientOscillators.push({ osc, gain });
      });
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Stops the ambient drone with a gentle fade-out
   */
  stopAmbientDrone() {
    if (!this.audioCtx || this.ambientOscillators.length === 0) return;

    try {
      const now = this.audioCtx.currentTime;
      this.ambientOscillators.forEach(({ osc, gain }) => {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (stopErr) {
            // Audio node may already be stopped or disconnected
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              console.debug?.('Audio node cleanup notice:', stopErr?.message);
            }
          }
        }, 850);
      });
      this.ambientOscillators = [];
    } catch (cleanupErr) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.debug?.('Ambient stop error:', cleanupErr?.message);
      }
      this.ambientOscillators = [];
    }
  }

  /**
   * 5. DARBU BRASS CELEBRATION CHIME
   * Harmonious pentatonic ascending celebration cascade on correct answer
   */
  playCelebrationChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = ['D4', 'F4', 'A4', 'D5'];
    notes.forEach((note, idx) => {
      const offset = idx * 0.12;
      const freq = PENTATONIC_SCALE[note] || 440;

      try {
        const start = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + 0.75);
      } catch (playErr) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.debug?.('Celebration chime note error:', playErr?.message);
        }
      }
    });
  }

  /**
   * 6. GENTLE ENCOURAGEMENT CADENCE
   * Warm, soothing two-note resolution on gentle retry (never a harsh buzzer)
   */
  playGentleEncouragement() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { note: 'F4', offset: 0, duration: 0.5 },
      { note: 'D4', offset: 0.28, duration: 0.7 },
    ];

    notes.forEach(({ note, offset, duration }) => {
      const freq = PENTATONIC_SCALE[note] || 349;
      try {
        const start = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + duration + 0.05);
      } catch (encouragementErr) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.debug?.('Encouragement note error:', encouragementErr?.message);
        }
      }
    });
  }

  /**
   * Celebration alias
   */
  playCelebration() {
    this.playCelebrationChime();
  }

  /**
   * Encouragement alias
   */
  playEncouragement() {
    this.playGentleEncouragement();
  }

  /**
   * Pauses all audio playback immediately
   */
  pause() {
    this.stopFluteMelody();
    this.stopAmbientDrone();
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend().catch((err) => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug?.('Audio suspend:', err?.message);
      });
    }
  }

  /**
   * Resumes audio context if previously suspended
   */
  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch((err) => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug?.('Audio resume:', err?.message);
      });
    }
  }

  /**
   * Cleanly disposes of all audio nodes and timers
   */
  stopAll() {
    this.stopFluteMelody();
    this.stopAmbientDrone();
    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch((err) => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug?.('Audio close:', err?.message);
        });
      } catch (closeErr) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug?.('Audio context dispose error:', closeErr?.message);
      }
      this.audioCtx = null;
      this.masterGain = null;
      this.ambientGain = null;
    }
  }
}
