# Patient–Caregiver Linking, Authentication & Data Sync Audit

## Executive Summary
This document details the audit of the patient–caregiver linking architecture, authentication flow, Supabase database integration, and CVI data propagation in the **SIH 2026 Memory Assistant** application.

---

## Confirmed Issues & Bug Catalog

### BUG-PC-01: Single-Form Combined Registration without Role Separation
- **File**: `src/noklai/screens/NoklaiLoginScreen.js`
- **Component**: `NoklaiLoginScreen`
- **Actual Behavior**: Registration forces entering caregiver details AND patient details simultaneously into a single device form. If a patient is on their own phone, they cannot register independently. If a caregiver is on their phone, they cannot log in independently.
- **Expected Behavior**: Independent Patient and Caregiver login/registration flows. A patient registers/logs in as a patient; a caregiver registers/logs in as a caregiver and links to the patient via a unique invite code or registered phone.
- **Root Cause**: The initial UI combined both roles into a single onboarding form.
- **Severity**: High
- **Proposed Fix**: Support separate Patient and Caregiver modes in `NoklaiLoginScreen.js` with phone normalization, allowing patient registration and caregiver login.
- **Test Required**: Verify Patient can register alone; verify Caregiver can log in alone.

---

### BUG-PC-02: Hardcoded / Fallback Patient ID `P001` in Contexts
- **File**: `src/context/PatientContext.js` & `src/noklai/context/NoklaiContext.js`
- **Component**: `PatientProvider`, `NoklaiProvider`
- **Actual Behavior**: The application defaulted to `'P001'` across all sessions. If a new patient registered, their data collided with the legacy `P001` test records.
- **Expected Behavior**: Every patient must have a unique, stable patient identifier (e.g. `P_17896...` or unique code) mapped to their Supabase profile.
- **Root Cause**: Hardcoded fallback string `'P001'` in initial state declarations.
- **Severity**: High
- **Proposed Fix**: Generate a persistent unique patient code upon registration, save to Supabase `patients` table, and use it consistently across game launches, sessions, and CVI.
- **Test Required**: Create a new patient and verify their assigned ID is unique and persistent across app reloads.

---

### BUG-PC-03: Caregiver Dashboard Reads Exclusively from Local AsyncStorage, Not Supabase
- **File**: `src/modules/performance/CognitiveAnalyticsService.js`
- **Function**: `getCaregiverDashboardData()` & `getAllSessions()`
- **Actual Behavior**: Caregiver dashboard queries only `@noklai_cognitive_sessions_v1` from local device `AsyncStorage`. When a patient plays a game on their device, their gameplay saves to Supabase, but a caregiver on a different device (or clean install) sees 0 games, `-- / 100` CVI, and empty charts.
- **Expected Behavior**: Caregiver dashboard must query Supabase `game_results` and `game_performance` for the linked `patient_id`, merging remote data with local cache to compute live CVI, accuracy, and domain breakdown.
- **Root Cause**: `CognitiveAnalyticsService.js` only had write logic (`_syncToSupabase`) and zero read logic from Supabase.
- **Severity**: Critical
- **Proposed Fix**: Implement `syncRemoteSessions(patientId)` in `CognitiveAnalyticsService.js` to fetch `game_results` and `game_performance` from Supabase and integrate them into CVI analytics.
- **Test Required**: Play a game as patient; verify session records in Supabase; open caregiver dashboard on a simulated separate session and verify authentic gameplay appears.

---

### BUG-PC-04: `LinkedPatientsScreen` Creates In-Memory Mock Patient Without Supabase Link
- **File**: `src/noklai/screens/caregiver/LinkedPatientsScreen.js` & `src/noklai/context/NoklaiContext.js`
- **Component**: `addPatient`
- **Actual Behavior**: Tapping "+ Add Another Person" creates a transient local state `P_${Date.now()}` with no record in Supabase and no linking code.
- **Expected Behavior**: Allows entering a Patient Invite Code / ID to link an existing patient from Supabase, or registers a new patient in Supabase linked to the caregiver's phone.
- **Root Cause**: `addPatient` only pushed to local React state array `patients`.
- **Severity**: High
- **Proposed Fix**: Add an "Enter Patient Invite Code" linking modal that queries Supabase for the patient and establishes the link in the database.
- **Test Required**: Enter valid patient ID in linking modal; verify patient appears in caregiver list and loads their real data.

