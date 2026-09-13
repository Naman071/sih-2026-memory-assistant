/**
 * SUH TAH LAM - Multi-Dimensional Cognitive Profile
 *
 * Tracks distinct cognitive domains separately:
 * - Visual Memory (visualRecallScore)
 * - Sequential Memory (sequenceRecallScore)
 * - Spatial Working Memory (spatialRecallScore)
 * - Change Detection (changeDetectionScore)
 * - Movement/Action Recall (movementRecallScore)
 * - Overall Accuracy (overallAccuracy)
 *
 * NOTE: These analytics are strictly internal and hidden from the patient
 * to preserve a calm, positive, non-judgmental experience.
 */

export class CognitiveProfile {
  constructor(initialData = {}) {
    this.visualRecallScore = initialData.visualRecallScore ?? 1.0;
    this.sequenceRecallScore = initialData.sequenceRecallScore ?? 1.0;
    this.spatialRecallScore = initialData.spatialRecallScore ?? 1.0;
    this.changeDetectionScore = initialData.changeDetectionScore ?? 1.0;
    this.movementRecallScore = initialData.movementRecallScore ?? 1.0;
    this.overallAccuracy = initialData.overallAccuracy ?? 1.0;
    this.totalRounds = initialData.totalRounds ?? 0;
    this.domainHistory = initialData.domainHistory || {
      visual: [],
      sequence: [],
      spatial: [],
      change: [],
      movement: [],
    };
  }

  /**
   * Updates a specific cognitive domain score with exponential moving average
   */
  updateDomain(domain, isCorrect) {
    const value = isCorrect ? 1.0 : 0.0;
    const history = this.domainHistory[domain] || [];
    history.push(value);
    if (history.length > 20) history.shift();
    this.domainHistory[domain] = history;

    // Rolling average of last 10 entries in this domain
    const recent = history.slice(-10);
    const avg = recent.reduce((sum, v) => sum + v, 0) / recent.length;

    switch (domain) {
      case 'visual':
        this.visualRecallScore = Math.round(avg * 100) / 100;
        break;
      case 'sequence':
        this.sequenceRecallScore = Math.round(avg * 100) / 100;
        break;
      case 'spatial':
        this.spatialRecallScore = Math.round(avg * 100) / 100;
        break;
      case 'change':
        this.changeDetectionScore = Math.round(avg * 100) / 100;
        break;
      case 'movement':
        this.movementRecallScore = Math.round(avg * 100) / 100;
        break;
    }

    // Update overall accuracy across all recorded domain attempts
    const allAttempts = Object.values(this.domainHistory).flat();
    if (allAttempts.length > 0) {
      this.overallAccuracy =
        Math.round((allAttempts.reduce((s, v) => s + v, 0) / allAttempts.length) * 100) / 100;
    }
    this.totalRounds += 1;
  }

  toJSON() {
    return {
      visualRecallScore: this.visualRecallScore,
      sequenceRecallScore: this.sequenceRecallScore,
      spatialRecallScore: this.spatialRecallScore,
      changeDetectionScore: this.changeDetectionScore,
      movementRecallScore: this.movementRecallScore,
      overallAccuracy: this.overallAccuracy,
      totalRounds: this.totalRounds,
      domainHistory: this.domainHistory,
    };
  }
}

