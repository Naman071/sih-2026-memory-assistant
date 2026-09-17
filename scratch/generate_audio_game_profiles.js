/**
 * Audio Synthesis Generator for Game-Specific Sound Profiles
 * SIH 2026 Memory Assistant
 * 
 * Generates 16-bit 44.1kHz mono PCM WAV files in isolated game directories:
 * - common/
 * - ubilakapi/
 * - dhopKhel/
 * - memoryStories/
 * - suhTahLam/
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

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

  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-0.98, Math.min(0.98, samples[i]));
    let val = Math.round(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(val, 44 + i * 2);
  }

  return buffer;
}

function pseudoNoise(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646 * 2 - 1;
  };
}

// -----------------------------------------------------------------
// 1. COMMON UI AUDIO
// -----------------------------------------------------------------
function genGentleButtonPress() {
  const duration = 0.08;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);
    const click = Math.sin(2 * Math.PI * 680 * t) * 0.5 + Math.sin(2 * Math.PI * 1360 * t) * 0.2;
    s[i] = click * env * 0.45;
  }
  return s;
}

function genAppNavigation() {
  const duration = 0.12;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const tone = Math.sin(2 * Math.PI * (440 + t * 400) * t);
    s[i] = tone * env * 0.25;
  }
  return s;
}

function genSoftNotification() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 659.25, start: 0.0, d: 0.35, a: 0.3 }, // E5
    { f: 880.00, start: 0.1, d: 0.35, a: 0.35 }, // A5
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.015) * Math.exp(-dt * (4.0 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.6;
  }
  return s;
}

// -----------------------------------------------------------------
// 2. UBILAKAPI (COCONUT PASSING GAME) AUDIO
// -----------------------------------------------------------------
function genCoconutPickup() {
  const duration = 0.15;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(101);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const fiber = noise() * env * 0.25;
    const husk = Math.sin(2 * Math.PI * 220 * t) * env * 0.2;
    s[i] = (fiber + husk) * 0.6;
  }
  return s;
}

function genCoconutPass() {
  const duration = 0.22;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(102);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const whoosh = noise() * env * 0.24;
    const huskRing = Math.sin(2 * Math.PI * 190 * t) * env * 0.15;
    s[i] = (whoosh + huskRing) * 0.65;
  }
  return s;
}

function genCoconutCatch() {
  const duration = 0.16;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 48);
    const huskThump = Math.sin(2 * Math.PI * 240 * t) * 0.45;
    const fiberRing = Math.sin(2 * Math.PI * 620 * t) * 0.2;
    s[i] = (huskThump + fiberRing) * env * 0.72;
  }
  return s;
}

function genCoconutDrop() {
  const duration = 0.24;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(103);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 36);
    const thump = Math.sin(2 * Math.PI * 130 * t) * 0.42;
    const scatter = noise() * env * 0.22;
    s[i] = (thump + scatter) * env * 0.68;
  }
  return s;
}

function genUbilakapiCorrect() {
  // Coastal / Valley Warm Marimba Affirmation (G4 -> B4 -> D5 -> G5)
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 392.00, start: 0.00, d: 0.45, a: 0.30 }, // G4
    { f: 493.88, start: 0.11, d: 0.50, a: 0.32 }, // B4
    { f: 587.33, start: 0.22, d: 0.55, a: 0.35 }, // D5
    { f: 783.99, start: 0.33, d: 0.65, a: 0.40 }, // G5
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.012) * Math.exp(-dt * (4.2 / note.d));
        // Marimba wooden bar harmonics
        const f1 = Math.sin(2 * Math.PI * note.f * dt);
        const f2 = 0.2 * Math.sin(2 * Math.PI * (note.f * 3.0) * dt);
        const woodClick = 0.25 * Math.exp(-dt * 60) * Math.sin(2 * Math.PI * 180 * dt);
        val += (f1 + f2 + woodClick) * env * note.a;
      }
    }
    s[i] = val * 0.68;
  }
  return s;
}

function genUbilakapiWrong() {
  // Soft hollow coconut double-tap oops (F4 -> D4)
  const duration = 0.42;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 349.23, start: 0.00, d: 0.22, a: 0.35 },
    { f: 293.66, start: 0.14, d: 0.26, a: 0.32 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.02) * Math.exp(-dt * (5.5 / note.d));
        const hollowHusk = Math.sin(2 * Math.PI * note.f * dt) + 0.22 * Math.sin(2 * Math.PI * (note.f * 2) * dt);
        val += hollowHusk * env * note.a;
      }
    }
    s[i] = val * 0.62;
  }
  return s;
}

function genUbilakapiRoundComplete() {
  // 3-note valley celebration (C5 -> E5 -> G5)
  const duration = 1.10;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 523.25, start: 0.00, d: 0.60, a: 0.30 },
    { f: 659.25, start: 0.16, d: 0.70, a: 0.34 },
    { f: 783.99, start: 0.32, d: 0.85, a: 0.40 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.015) * Math.exp(-dt * (3.8 / note.d));
        const wave = Math.sin(2 * Math.PI * note.f * dt) + 0.18 * Math.sin(2 * Math.PI * (note.f * 2) * dt);
        val += wave * env * note.a;
      }
    }
    s[i] = val * 0.7;
  }
  return s;
}

// -----------------------------------------------------------------
// 3. DHOP KHEL (BAMBOO BATON MEMORY) AUDIO
// -----------------------------------------------------------------
function genDhopkhelBambooPickup() {
  const duration = 0.18;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 38);
    const pop = Math.sin(2 * Math.PI * 340 * t) * 0.4;
    const hollowAir = Math.sin(2 * Math.PI * 720 * t) * Math.exp(-t * 30) * 0.22;
    s[i] = (pop + hollowAir) * env * 0.65;
  }
  return s;
}

function genDhopkhelBambooPass() {
  const duration = 0.19;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(201);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const airWhoosh = noise() * env * 0.22;
    const cylinderTone = Math.sin(2 * Math.PI * 280 * t) * env * 0.18;
    s[i] = (airWhoosh + cylinderTone) * 0.6;
  }
  return s;
}

function genDhopkhelBambooCatch() {
  // Hand palm firmly gripping seasoned bamboo baton
  const duration = 0.20;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(202);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const envThump = Math.exp(-t * 40);
    const envBamboo = Math.exp(-t * 50);
    const palmImpact = Math.sin(2 * Math.PI * 140 * t) * envThump * 0.45;
    const bambooResonance = Math.sin(2 * Math.PI * 520 * t) * envBamboo * 0.28;
    const skinContact = noise() * Math.exp(-t * 60) * 0.18;
    s[i] = (palmImpact + bambooResonance + skinContact) * 0.72;
  }
  return s;
}

function genDhopkhelBambooTap() {
  const duration = 0.12;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 65);
    const tap = Math.sin(2 * Math.PI * 460 * t) * 0.42 + Math.sin(2 * Math.PI * 1150 * t) * 0.25;
    s[i] = tap * env * 0.65;
  }
  return s;
}

function genDhopkhelBambooClack() {
  const duration = 0.18;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 44);
    const f1 = Math.sin(2 * Math.PI * 540 * t) * 0.44;
    const f2 = Math.sin(2 * Math.PI * 1380 * t) * 0.3;
    const snap = Math.sin(2 * Math.PI * 3100 * t) * Math.exp(-t * 110) * 0.22;
    s[i] = (f1 + f2 + snap) * env * 0.72;
  }
  return s;
}

function genDhopkhelBambooDrop() {
  const duration = 0.26;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(203);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 34);
    const earthThud = Math.sin(2 * Math.PI * 95 * t) * 0.45;
    const bambooRing = Math.sin(2 * Math.PI * 480 * t) * Math.exp(-t * 45) * 0.25;
    const soilScuff = noise() * env * 0.2;
    s[i] = (earthThud + bambooRing + soilScuff) * env * 0.7;
  }
  return s;
}

function genDhopkhelCorrect() {
  // Warm Bamboo Xylophone / Flute Tonal Rise (D4 -> F#4 -> A4 -> D5)
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 293.66, start: 0.00, d: 0.50, a: 0.32 }, // D4
    { f: 369.99, start: 0.11, d: 0.55, a: 0.34 }, // F#4
    { f: 440.00, start: 0.22, d: 0.60, a: 0.38 }, // A4
    { f: 587.33, start: 0.33, d: 0.70, a: 0.42 }, // D5
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.015) * Math.exp(-dt * (3.8 / note.d));
        // Bamboo flute warmth: sine + soft 3rd harmonic
        const wave = Math.sin(2 * Math.PI * note.f * dt) + 0.15 * Math.sin(2 * Math.PI * (note.f * 3) * dt);
        val += wave * env * note.a;
      }
    }
    s[i] = val * 0.68;
  }
  return s;
}

function genDhopkhelWrong() {
  // Muted Bamboo Knock with Low Undertone (C#4 -> A3)
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 277.18, start: 0.00, d: 0.24, a: 0.34 },
    { f: 220.00, start: 0.15, d: 0.28, a: 0.32 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.02) * Math.exp(-dt * (5.2 / note.d));
        const knock = Math.sin(2 * Math.PI * note.f * dt) + 0.25 * Math.sin(2 * Math.PI * 160 * dt);
        val += knock * env * note.a;
      }
    }
    s[i] = val * 0.62;
  }
  return s;
}

function genDhopkhelRoundComplete() {
  // Pastoral Karbi / Assamese folk chime (D4 -> G4 -> A4 -> B4 -> D5)
  const duration = 1.25;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 293.66, start: 0.00, d: 0.55, a: 0.28 },
    { f: 392.00, start: 0.14, d: 0.60, a: 0.30 },
    { f: 440.00, start: 0.28, d: 0.65, a: 0.32 },
    { f: 493.88, start: 0.42, d: 0.70, a: 0.35 },
    { f: 587.33, start: 0.56, d: 0.85, a: 0.38 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.018) * Math.exp(-dt * (3.6 / note.d));
        const wave = Math.sin(2 * Math.PI * note.f * dt) + 0.18 * Math.sin(2 * Math.PI * (note.f * 2) * dt);
        val += wave * env * note.a;
      }
    }
    s[i] = val * 0.70;
  }
  return s;
}

// -----------------------------------------------------------------
// 4. MEMORY STORIES (EPISODIC RECALL) AUDIO
// -----------------------------------------------------------------
function genPageTurn() {
  const duration = 0.22;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(301);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const paperRustle = noise() * env * 0.22;
    const airFlap = Math.sin(2 * Math.PI * 180 * t) * env * 0.12;
    s[i] = (paperRustle + airFlap) * 0.55;
  }
  return s;
}

function genStoryStart() {
  // Calming acoustic bell opening (C5)
  const duration = 0.60;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.015) * Math.exp(-t * 4.5);
    const bell = Math.sin(2 * Math.PI * 523.25 * t) + 0.2 * Math.sin(2 * Math.PI * 1046.5 * t);
    s[i] = bell * env * 0.35;
  }
  return s;
}

function genStoryComplete() {
  // Serene reading finished melody (A4 -> C#5 -> E5)
  const duration = 0.90;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 440.00, start: 0.00, d: 0.50, a: 0.32 },
    { f: 554.37, start: 0.15, d: 0.55, a: 0.34 },
    { f: 659.25, start: 0.30, d: 0.65, a: 0.38 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.016) * Math.exp(-dt * (3.8 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.68;
  }
  return s;
}

function genGentleRecallCorrect() {
  // Reflective intimate harp/chime (D5 -> F#5)
  const duration = 0.75;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 587.33, start: 0.00, d: 0.45, a: 0.32 },
    { f: 739.99, start: 0.14, d: 0.55, a: 0.36 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.02) * Math.exp(-dt * (4.2 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.62;
  }
  return s;
}

function genGentleRecallWrong() {
  // Quiet thoughtful hesitation tone (G4 -> E4)
  const duration = 0.40;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 392.00, start: 0.00, d: 0.22, a: 0.30 },
    { f: 329.63, start: 0.14, d: 0.26, a: 0.28 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.025) * Math.exp(-dt * (5.5 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.58;
  }
  return s;
}

// -----------------------------------------------------------------
// 5. SUH TAH LAM (BAMBOO DANCE) AUDIO
// -----------------------------------------------------------------
function genSuhtahlamBambooClack() {
  // Resonant heavy bamboo pole strike on timber runners
  const duration = 0.18;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    const body = Math.sin(2 * Math.PI * 560 * t) * 0.45;
    const overtone = Math.sin(2 * Math.PI * 1420 * t) * 0.3;
    const snap = Math.sin(2 * Math.PI * 3300 * t) * Math.exp(-t * 115) * 0.22;
    s[i] = (body + overtone + snap) * env * 0.74;
  }
  return s;
}

function genSuhtahlamBambooOpen() {
  const duration = 0.20;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(401);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * (t / duration));
    const friction = noise() * env * 0.25;
    const chamber = Math.sin(2 * Math.PI * 350 * t) * env * 0.18;
    s[i] = (friction + chamber) * 0.62;
  }
  return s;
}

function genSuhtahlamMovementStep() {
  // Barefoot dancer rhythm step on bamboo floor
  const duration = 0.16;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const noise = pseudoNoise(402);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    const thump = Math.sin(2 * Math.PI * 160 * t) * 0.38;
    const floorCreak = noise() * env * 0.18;
    s[i] = (thump + floorCreak) * env * 0.55;
  }
  return s;
}

function genSuhtahlamActionComplete() {
  // Mizo Khuang hide drum affirmation
  const duration = 0.70;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 6.5);
    const drum = Math.sin(2 * Math.PI * (110 - t * 40) * t);
    s[i] = drum * env * 0.45;
  }
  return s;
}

function genSuhtahlamCorrect() {
  // Brass Darbu celebration cascade (D4 -> F4 -> A4 -> D5)
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 293.66, start: 0.00, d: 0.48, a: 0.30 },
    { f: 349.23, start: 0.12, d: 0.52, a: 0.32 },
    { f: 440.00, start: 0.24, d: 0.58, a: 0.36 },
    { f: 587.33, start: 0.36, d: 0.68, a: 0.40 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.015) * Math.exp(-dt * (4.0 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.68;
  }
  return s;
}

function genSuhtahlamWrong() {
  // Soothing two-note Mizo flute resolution (F4 -> D4)
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const s = new Float32Array(n);
  const notes = [
    { f: 349.23, start: 0.00, d: 0.24, a: 0.32 },
    { f: 293.66, start: 0.15, d: 0.28, a: 0.30 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const note of notes) {
      if (t >= note.start) {
        const dt = t - note.start;
        const env = Math.min(1, dt / 0.02) * Math.exp(-dt * (5.2 / note.d));
        val += Math.sin(2 * Math.PI * note.f * dt) * env * note.a;
      }
    }
    s[i] = val * 0.60;
  }
  return s;
}

// -----------------------------------------------------------------
// OUTPUT GENERATION MATRIX
// -----------------------------------------------------------------
const BASE_AUDIO_DIR = path.resolve(__dirname, '../assets/audio');

const ALL_GAME_SOUNDS = [
  // common
  { dir: 'common', name: 'gentle_button_press.wav', fn: genGentleButtonPress },
  { dir: 'common', name: 'app_navigation.wav', fn: genAppNavigation },
  { dir: 'common', name: 'soft_notification.wav', fn: genSoftNotification },

  // ubilakapi
  { dir: 'ubilakapi', name: 'coconut_pickup.wav', fn: genCoconutPickup },
  { dir: 'ubilakapi', name: 'coconut_pass.wav', fn: genCoconutPass },
  { dir: 'ubilakapi', name: 'coconut_catch.wav', fn: genCoconutCatch },
  { dir: 'ubilakapi', name: 'coconut_drop.wav', fn: genCoconutDrop },
  { dir: 'ubilakapi', name: 'ubilakapi_correct.wav', fn: genUbilakapiCorrect },
  { dir: 'ubilakapi', name: 'ubilakapi_wrong.wav', fn: genUbilakapiWrong },
  { dir: 'ubilakapi', name: 'ubilakapi_round_complete.wav', fn: genUbilakapiRoundComplete },

  // dhopKhel
  { dir: 'dhopKhel', name: 'bamboo_pickup.wav', fn: genDhopkhelBambooPickup },
  { dir: 'dhopKhel', name: 'bamboo_pass.wav', fn: genDhopkhelBambooPass },
  { dir: 'dhopKhel', name: 'bamboo_catch.wav', fn: genDhopkhelBambooCatch },
  { dir: 'dhopKhel', name: 'bamboo_tap.wav', fn: genDhopkhelBambooTap },
  { dir: 'dhopKhel', name: 'bamboo_clack.wav', fn: genDhopkhelBambooClack },
  { dir: 'dhopKhel', name: 'bamboo_drop.wav', fn: genDhopkhelBambooDrop },
  { dir: 'dhopKhel', name: 'dhopkhel_correct.wav', fn: genDhopkhelCorrect },
  { dir: 'dhopKhel', name: 'dhopkhel_wrong.wav', fn: genDhopkhelWrong },
  { dir: 'dhopKhel', name: 'dhopkhel_round_complete.wav', fn: genDhopkhelRoundComplete },

  // memoryStories
  { dir: 'memoryStories', name: 'page_turn.wav', fn: genPageTurn },
  { dir: 'memoryStories', name: 'story_start.wav', fn: genStoryStart },
  { dir: 'memoryStories', name: 'story_complete.wav', fn: genStoryComplete },
  { dir: 'memoryStories', name: 'recall_correct.wav', fn: genGentleRecallCorrect },
  { dir: 'memoryStories', name: 'recall_wrong.wav', fn: genGentleRecallWrong },

  // suhTahLam
  { dir: 'suhTahLam', name: 'bamboo_clack.wav', fn: genSuhtahlamBambooClack },
  { dir: 'suhTahLam', name: 'bamboo_open.wav', fn: genSuhtahlamBambooOpen },
  { dir: 'suhTahLam', name: 'movement_step.wav', fn: genSuhtahlamMovementStep },
  { dir: 'suhTahLam', name: 'action_complete.wav', fn: genSuhtahlamActionComplete },
  { dir: 'suhTahLam', name: 'suhtahlam_correct.wav', fn: genSuhtahlamCorrect },
  { dir: 'suhTahLam', name: 'suhtahlam_wrong.wav', fn: genSuhtahlamWrong },
];

console.log('Synthesizing game-specific acoustic profiles into assets/audio/...');

for (const item of ALL_GAME_SOUNDS) {
  const targetDir = path.join(BASE_AUDIO_DIR, item.dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, item.name);
  const samples = item.fn();
  const buffer = createWavBuffer(samples);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ [${item.dir}] ${item.name} (${buffer.length} bytes, ${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

console.log('All game-specific sound profiles synthesized successfully!');

