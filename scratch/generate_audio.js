/**
 * High-Fidelity Organic Acoustic Sound Generator for SIH 2026 Memory Assistant
 * 
 * Generates natural, physically realistic, culturally respectful sound assets:
 * - Handcrafted acoustic textures: wooden chimes, bells, warm mallet percussion
 * - Multi-layer hand impact, cloth flutter, and resonant hollow bamboo modeling
 * - Soft open-ground wind & foliage ambient backdrop
 * - Calming and rewarding for elderly dementia care (zero harsh buzzers/casino beeps)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Write 16-bit PCM samples with soft limiter
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-0.98, Math.min(0.98, samples[i]));
    let val = Math.round(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(val, 44 + i * 2);
  }

  return buffer;
}

// Pseudo-random noise generator with seed for reproducibility
function pseudoNoise(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646 * 2 - 1;
  };
}

/**
 * 1. Warm Natural Achievement Chime (0.85s)
 * Handcrafted wooden chime + Tibetan singing bell texture + warm tonal rise (D5 -> G5 -> A5 -> D6)
 */
function generateCorrectAnswer() {
  const duration = 0.85;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const partials = [
    // Note 1: Warm wooden strike D5
    { freq: 587.33, start: 0.00, amp: 0.35, decay: 0.55, wood: 0.4 },
    // Note 2: Natural mallet bell G5
    { freq: 783.99, start: 0.12, amp: 0.38, decay: 0.60, wood: 0.25 },
    // Note 3: Warm resonance A5
    { freq: 880.00, start: 0.24, amp: 0.42, decay: 0.65, wood: 0.15 },
    // Note 4: Shimmering natural chime peak D6
    { freq: 1174.66, start: 0.36, amp: 0.32, decay: 0.70, wood: 0.08 },
  ];

  const noise = pseudoNoise(42);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const p of partials) {
      if (t >= p.start) {
        const dt = t - p.start;
        const attack = Math.min(1, dt / 0.015);
        const decay = Math.exp(-dt * (4.0 / p.decay));
        const env = attack * decay;

        // Fundamental + inharmonic mallet partials
        const f1 = Math.sin(2 * Math.PI * p.freq * dt);
        const f2 = 0.28 * Math.sin(2 * Math.PI * (p.freq * 2.76) * dt);
        const f3 = 0.14 * Math.sin(2 * Math.PI * (p.freq * 5.4) * dt);
        // Soft wooden strike transient
        const woodThump = p.wood * Math.exp(-dt * 45) * Math.sin(2 * Math.PI * 180 * dt);

        s += (f1 + f2 + f3 + woodThump) * env * p.amp;
      }
    }
    samples[i] = s * 0.70;
  }
  return samples;
}

/**
 * 2. Gentle Wrong Answer (0.45s)
 * Muted wooden knock + low percussion + soft descending tone (F4 -> C#4).
 * Non-punitive, warm, comforting "oops".
 */
function generateWrongAnswer() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 349.23, start: 0.00, amp: 0.35, decay: 0.24 }, // F4
    { freq: 277.18, start: 0.14, amp: 0.32, decay: 0.28 }, // C#4
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const attack = Math.min(1, dt / 0.022); // soft 22ms attack
        const decay = Math.exp(-dt * (5.5 / n.decay));
        const env = attack * decay;

        // Muted wooden marimba bar resonance
        const f1 = Math.sin(2 * Math.PI * n.freq * dt);
        const f2 = 0.22 * Math.sin(2 * Math.PI * (n.freq * 3.0) * dt);
        const woodKnock = 0.25 * Math.exp(-dt * 60) * Math.sin(2 * Math.PI * 140 * dt);

        s += (f1 + f2 + woodKnock) * env * n.amp;
      }
    }
    samples[i] = s * 0.65;
  }
  return samples;
}

/**
 * 3. Soft Success Chime / Round Complete (0.65s)
 * Gentle two-tone acoustic affirmation (A5 -> C#6) with warm decay.
 */
