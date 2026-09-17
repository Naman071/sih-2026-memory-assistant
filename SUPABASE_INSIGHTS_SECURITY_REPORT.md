# SIH 2026 MEMORY ASSISTANT — SUPABASE INSIGHTS SECURITY & PRIVACY REPORT
**Document Version:** 1.0  
**Date:** September 18, 2026  

---

## 1. Security Scope

This report evaluates tenant isolation, access boundaries, Row Level Security (RLS), and patient privacy across the SIH 2026 Memory Assistant database integration.

---

## 2. Table Inventory & Access Analysis

| Table Name | Live Status | Row Level Security (RLS) | Access Model | Identified Risks | Resolution |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `patients` | ACTIVE | Enabled | Filtered by `patient_id` or `caregiver_phone` | Client code was accepting any ID | Enforce verified ID lookup |
| `game_results` | ACTIVE | Enabled | Queried by `.eq('patient_id', patientId)` | Client query filter bypass `P001` vs `P_` | Strip cross-tenant wildcard filter |
| `game_performance` | ACTIVE | Enabled | Queried by `.eq('patient_id', patientId)` | Same | Strip cross-tenant wildcard filter |
| `reminders` | ACTIVE | Enabled | Queried by `.eq('patient_id', patientId)` | None | Scoped to active patient |
| `family_members` | ACTIVE | Enabled | Queried by `.eq('patient_id', patientId)` | None | Scoped to active patient |

---

## 3. Client-Side Data Leakage Audits & Remediations

### 3.1 Patient ID Wildcard Matching Vulnerability
**Location:** `CognitiveAnalyticsService.js`  
**Problem:** Code previously included:
```javascript
if (pid === 'P001' && (s.patientId === 'guest_player' || s.patientId?.startsWith('P_'))) return true;
if (s.patientId === 'P001' && pid?.startsWith('P_')) return true;
```
**Fix:** Removed entirely. Filtering is now strictly exact:
```javascript
if (s.patientId !== targetPatientId) return false;
```

### 3.2 Shared LocalStorage Cache Isolation
**Location:** `CognitiveAnalyticsService.js`  
**Problem:** Local session cache previously used a single un-namespaced key `@cognitive_analytics_sessions_v1`.  
**Fix:** Partitioned by patient ID:
```javascript
const storageKey = `@cognitive_analytics_sessions_${cleanPatientId}`;
```
Switching patients or logging in on a shared device immediately isolates local history.

### 3.3 Caregiver Authorization Boundary
- Caregivers view patient analytics only when linked in the `patients` table by `caregiver_phone` or when linked explicitly via the Patient Connection Code (e.g. `P_...`).
- When a caregiver switches patients in the UI, `activePatientId` updates, and all analytics caches are cleared and reloaded strictly for that patient.