---

### BUG-PC-05: Missing Patient Invite / Linking Code Display for Elders
- **File**: `src/noklai/screens/patient/PatientHomeScreen.js`
- **Component**: `PatientHomeScreen`
- **Actual Behavior**: Patient has no way to view or share their unique patient code / invite code with their family caregiver.
- **Expected Behavior**: Patient Home displays a clear, friendly "Caregiver Connection Code" card with tap-to-copy / share.
- **Root Cause**: No invite code UI component was built.
- **Severity**: Medium
- **Proposed Fix**: Render a prominent "Your Caregiver Connection Code" card on the Patient Home Screen with a share button.
- **Test Required**: Verify invite code displays on Patient Home and can be copied/shared.

---

### BUG-PC-06: `game_performance` Schema Mismatch on Background Sync
- **File**: `src/modules/performance/CognitiveAnalyticsService.js`
- **Function**: `_syncToSupabase`
- **Actual Behavior**: Tries to insert `accuracy` column into `game_performance` which fails because the column does not exist in the Supabase table.
- **Expected Behavior**: Only inserts verified columns (`patient_id`, `game_name`, `response_time`, `difficulty`, `is_correct`).
- **Root Cause**: Mismatch between JS object properties and Supabase table schema.
- **Severity**: High
- **Proposed Fix**: Clean `game_performance` insert payload to only supply valid database columns.
- **Test Required**: Verify `game_performance` inserts successfully without schema cache errors.

---

### BUG-PC-07: `game_results` Null Constraint Violation on Missing Difficulty
- **File**: `src/modules/database.js` & `src/modules/performance/SupabasePerformanceService.js`
- **Function**: `saveGameResult`
- **Actual Behavior**: If `difficulty` is undefined, Postgres rejects the insert with `null value in column "difficulty" violates not-null constraint`.
- **Expected Behavior**: Always ensures a valid capitalized difficulty (e.g. 'Easy', 'Medium', 'Hard') is provided.
- **Root Cause**: Missing default/fallback for difficulty in `saveGameResult`.
- **Severity**: Medium
- **Proposed Fix**: Add default `difficulty: 'Medium'` fallback before insert.
- **Test Required**: Call `saveGameResult` with missing difficulty; verify insert succeeds.

---

### BUG-PC-08: In-Memory / Local Storage Leak on Role Switch / Logout
- **File**: `src/noklai/context/NoklaiContext.js` & `src/noklai/screens/caregiver/CaregiverSettingsScreen.js`
- **Function**: `resetToLaunch` / `handleSignOut`
- **Actual Behavior**: When signing out, `resetToLaunch()` merely changes `currentStep` to `'launch'`, leaving active patient ID and session state in memory.
- **Expected Behavior**: Properly cleans up active session state and isolates user data on logout.
- **Root Cause**: `resetToLaunch` lacked full state reset.
- **Severity**: Medium
- **Proposed Fix**: Implement `signOut()` in `NoklaiContext.js` that clears user role, resets active patient, and returns cleanly to Launch screen.
- **Test Required**: Log in as Patient A, sign out, log in as Caregiver B, verify Patient A's active state is not leaked.

---

### BUG-PC-09: Caregiver Cannot Query Patients Linked by Phone or Code
- **File**: `src/modules/database.js` & `src/noklai/context/NoklaiContext.js`
- **Function**: `loadPatients`
- **Actual Behavior**: When caregiver logs in, the app does not query Supabase `patients` table where `caregiver_phone = caregiverPhone` or retrieve linked patients.
- **Expected Behavior**: Caregiver automatically loads all patients who listed their phone number as caregiver, plus any patients linked via invite code.
- **Root Cause**: Missing `getPatientsByCaregiverPhone` / `linkPatientByCode` API in `database.js`.
- **Severity**: High
- **Proposed Fix**: Implement `getPatientsByCaregiverPhone(phone)` and `linkPatientToCaregiver(patientId, caregiverPhone, caregiverName)` in `database.js`.
- **Test Required**: Register patient with caregiver phone; log in with caregiver phone; verify patient is automatically retrieved.

