# SIH 2026 MEMORY ASSISTANT — INSIGHTS & GAMEPLAY DATA AUDIT REPORT
**Target Repository:** `yasounix/sih-2026-memory-assistant`  
**Date:** September 18, 2026  
**Status:** COMPLETED AUDIT (PHASE 1)

---

## 1. Executive Summary

This comprehensive audit inspected every file related to game sessions, metrics tracking, Cognitive Vitality Index (CVI) calculations, Supabase queries, and dashboard representations across the SIH 2026 Memory Assistant application.

The audit revealed **critical vulnerabilities, artificial fallbacks, hardcoded defaults, data leakage between patients, and duplicate insertion points** that undermine data authenticity. While the underlying algorithmic foundations (`validateRoundResult`, `calculateCVI`, and mathematical formulas) are sound, the data pipelines and UI layers were found to be silently synthesizing scores, durations, and attempts when real data was absent.

---

## 2. Inventory of Analytics & Gameplay Files Audited

### Central Analytics & Performance Modules
- `src/modules/performance/CognitiveAnalyticsService.js`: Unified session aggregator, CVI evaluator, caregiver report generator.
- `src/modules/performance/CognitiveVitalityIndex.js`: CVI mathematical engine (70% accuracy + 30% consistency, minimum 3 valid rounds).
- `src/modules/performance/DifficultyEngine.js`: Adaptive difficulty promotion/demotion engine.
- `src/modules/performance/MetricsCalculator.js`: Mathematical formulas for accuracy, error rate, consistency, response efficiency.
- `src/modules/performance/PerformanceTracker.js`: Central facade for session lifecycle, round management, and dual-path persistence.
- `src/modules/performance/SessionManager.js`: In-memory session tracking.
- `src/modules/performance/SupabasePerformanceService.js`: Supabase sync and AsyncStorage cache engine.
- `src/modules/database.js`: Database queries for `game_results`, `game_performance`, `patients`, `reminders`, `family_members`.
- `src/modules/gameData.js`: Game metadata and legacy simulation mocks.

### Game Modules
- `src/games/DhopkhelGame.js`: Traditional Assamese ball toss (Attention & Focus).
- `src/games/ubilakapki/UbilakapkiGame.js`: Nicobarese coconut pass (Spatial Orientation & Tracking).
- `src/games/suhTahLam/SuhTahLamGame.js`: Mizo bamboo rhythm exercise (Visual & Sequence Memory).
- `src/games/NortheastMemoryGame.js`: Northeast place recognition / Sinaki Sthan (Episodic & Heritage Recall).
- `src/games/MemoryStoriesGame.js`: Traditional narrative memory / Xuworoni Kotha (Cultural Memory & Story Recall).

### UI Screens & Context
- `src/noklai/screens/caregiver/InsightsScreen.js`: Patient and caregiver visual insights screen.
- `src/screens/CaregiverAnalyticsScreen.js`: Clinical-supportive caregiver analytics dashboard.
- `src/noklai/screens/caregiver/GamePerformanceScreen.js`: Game-by-game breakdown.
- `src/noklai/screens/caregiver/ActivityHistoryScreen.js`: Chronological gameplay history.
- `src/noklai/screens/caregiver/PatientProgressScreen.js`: Patient progress summary.
- `src/noklai/screens/patient/PatientGamesScreen.js`: Patient game selection & launcher.
- `src/noklai/screens/patient/PatientHomeScreen.js`: Patient home dashboard.
- `src/noklai/context/NoklaiContext.js`: Global Noklai state, session cache, reminders, and computed statistics.
- `src/context/PatientContext.js`: Global patient profile provider.

---

## 3. Findings: Fake, Demo, Hardcoded, and Fabricated Data