function generateRoundComplete() {
  const duration = 0.65;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 880.00, start: 0.00, amp: 0.34, decay: 0.45 },  // A5
    { freq: 1108.73, start: 0.16, amp: 0.36, decay: 0.50 }, // C#6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const attack = Math.min(1, dt / 0.016);
        const decay = Math.exp(-dt * (4.2 / n.decay));
        const env = attack * decay;

        const wave = Math.sin(2 * Math.PI * n.freq * dt) +
                     0.2 * Math.sin(2 * Math.PI * (n.freq * 2.0) * dt);
        s += wave * env * n.amp;
      }
    }
    samples[i] = s * 0.72;
  }
  return samples;
}

/**
 * 4. Level Complete Sound (1.20s)
 * Festive but calm multi-note folk celebration (D4 -> F#4 -> A4 -> D5 -> F#5).
 */
function generateLevelComplete() {
  const duration = 1.20;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 293.66, start: 0.00, amp: 0.30, decay: 0.50 }, // D4
    { freq: 369.99, start: 0.12, amp: 0.30, decay: 0.55 }, // F#4
    { freq: 440.00, start: 0.24, amp: 0.32, decay: 0.60 }, // A4
    { freq: 587.33, start: 0.38, amp: 0.35, decay: 0.70 }, // D5
    { freq: 739.99, start: 0.52, amp: 0.38, decay: 0.85 }, // F#5
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const attack = Math.min(1, dt / 0.020);
        const decay = Math.exp(-dt * (3.8 / n.decay));
        const env = attack * decay;

        const f1 = Math.sin(2 * Math.PI * n.freq * dt);
        const f2 = 0.25 * Math.sin(2 * Math.PI * (n.freq * 2) * dt);
        const f3 = 0.10 * Math.sin(2 * Math.PI * (n.freq * 3) * dt);
        s += (f1 + f2 + f3) * env * n.amp;
      }
    }
    samples[i] = s * 0.75;
  }
  return samples;
}

/**
 * 5. Game Complete Sound (1.50s)
 * Serene peaceful pentatonic cascade.
 */
function generateGameComplete() {
  const duration = 1.50;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 523.25, start: 0.00, amp: 0.28, decay: 0.80 }, // C5
    { freq: 587.33, start: 0.16, amp: 0.28, decay: 0.85 }, // D5
    { freq: 659.25, start: 0.32, amp: 0.30, decay: 0.90 }, // E5
    { freq: 783.99, start: 0.48, amp: 0.34, decay: 0.95 }, // G5
    { freq: 880.00, start: 0.64, amp: 0.36, decay: 1.05 }, // A5
    { freq: 1046.50, start: 0.80, amp: 0.38, decay: 1.20 }, // C6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const attack = Math.min(1, dt / 0.025);
        const decay = Math.exp(-dt * (3.5 / n.decay));
        const env = attack * decay;

        const f1 = Math.sin(2 * Math.PI * n.freq * dt);
        const f2 = 0.24 * Math.sin(2 * Math.PI * (n.freq * 2) * dt);
        const f3 = 0.08 * Math.sin(2 * Math.PI * (n.freq * 3) * dt);
        s += (f1 + f2 + f3) * env * n.amp;
      }
    }
    samples[i] = s * 0.72;
  }
  return samples;
}

/**
 * 6. Realistic Ball Catch Sound (0.22s)
 * Ball entering human hands: soft fleshy palm impact + padded cloth flutter.
 */
function generateBallCatch() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(108);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const envThump = Math.exp(-t * 38);
    const envFlesh = Math.exp(-t * 55);
    const envCloth = Math.exp(-t * 28);

    // Deep hand cushion thump (110Hz -> 75Hz pitch drop)
    const pitch = 110 - t * 140;
    const palmThump = Math.sin(2 * Math.PI * Math.max(40, pitch) * t) * envThump * 0.48;

    // Flesh impact transient (240Hz)
    const fleshContact = Math.sin(2 * Math.PI * 240 * t) * envFlesh * 0.26;

    // Cloth movement friction (filtered noise)
    const clothFlutter = noise() * envCloth * 0.22;

    samples[i] = (palmThump + fleshContact + clothFlutter) * 0.78;
  }
  return samples;
}

/**
 * 7. Realistic Ball Pass Sound (0.18s)
 * Hand release friction + subtle air flight whoosh. Quieter than catch.
 */
function generateBallPass() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(77);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Parabolic whoosh envelope
    const env = Math.sin(Math.PI * (t / duration));

    // Low gentle air movement + finger release
    const airWhoosh = noise() * env * 0.24;
    const handSlip = Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 40) * 0.22;

    samples[i] = (airWhoosh + handSlip) * 0.60;
  }
  return samples;
}

