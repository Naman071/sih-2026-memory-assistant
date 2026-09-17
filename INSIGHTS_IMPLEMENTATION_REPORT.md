# SIH 2026 Memory Assistant — Insights Rebuild Implementation Report

**Project**: Memory Assistant (SIH 2026)  
**Target Subsystem**: Insights & Cognitive Vitality Index (CVI) Engine  
**Objective**: Complete audit, repair, and reconstruction of all insights analytics to guarantee **100% genuine, verifiable gameplay data**, eliminate all mock/fallback values, establish tenant isolation, and ensure high-stability cross-device execution.

---

## 1. Executive Summary

Prior to this rebuild, performance insights contained hardcoded fallback values (e.g. `hasSessions ? 75 : null`), simulated scores in database adapters (`accuracyCalc = 70`, `duration || 45`), randomized session identifiers (`Math.random()`), and potential cross-tenant leakage.

The insights subsystem has been systematically audited and rebuilt:
1. **Zero Fake or Fallback Data**: Removed all random number generation (`Math.random`), hardcoded defaults (`75, 80, 70, 85, 72`), and fabricated session placeholders. Unplayed domains strictly render as `null` with `"Awaiting data"`.
2. **Deterministic Session Generation**: Replaced random UUID generators with atomic, deterministic session keys (`sess_${Date.now()}_${counter}_${patientId}_${gameId}`).
3. **Strict Session Validation**: Every incoming gameplay record is rigorously validated for:
   - Valid, non-empty `patientId` and `gameId`.
   - Non-negative duration (`durationSec >= 0`).
   - Valid accuracy bounded within `[0, 100]`.
   - Logical consistency (`questionsCorrect <= questionsTotal`).
4. **Tenant Isolation**: Local `AsyncStorage` sessions are strictly namespaced per patient ID (`@cognitive_analytics_sessions_${cleanPatientId}`). Cross-patient wildcard filter bypasses have been eradicated.
5. **Authentic Empty States**: Patients who have not played any games receive zero fabricated metrics (Vitality Index is `null`, exercise minutes is `0`, accuracy is `null`, domain scores are `null`), rendering the prompt's exact copy:
   > *"No gameplay data available yet. Complete a game to start seeing real performance insights."*
6. **Verified CVI Calibration Threshold**: Cognitive Vitality Index composite score remains locked until $\ge 3$ verified, completed rounds exist.
7. **End-to-End Activity History**: Real gameplay sessions are rendered with full metadata: game name, formatted date and time (`"17 September 2026 at 4:18 PM"`), status badge (`Completed`/`Aborted`), accuracy percentage, formatted duration (`"4 min 18 sec"`), difficulty level, and verified score.
8. **Deduplication Across Synced Layers**: Solved double-counting issues between local and remote Supabase sessions by correlating timestamps within a 3-second window and game IDs, and deduplicated internal game engines (`PerformanceTracker.js` vs `SuhTahLamGame.js`).

---

## 2. Files Modified & Technical Changes

| Component / File | Changes Made |
| :--- | :--- |
| `src/modules/performance/CognitiveAnalyticsService.js` | • Replaced `Math.random` with deterministic session generator.<br>• Added parameter validation in `recordGameSession`.<br>• Namespaced storage key by `patientId`.<br>• Added `_buildEmptyDashboard()` with authentic empty state and zero fabricated values.<br>• Fixed session merge deduplication across local and remote Supabase records.<br>• Added `domain = null` default to enable automatic game domain resolution. |
| `src/modules/database.js` | • Removed hardcoded fallbacks (`accuracyCalc = 70`, `duration || 45`, `questionsTotal: 10`).<br>• Correlates actual attempts from `game_performance` or defaults to `null` if unrecorded. |
| `src/modules/gameData.js` | • Completely removed `getMockGameResult()` with `Math.random()`. |
| `src/noklai/screens/caregiver/InsightsScreen.js` | • Removed hardcoded domain fallbacks (`hasSessions ? 75 : null`).<br>• Changed fallback bar width from `50%` to `0%` when score is `null`.<br>• Added exact empty state copy: *"No gameplay data available yet. Complete a game to start seeing real performance insights."*<br>• Removed fallback `10 pts` on recent session badge. |
| `src/noklai/context/NoklaiContext.js` | • Enhanced `realRecentActivity` to extract formatted date (`"17 September 2026"`), formatted time, completion status, accuracy, formatted duration (`"X min Y sec"`), and difficulty. |
| `src/noklai/screens/caregiver/ActivityHistoryScreen.js` | • Rendered complete card details with status badges, accuracy, duration, difficulty, and verified score. |
| `src/screens/GamesScreen.js` | • Imported `usePatient` and passed authenticated `patientId={patientId}` to all 5 cognitive games (`SuhTahLamGame`, `UbilakapkiGame`, `NortheastMemoryGame`, `DhopkhelGame`, `MemoryStoriesGame`). |
| `src/modules/performance/PerformanceTracker.js` | • Added friendly `gameName` mapping to avoid defaulting to raw ID strings. |
| `src/games/suhTahLam/SuhTahLamGame.js` | • Removed redundant `cognitiveAnalytics.recordGameSession` call to prevent duplicate round entries (already persisted by `PerformanceTracker.completeRound()`). |
| `sih-2026-memory-assistant/src/...` | • Completely synchronized and mirrored all 9 modified files to the nested workspace. |

---

## 3. Mathematical Model & CVI Calculation

The Cognitive Vitality Index (CVI) operates under a transparent, non-clinical mathematical model:

$$\text{CVI} = 0.70 \times \text{Accuracy} + 0.30 \times \text{Completion Consistency}$$

- **Accuracy**: $\frac{\sum \text{Correct Attempts}}{\sum \text{Total Attempts}}$ across verified completed rounds.
- **Completion Consistency**: $\frac{\text{Completed Valid Rounds}}{\text{Started Eligible Rounds}}$.
- **Calibration Requirement**: $\ge 3$ valid rounds required. If fewer than 3 rounds have been played, the index status is `'insufficient_data'`, `vitalityIndex` is `null`, and the UI renders the progress towards baseline (e.g. `1/3 rounds`).
- **Clinical Disclaimer**: Every dashboard payload and generated summary explicitly displays:
  > *"Cognitive Vitality Index is a gameplay progress indicator based on completed cognitive game activity. It is not a medical diagnosis or clinical assessment."*