### 3.1 Hardcoded Domain Scores in `InsightsScreen.js`
In `src/noklai/screens/caregiver/InsightsScreen.js` (lines 64–68):
```javascript
{ key: 'visual_memory', label: 'Memory Recall', score: d.visual_memory?.score ?? (hasSessions ? 75 : null) },
{ key: 'attention_focus', label: 'Attention & Focus', score: d.attention_focus?.score ?? (hasSessions ? 80 : null) },
{ key: 'processing_speed', label: 'Reaction Speed', score: d.processing_speed?.score ?? (hasSessions ? 70 : null) },
{ key: 'episodic_recall', label: 'Cultural Stories', score: d.episodic_recall?.score ?? (hasSessions ? 85 : null) },
{ key: 'spatial_coordination', label: 'Spatial Awareness', score: d.spatial_coordination?.score ?? (hasSessions ? 72 : null) },
```
**Violation:** If a patient completes just *one* round of Dhopkhel, `hasSessions` becomes `true`. The UI was silently fabricating scores (`75%`, `80%`, `70%`, `85%`, `72%`) for domains the patient never touched!
Furthermore, on line 329, when `domain.score === null`, the progress bar defaulted to `50%` width instead of `0%`.

### 3.2 Fabrication of Accuracy, Durations, and Attempts in `database.js`
In `src/modules/database.js` (`getRemoteGameSessions`, lines 261–274):
```javascript
const scoreNum = typeof r.score === 'number' ? r.score : 10;
const accuracyCalc = scoreNum >= 10 ? 100 : scoreNum > 0 ? scoreNum * 10 : 70;

return {
  ...
  durationSec: r.duration || 45,
  questionsTotal: 10,
  questionsCorrect: Math.round(accuracyCalc / 10),
  accuracy: accuracyCalc,
  ...
};
```
**Violation:** If `game_results` contained records without explicit accuracy, this function invented:
- `45` seconds duration if missing.
- `10` questions total (fabricated attempts).
- `70%` accuracy if score was 0.
- Fabricated `questionsCorrect`.

### 3.3 Mock Data Generator in `gameData.js`
In `src/modules/gameData.js` (lines 28–34):
```javascript
export const getMockGameResult = () => {
  return {
    score: Math.floor(Math.random() * 100),
    duration: Math.floor(Math.random() * 60) + 10,
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
  };
};
```
**Status:** Function exists in codebase, unreferenced by production screens, but must be safely decommissioned or flagged.

---

## 4. Findings: Cross-Patient Data Leakage

### 4.1 Cross-Tenant Filter Bypass in `CognitiveAnalyticsService.js`
In `src/modules/performance/CognitiveAnalyticsService.js` (lines 249–254):
```javascript
if (pid) {
  filtered = filtered.filter((s) => {
    if (!s.patientId || s.patientId === pid) return true;
    if (pid === 'P001' && (s.patientId === 'guest_player' || s.patientId?.startsWith('P_'))) return true;
    if (s.patientId === 'P001' && pid?.startsWith('P_')) return true;
    return false;
  });
}
```
**Security Risk:** If a patient was assigned `P001`, any session from *any other patient* whose ID starts with `P_` was included in their analytics! Conversely, if a caregiver viewed patient `P_123`, any session marked `P001` was merged into `P_123`.

### 4.2 Shared LocalStorage Key Across Patients
In `src/modules/performance/CognitiveAnalyticsService.js` (line 30):
```javascript
const STORAGE_KEYS = {
  SESSIONS: '@cognitive_analytics_sessions_v1',
};
```
**Privacy Risk:** Local sessions are saved in one shared array `@cognitive_analytics_sessions_v1`. If Patient A plays on the device and Patient B logs in later, Patient B’s dashboard reads Patient A’s local sessions. The storage key must be strictly scoped: `@cognitive_analytics_sessions_${patientId}`.

---

## 5. Findings: Duplicate Insertion Points

1. **Dhopkhel & Ubilakapki:**
   - `PerformanceTracker.completeRound()` calls:
     - `this.performanceService.saveRoundResult(...)` &rarr; inserts into `game_results`.
     - `cognitiveAnalytics.recordGameSession(...)` &rarr; inserts into `game_results` *again* via `_syncToSupabase`.
   - **Result:** Two records are created in Supabase for every single completed round.
