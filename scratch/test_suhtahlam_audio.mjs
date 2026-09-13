/**
 * Unit & Integration Test for SuhTahLamAudioEngine
 * Simulates Web Audio API environment and verifies acoustic synthesis lifecycle.
 */

import assert from 'assert';

// 1. Create a lightweight Web Audio API mock environment
class MockAudioNode {
  constructor() {
    this.connections = [];
  }
  connect(dest) {
    this.connections.push(dest);
    return dest;
  }
  disconnect() {
    this.connections = [];
  }
}

class MockAudioParam {
  constructor(initialVal = 1) {
    this.value = initialVal;
    this.timeline = [];
  }
  setValueAtTime(val, time) {
    this.value = val;
    this.timeline.push({ method: 'setValueAtTime', val, time });
  }
  exponentialRampToValueAtTime(val, time) {
    this.timeline.push({ method: 'exponentialRampToValueAtTime', val, time });
  }
  linearRampToValueAtTime(val, time) {
    this.timeline.push({ method: 'linearRampToValueAtTime', val, time });
  }
  cancelScheduledValues(time) {
    this.timeline.push({ method: 'cancelScheduledValues', time });
  }
}

class MockGainNode extends MockAudioNode {
  constructor() {
    super();
    this.gain = new MockAudioParam(1);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.started = false;
    this.stopped = false;
  }
  start(time) {
    this.started = true;
  }
  stop(time) {
    this.stopped = true;
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 1.0;
    this.destination = new MockAudioNode();
  }
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  async suspend() {
    this.state = 'suspended';
  }
  async resume() {
    this.state = 'running';
  }
  async close() {
    this.state = 'closed';
  }
}

// Attach mock AudioContext to global window
globalThis.window = {
  AudioContext: MockAudioContext,
};

// Import SuhTahLamAudioEngine
const { SuhTahLamAudioEngine } = await import('../src/games/suhTahLam/audio/SuhTahLamAudioEngine.js');

console.log('--- TESTING SUH TAH LAM AUDIO ENGINE ---');

// Test 1: Instantiation
const engine = new SuhTahLamAudioEngine();
assert(engine, 'Engine should instantiate');
assert.strictEqual(engine.isMuted, false, 'Engine should not be muted by default');
console.log('✓ Test 1: Audio Engine initialized successfully');

// Test 2: Bamboo Clack (Raw-chhe)
engine.playBambooClack();
assert(engine.audioCtx, 'AudioContext should be initialized after bamboo clack');
console.log('✓ Test 2: Hollow Bamboo Clack (Raw-chhe) triggered');

// Test 3: Khuang Indigenous Drum Pulse
engine.playKhuangPulse();
console.log('✓ Test 3: Khuang drum heartbeat pulse triggered');

// Test 4: Traditional Bamboo Flute Melody
engine.startFluteMelody();
assert.strictEqual(engine.isMelodyPlaying, true, 'Melody should be marked as playing');
assert(engine.melodyTimer !== null, 'Melody timer should be scheduled');
engine.stopFluteMelody();
assert.strictEqual(engine.isMelodyPlaying, false, 'Melody should stop cleanly');
assert.strictEqual(engine.melodyTimer, null, 'Melody timer should be cleared');
console.log('✓ Test 4: Flute melody start and stop passed');

// Test 5: Ambient Mountain Valley Drone
engine.startAmbientDrone();
assert(engine.ambientOscillators.length > 0, 'Ambient drone oscillators should be active');
engine.stopAmbientDrone();
assert.strictEqual(engine.ambientOscillators.length, 0, 'Ambient drone oscillators should be cleared');
console.log('✓ Test 5: Ambient mountain valley drone start and stop passed');

// Test 6: Celebration Chime (Darbu)
engine.playCelebrationChime();
console.log('✓ Test 6: Celebration chime played without errors');

// Test 7: Gentle Encouragement Cadence
engine.playGentleEncouragement();
console.log('✓ Test 7: Gentle encouragement cadence played without errors');

// Test 8: Volume & Mute Controls
engine.setVolume(0.7);
assert.strictEqual(engine.masterVolume, 0.7, 'Volume should be updated to 0.7');

engine.setMuted(true);
assert.strictEqual(engine.isMuted, true, 'isMuted should be true');

// When muted, play methods should gracefully exit early
engine.playBambooClack();
engine.playCelebrationChime();

engine.setMuted(false);
assert.strictEqual(engine.isMuted, false, 'isMuted should be restored to false');
console.log('✓ Test 8: Volume and mute controls passed');

// Test 9: Pause & Resume Lifecycle
engine.startFluteMelody();
engine.pause();
assert.strictEqual(engine.isMelodyPlaying, false, 'Pause should stop melody');
assert.strictEqual(engine.audioCtx.state, 'suspended', 'AudioContext should be suspended on pause');

engine.resume();
assert.strictEqual(engine.audioCtx.state, 'running', 'AudioContext should resume running');
console.log('✓ Test 9: Pause & Resume lifecycle passed');

// Test 10: Clean Disposal
engine.stopAll();
assert.strictEqual(engine.audioCtx, null, 'AudioContext should be closed and nulled on stopAll');
assert.strictEqual(engine.masterGain, null, 'Master gain should be null on stopAll');
console.log('✓ Test 10: Clean stopAll disposal passed');

console.log('\n🎉 ALL SUH TAH LAM AUDIO TESTS PASSED PERFECTLY!\n');

