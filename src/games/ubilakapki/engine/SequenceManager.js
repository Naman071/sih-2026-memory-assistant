/**
 * UBILAKAPKI - Sequence Manager
 * Controls non-repetitive sequence cycling for patients.
 */

import { generatePassingSequence } from '../data/sequences.js';

export class SequenceManager {
  constructor(maxHistory = 10) {
    this.usedFingerprints = [];
    this.maxHistory = maxHistory;
  }

  getNextSequence(difficulty = 'easy') {
    const sequence = generatePassingSequence(difficulty, this.usedFingerprints);
    if (sequence && sequence.fingerprint) {
      this.usedFingerprints.push(sequence.fingerprint);
      if (this.usedFingerprints.length > this.maxHistory) {
        this.usedFingerprints.shift();
      }
    }
    return sequence;
  }

  reset() {
    this.usedFingerprints = [];
  }
}