2. **Suh Tah Lam:**
   - `SuhTahLamGame.js` lines 262–271:
     - `trackerRef.current.completeRound()` calls `storage.saveRoundResult(...)`.
     - Then `SuhTahLamGame.js` immediately calls `cognitiveAnalytics.recordGameSession(...)`.
     - **Result:** Duplicate session logging across storage layers.

---

## 6. Findings: Supabase Schema State vs Missing Tables

Live Supabase database test (`https://gkaouygxlspirlsjorrm.supabase.co`):
- `game_sessions`: **NOT in schema cache** (Table does not exist)
- `game_rounds`: **NOT in schema cache** (Table does not exist)
- `game_events`: **NOT in schema cache** (Table does not exist)
- `performance_metrics`: **NOT in schema cache** (Table does not exist)
- `difficulty_profiles`: **NOT in schema cache** (Table does not exist)
- `game_results`: **EXISTS AND ACTIVE** (Columns: `id`, `patient_id`, `game_name`, `score`, `duration`, `difficulty`, `played_at`)
- `game_performance`: **EXISTS AND ACTIVE** (Columns: `id`, `patient_id`, `scene_id`, `question_id`, `selected_answer`, `correct_answer`, `is_correct`, `response_time`, `difficulty`, `game_name`, `created_at`)
- `patients`: **EXISTS AND ACTIVE**
- `reminders`: **EXISTS AND ACTIVE**
- `family_members`: **EXISTS AND ACTIVE**

**Implication:**
Because `game_sessions` and `game_rounds` tables were never created on the remote Supabase project, code attempting to insert to them fails silently. The application relies on `game_results` and `game_performance`. Our analytics system must:
1. Provide the complete SQL migration for the ideal schema in `INSIGHTS_SCHEMA_PLAN.md`.
2. Ensure the client operates seamlessly on existing verified tables (`game_results` + `game_performance`) without throwing unhandled exceptions or synthesizing missing metrics.

---

## 7. Game-by-Game Audit

| Game | Start Event | Session ID | Patient ID | Completion Status | Attempts Tracked | Accuracy Calculation | Duration Measurement | Duplicate Risk |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Suh Tah Lam** | Yes (`SessionManager`) | Generated | Prop & Context | Marks `completed` or `incomplete` | Real attempts only | `correct/total` | `Date.now() - start` | High (Dual record calls) |
| **Ubilakapki** | Yes (`SessionManager`) | Generated | Prop & Context | Marks `completed` | Real answer selections | `correct/total` | `Date.now() - start` | High (Dual `saveGameResult`) |
| **Dhopkhel** | Yes (`SessionManager`) | Generated | Prop & Context | Marks `completed` | Real answer selections | `correct/total` | `Date.now() - start` | High (Dual `saveGameResult`) |
| **Northeast Memory** | Yes | Generated | Prop & Context | Marks `completed` | Real scene questions | `correct/total` | `Date.now() - start` | Low |
| **Memory Stories** | Yes | Generated | Prop & Context | Marks `completed` | Real quiz questions | `correct/total` | `Date.now() - start` | Low |

---

## 8. Recommended Corrections

1. **Purge all hardcoded fallbacks** in `InsightsScreen.js` (no `75`, `80`, `70`, `85`, `72` defaults; domain score is `null` if unplayed).
2. **Eliminate metric fabrication in `database.js`** (never fabricate `45s`, `70%`, or `10 questions`).
3. **Strict tenant isolation:**
   - In `CognitiveAnalyticsService.js`, filter sessions strictly: `s.patientId === targetPatientId`.
   - Isolate local storage per patient: `@cognitive_analytics_sessions_${patientId}`.
4. **Unify session recording and eliminate duplicate Supabase inserts:**
   - Use idempotency keys (`session_id` + `round_number`).
5. **Enforce real CVI rules:**
   - Require minimum 3 valid rounds with real attempts.
   - Return clean empty states when uncalibrated.
6. **Detailed Activity History:**
   - Display actual game name, formatted date, time, status, score, accuracy, and duration (e.g. `4 min 18 sec`).
7. **Comprehensive Automated Test Suite:**
   - Test session creation, rejection of invalid data, absence of fallback fake numbers, CVI calibration thresholds, and strict patient isolation.