/**
 * 8. Realistic Ball Drop Sound (0.25s)
 * Padded cloth ball contact with compact earth/grass.
 */
function generateBallDrop() {
  const duration = 0.25;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(88);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const envEarth = Math.exp(-t * 32);
    const envGrass = Math.exp(-t * 45);

    // Deep earth contact (90Hz)
    const earthThud = Math.sin(2 * Math.PI * 90 * t) * envEarth * 0.45;
    // Grass blade rustle
    const grassRustle = noise() * envGrass * 0.25;

    samples[i] = (earthThud + grassRustle) * 0.70;
  }
  return samples;
}

/**
 * 9. Realistic Bamboo Tap (0.14s)
 * Light hollow bamboo touch/tap.
 */
function generateBambooTap() {
  const duration = 0.14;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 60);

    // Hollow bamboo chamber resonance
    const f1 = Math.sin(2 * Math.PI * 480 * t) * 0.40;
    const f2 = Math.sin(2 * Math.PI * 1180 * t) * 0.28;
    const f3 = Math.sin(2 * Math.PI * 2240 * t) * 0.12;

    samples[i] = (f1 + f2 + f3) * env * 0.65;
  }
  return samples;
}

/**
 * 10. Realistic Bamboo Clack (0.18s)
 * Resonant hollow cylindrical strike of two bamboo poles closing.
 */
function generateBambooClack() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);

    // Primary hollow cavity resonance
    const f1 = Math.sin(2 * Math.PI * 520 * t) * 0.45;
    // Overtones of cylindrical wood tube
    const f2 = Math.sin(2 * Math.PI * 1350 * t) * 0.32;
    const f3 = Math.sin(2 * Math.PI * 2780 * t) * 0.18;
    // Impact spike
    const snap = Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 120) * 0.22;

    samples[i] = (f1 + f2 + f3 + snap) * env * 0.72;
  }
  return samples;
}

/**
 * 11. Realistic Bamboo Move / Glide (0.22s)
 * Bamboo sliding across the ground or across another pole.
 */
function generateBambooMove() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(55);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));

    // Sliding wooden friction
    const glide = noise() * env * 0.28;
    const chamberTone = Math.sin(2 * Math.PI * 360 * t) * env * 0.18;

    samples[i] = (glide + chamberTone) * 0.60;
  }
  return samples;
}

/**
 * 12. Bamboo Pickup Sound (0.20s)
 * Bamboo lifted from ground with subtle hollow air release.
 */
function generateBambooPickup() {
  const duration = 0.20;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 35);

    // Light hollow un-seating pop
    const pop = Math.sin(2 * Math.PI * 320 * t) * env * 0.35;
    const airRing = Math.sin(2 * Math.PI * 680 * t) * Math.exp(-t * 25) * 0.22;

    samples[i] = (pop + airRing) * 0.65;
  }
  return samples;
}

/**
 * 13. Player Footstep on Compact Earth / Grass (0.18s)
 */
function generatePlayerStep() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(63);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 40);

    const groundThump = Math.sin(2 * Math.PI * 85 * t) * env * 0.35;
    const turfScuff = noise() * env * 0.20;

    samples[i] = (groundThump + turfScuff) * 0.55;
  }
  return samples;
}

/**
 * 14. Gentle Button Sound (0.08s)
 * Tactile, soft wooden UI click.
 */
function generateGentleButton() {
  const duration = 0.08;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);

    const click = Math.sin(2 * Math.PI * 720 * t) * 0.45 +
                  Math.sin(2 * Math.PI * 1440 * t) * 0.20;

    samples[i] = click * env * 0.50;
  }
  return samples;
}

/**
 * 15. Ambient Wind & Field Atmosphere (2.5s loopable)
 * Very subtle open-ground breeze and foliage rustle.
 */
