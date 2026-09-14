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
 * Starts with null / zero-baseline for new players (no fake 1.0 defaults).
 * Maintains strict separation between round completions and individual answer attempts.
 */

const VALID_DOMAINS = ['visual', 'sequence', 'spatial', 'change', 'movement'];

export class CognitiveProfile {
  constructor(initialData = {}) {
    this.playerId = initialData.playerId || null;
    this.totalRounds = typeof initialData.totalRounds === 'number' ? initialData.totalRounds : 0;
    this.totalAttempts = typeof initialData.totalAttempts === 'number' ? initialData.totalAttempts : 0;
    this.totalCorrectAttempts =
      typeof initialData.totalCorrectAttempts === 'number' ? initialData.totalCorrectAttempts : 0;

    this.visualRecallScore =
      Number.isFinite(initialData.visualRecallScore) ? initialData.visualRecallScore : null;
    this.sequenceRecallScore =
      Number.isFinite(initialData.sequenceRecallScore) ? initialData.sequenceRecallScore : null;
    this.spatialRecallScore =
      Number.isFinite(initialData.spatialRecallScore) ? initialData.spatialRecallScore : null;
    this.changeDetectionScore =
      Number.isFinite(initialData.changeDetectionScore) ? initialData.changeDetectionScore : null;
    this.movementRecallScore =
      Number.isFinite(initialData.movementRecallScore) ? initialData.movementRecallScore : null;

    this.overallAccuracy =
      Number.isFinite(initialData.overallAccuracy) ? initialData.overallAccuracy : null;

    this.sampleCount =
      typeof initialData.sampleCount === 'number' ? initialData.sampleCount : this.totalRounds;
    this.hasEnoughData = Boolean(initialData.hasEnoughData ?? (this.sampleCount >= 3));
    this.updatedAt = initialData.updatedAt || null;

    // Validate and clean initial domain history
    const rawHistory = initialData.domainHistory || {};
    this.domainHistory = {
      visual: Array.isArray(rawHistory.visual) ? [...rawHistory.visual] : [],
      sequence: Array.isArray(rawHistory.sequence) ? [...rawHistory.sequence] : [],
      spatial: Array.isArray(rawHistory.spatial) ? [...rawHistory.spatial] : [],
      change: Array.isArray(rawHistory.change) ? [...rawHistory.change] : [],
      movement: Array.isArray(rawHistory.movement) ? [...rawHistory.movement] : [],
    };
  }

  /**
   * Updates a specific cognitive domain based on an authentic answer attempt.
   * NOTE: This increments attempts and accuracy, but NOT completed totalRounds.
   */
  updateDomain(domain, isCorrect) {
    if (!VALID_DOMAINS.includes(domain)) {
      domain = 'visual';
    }

    const numericValue = isCorrect ? 1.0 : 0.0;
    this.totalAttempts += 1;
    if (isCorrect) {
      this.totalCorrectAttempts += 1;
    }

    const history = this.domainHistory[domain] || [];
    history.push(numericValue);
    if (history.length > 20) history.shift();
    this.domainHistory[domain] = history;

    // Rolling average of last 10 entries in this domain
    const recent = history.slice(-10);
    const avg = recent.length > 0
      ? recent.reduce((sum, v) => sum + v, 0) / recent.length
      : null;

    const roundedAvg = avg !== null ? Math.round(avg * 100) / 100 : null;

    switch (domain) {
      case 'visual':
        this.visualRecallScore = roundedAvg;
        break;
      case 'sequence':
        this.sequenceRecallScore = roundedAvg;
        break;
      case 'spatial':
        this.spatialRecallScore = roundedAvg;
        break;
      case 'change':
        this.changeDetectionScore = roundedAvg;
        break;
      case 'movement':
        this.movementRecallScore = roundedAvg;
        break;
    }

    // Update overall accuracy across real attempts
    if (this.totalAttempts > 0) {
      this.overallAccuracy =
        Math.round((this.totalCorrectAttempts / this.totalAttempts) * 100) / 100;
    } else {
      this.overallAccuracy = null;
    }

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Records a successfully completed valid round
   */
  recordCompletedRound() {
    this.totalRounds += 1;
    this.sampleCount = this.totalRounds;
    this.hasEnoughData = this.sampleCount >= 3;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      playerId: this.playerId,
      visualRecallScore: this.visualRecallScore,
      sequenceRecallScore: this.sequenceRecallScore,
      spatialRecallScore: this.spatialRecallScore,
      changeDetectionScore: this.changeDetectionScore,
      movementRecallScore: this.movementRecallScore,
      overallAccuracy: this.overallAccuracy,
      totalRounds: this.totalRounds,
      totalAttempts: this.totalAttempts,
      totalCorrectAttempts: this.totalCorrectAttempts,
      sampleCount: this.sampleCount,
      hasEnoughData: this.hasEnoughData,
      domainScores: {
        visual: this.visualRecallScore,
        sequence: this.sequenceRecallScore,
        spatial: this.spatialRecallScore,
        change: this.changeDetectionScore,
        movement: this.movementRecallScore,
      },
      domainHistory: this.domainHistory,
      updatedAt: this.updatedAt,
    };
  }
}