function generateAmbientWindField() {
  const duration = 2.50;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(12345);

  // Gentle pink noise filter state
  let b0 = 0, b1 = 0, b2 = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const white = noise();

    // 3-pole pink filter for natural wind acoustics
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    const pink = (b0 + b1 + b2 + white * 0.1848) * 0.15;

    // Slow organic wind swell (0.4 Hz breathing)
    const swell = 0.70 + 0.30 * Math.sin(2 * Math.PI * 0.4 * t);

    // Crossfade at loop boundaries (first 0.2s and last 0.2s)
    let loopFade = 1.0;
    if (t < 0.2) loopFade = t / 0.2;
    else if (t > duration - 0.2) loopFade = (duration - t) / 0.2;

    samples[i] = pink * swell * loopFade * 0.35;
  }
  return samples;
}

/**
 * 16. Coconut Pass & Catch (Existing Ubilakapki assets preserved & enhanced)
 */
function generateCoconutPass() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(33);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const whoosh = noise() * env * 0.26;
    const huskTone = Math.sin(2 * Math.PI * 210 * t) * env * 0.16;
    samples[i] = (whoosh + huskTone) * 0.65;
  }
  return samples;
}

function generateCoconutCatch() {
  const duration = 0.16;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 45);
    const huskImpact = Math.sin(2 * Math.PI * 260 * t) * 0.44;
    const fiberTone = Math.sin(2 * Math.PI * 680 * t) * 0.22;
    samples[i] = (huskImpact + fiberTone) * env * 0.72;
  }
  return samples;
}

function generateBambooOpen() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const noise = pseudoNoise(99);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const friction = noise() * env * 0.25;
    const chamberTone = Math.sin(2 * Math.PI * 340 * t) * env * 0.18;
    samples[i] = (friction + chamberTone) * 0.62;
  }
  return samples;
}

function generateStoryComplete() {
  const duration = 0.85;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 440.00, start: 0.00, amp: 0.32, decay: 0.45 }, // A4
    { freq: 554.37, start: 0.15, amp: 0.34, decay: 0.48 }, // C#5
    { freq: 659.25, start: 0.30, amp: 0.36, decay: 0.55 }, // E5
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const attack = Math.min(1, dt / 0.020);
        const decay = Math.exp(-dt * (4.0 / n.decay));
        const env = attack * decay;
        s += Math.sin(2 * Math.PI * n.freq * dt) * env * n.amp;
      }
    }
    samples[i] = s * 0.70;
  }
  return samples;
}

// -------------------------------------------------------------
// MAIN GENERATION SCRIPT
// -------------------------------------------------------------
const outputDir = path.resolve(__dirname, '../assets/audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const soundFiles = [
  // 1. Primary semantic events
  { name: 'correct_answer.wav', gen: generateCorrectAnswer },
  { name: 'wrong_answer.wav', gen: generateWrongAnswer },
  { name: 'soft_success_chime.wav', gen: generateRoundComplete },
  { name: 'round_complete.wav', gen: generateRoundComplete },
  { name: 'level_complete.wav', gen: generateLevelComplete },
  { name: 'game_complete.wav', gen: generateGameComplete },
  { name: 'ball_catch.wav', gen: generateBallCatch },
  { name: 'ball_pass.wav', gen: generateBallPass },
  { name: 'ball_drop.wav', gen: generateBallDrop },
  { name: 'bamboo_tap.wav', gen: generateBambooTap },
  { name: 'bamboo_clack.wav', gen: generateBambooClack },
  { name: 'bamboo_move.wav', gen: generateBambooMove },
  { name: 'bamboo_pickup.wav', gen: generateBambooPickup },
  { name: 'bamboo_open.wav', gen: generateBambooOpen },
  { name: 'player_step.wav', gen: generatePlayerStep },
  { name: 'gentle_button.wav', gen: generateGentleButton },
  { name: 'ambient_wind_field.wav', gen: generateAmbientWindField },
  { name: 'coconut_pass.wav', gen: generateCoconutPass },
  { name: 'coconut_catch.wav', gen: generateCoconutCatch },
  { name: 'story_complete.wav', gen: generateStoryComplete },

  // Backwards compatibility aliases
  { name: 'correct.wav', gen: generateCorrectAnswer },
  { name: 'wrong.wav', gen: generateWrongAnswer },
];

console.log(`Writing ${soundFiles.length} organic audio files to: ${outputDir}`);

for (const item of soundFiles) {
  const filePath = path.join(outputDir, item.name);
  const samples = item.gen();
  const buffer = createWavBuffer(samples);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Generated ${item.name} (${buffer.length} bytes, ${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

console.log('All organic audio assets successfully generated!');
