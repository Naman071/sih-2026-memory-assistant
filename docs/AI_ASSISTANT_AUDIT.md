# SIH 2026 — MEMORY ASSISTANT
# NOKLAI AI ASSISTANT — TECHNICAL AUDIT & ARCHITECTURAL REPORT

**Repository**: `https://github.com/yasounix/sih-2026-memory-assistant`  
**Date**: September 18, 2026  
**Audit Scope**: Noklai AI Assistant, Gemini API Integration, Conversational Memory, Security & Context Engine  
**Author**: Engineering Team

---

## A. Existing Architecture

### 1. UI Components
- **Primary AI Screen**: [`src/noklai/screens/ai/NoklaiAIScreen.js`](file:///c:/Users/Nayan%20Solanki/Downloads/sih-2026-memory-assistant/src/noklai/screens/ai/NoklaiAIScreen.js)
  - Modal screen launched from `AIButton.js` on `PatientHomeScreen.js` and caregiver navigation.
  - Implements a modern chat layout: header with leaf logo, quick prompt chips, message bubbles (green for user, soft gray/dark for AI), text input with send button.
- **Legacy AI Screen**: [`src/screens/AIScreen.js`](file:///c:/Users/Nayan%20Solanki/Downloads/sih-2026-memory-assistant/src/screens/AIScreen.js)
  - An older standalone tab screen calling the same response generator.

### 2. AI Engine & Data Flow
- **Current AI Logic**: [`src/modules/aiData.js`](file:///c:/Users/Nayan%20Solanki/Downloads/sih-2026-memory-assistant/src/modules/aiData.js)
  - Exports synchronous function `getAIResponse(question, contextOrPatientId)`.
  - **Critical Finding**: This file consists entirely of hardcoded keyword pattern matching and regular expressions (e.g. `/^(hi|hello|hey|namaste)/.test(query)`).
  - It contains **zero API calls to Google Gemini or any LLM**.
  - It evaluates queries against static string rules for greetings, reminders, family, and CVI, falling back to a static generic string if no rule matches.

### 3. Backend & Gemini Integration
- **Supabase Edge Function**: [`supabase/functions/analyze-memory-photo/index.ts`](file:///c:/Users/Nayan%20Solanki/Downloads/sih-2026-memory-assistant/supabase/functions/analyze-memory-photo/index.ts)
  - This is the **only** file in the repository referencing Gemini (`gemini-2.0-flash`).
  - Its purpose is visual scene analysis of cultural photos for the North East Memory Game.
  - It reads `Deno.env.get("GEMINI_API_KEY")` from Supabase secrets.
  - **Crucial Finding**: There is **no Edge Function or backend endpoint for chat or conversational AI**. The chat assistant was completely disconnected from Gemini.

### 4. SDK & Dependency Status
- `package.json` does **not** have `@google/generative-ai` installed.
- The project runs on Expo SDK 57 / React Native 0.86.3 / React 19.
- No client-side Gemini service, fetch client, or streaming handler exists in `src/`.

### 5. Chat History & Memory
- Chat messages exist only in component local state (`useState` in `NoklaiAIScreen.js`).
- Neither current-turn multi-message history nor previous sessions are persisted.
- No Supabase tables exist for AI conversations (verified: `public.ai_conversations` and `public.ai_messages` do not exist).
- When the user closes the modal or restarts the app, all conversational context is erased.

---

## B. Confirmed Problems & Bug Catalog

### BUG-AI-01: AI Assistant Uses Hardcoded Heuristics with Zero Gemini API Integration
- **File**: `src/modules/aiData.js` & `src/noklai/screens/ai/NoklaiAIScreen.js`
- **Component**: `getAIResponse` / `handleSend`
- **Actual Behavior**: Queries are matched against static regexes in `aiData.js`. Unmatched queries receive static fallback templates. No HTTP request is dispatched to Google Gemini.
- **Expected Behavior**: User message must be sent to the official Google Gemini API (model `gemini-2.0-flash` / `gemini-1.5-flash`), returning an authentic, dynamically generated response.
- **Root Cause**: An initial mock engine was placed in `aiData.js` during early UI prototyping, and the actual Gemini client service was never implemented.
- **Severity**: Critical (Core feature broken)
- **Proposed Fix**: Create `src/services/GeminiService.js` implementing official REST requests to Google Generative Language API with multi-turn chat history, system prompt, and dynamic context. Connect `NoklaiAIScreen.js` and `aiData.js` to this service.
- **Verification Required**: Send arbitrary prompt (e.g. "What is the capital of Assam and why is it famous?"); verify dynamic, non-templated response from Gemini.

---

### BUG-AI-02: Complete Absence of Multi-Turn Conversation History (Zero Context Memory)
- **File**: `src/noklai/screens/ai/NoklaiAIScreen.js` & `src/modules/aiData.js`
- **Component**: `handleSend`
- **Actual Behavior**: Each message is evaluated in total isolation. If a user says "My name is Ramesh", followed by "What is my name?", the assistant cannot remember "Ramesh" because prior messages are never passed.
- **Expected Behavior**: The assistant must maintain conversation memory throughout the active session, formatting prior user and model turns into the Gemini API `contents` payload (`role: 'user'` and `role: 'model'`).
- **Root Cause**: The send handler only passed the latest raw string `query` without conversation history.
- **Severity**: Critical (Fails conversational AI standard)
- **Proposed Fix**: Accumulate message history in conversational state with proper Gemini role mapping (`user` -> `user`, `ai` -> `model`), passing the full session history array to `GeminiService.js`.
- **Verification Required**: Test 2-turn dialogue: "My grandson's name is Aarav" -> "Who did I just mention?"; verify Gemini correctly answers "Aarav".

---

### BUG-AI-03: No Chat History Persistence Across App Reopens
- **File**: `src/noklai/screens/ai/NoklaiAIScreen.js`
- **Component**: `NoklaiAIScreen`
- **Actual Behavior**: Closing the AI modal or navigating away clears the chat messages back to only the default greeting.
- **Expected Behavior**: Conversations should be safely stored in scoped local storage (`AsyncStorage`) partitioned by authenticated user ID and role, allowing the elder or caregiver to reference previous discussions.
- **Root Cause**: No storage persistence hook or AsyncStorage sync was attached to `messages`.
- **Severity**: Medium
- **Proposed Fix**: Persist conversation history to `@noklai_chat_history_${patientId}_${role}` with automatic hydration on screen mount and a clear-chat button for privacy.
- **Verification Required**: Exchange messages, close modal, reopen modal; verify past messages remain intact.

---

### BUG-AI-04: Lack of Dynamic Patient Context Injection into System Prompt
- **File**: `src/noklai/screens/ai/NoklaiAIScreen.js` & `src/modules/aiData.js`
- **Component**: System Instruction
- **Actual Behavior**: AI responses have no dynamic awareness of the authenticated elder's real daily schedule, recent games played, or care context.
- **Expected Behavior**: System instruction must supply Gemini with authorized non-sensitive patient context: patient name, caregiver name, scheduled reminders/medications, today's cognitive games count, and CVI summary, while enforcing strict dementia safety guardrails.
- **Root Cause**: No system prompt existed; the heuristic mock used rigid template literals.
- **Severity**: High
- **Proposed Fix**: Construct a structured, clinical system instruction providing empathetic elder care personality, authorized schedule/game data, and explicit guardrails (never diagnose, never provide dangerous medical advice, speak gently in user's preferred language).
- **Verification Required**: Ask "What medicine do I have scheduled today?" and verify Noklai lists the patient's actual Supabase reminders.

---

### BUG-AI-05: Missing Error Handling & Silent Failure Masking
- **File**: `src/noklai/screens/ai/NoklaiAIScreen.js`
- **Component**: `handleSend`
- **Actual Behavior**: If any error occurs, a generic static fallback is returned with a `setTimeout`, completely masking network timeouts, API quota limits, and invalid keys.
- **Expected Behavior**: Genuine errors must be caught and communicated transparently to the user with a friendly explanation, loading state, and retry action.
- **Root Cause**: Try/catch block in `NoklaiAIScreen` swallowed all errors and returned fallback strings.
- **Severity**: Medium
- **Proposed Fix**: Add an explicit error state in `NoklaiAIScreen.js` displaying a polite error bubble and a "Retry" button, while logging sanitized diagnostic details.
- **Verification Required**: Trigger network failure or pass invalid key; verify genuine error UI is presented.

---

### BUG-AI-06: API Key Configuration Gap & Incomplete `.gitignore`
- **File**: `.gitignore` & Root directory
- **Component**: Environment & Secrets
- **Actual Behavior**: `.env` is not in `.gitignore` (only `.env*.local` is ignored). There is no `.env.example` defining `EXPO_PUBLIC_GEMINI_API_KEY`.
- **Expected Behavior**: `.env` must be explicitly git-ignored to prevent accidental secret leakage. `.env.example` must be provided with placeholder variables.
- **Root Cause**: Default Expo gitignore template only specified `.env*.local`.
- **Severity**: High (Security risk)
- **Proposed Fix**: Add `.env` to `.gitignore` and create `.env.example`. Ensure client reads `process.env.EXPO_PUBLIC_GEMINI_API_KEY` without hardcoding keys.
- **Verification Required**: Run `git status` with `.env` present; verify Git does not track `.env`.

---

## C. Security Findings

1. **API Key Exposure Risk**:
   - In Expo / React Native applications, any variable prefixed with `EXPO_PUBLIC_` is bundled into the client code.
   - For an SIH hackathon prototype where a dedicated server proxy may not yet be hosted for chat, using `EXPO_PUBLIC_GEMINI_API_KEY` is standard for Expo, BUT the repository must NEVER commit the actual `.env` file containing the secret.
   - We must add `.env` to `.gitignore` and provide `.env.example` with placeholders.
2. **Supabase Key Safety**:
   - `supabaseClient.js` uses the Supabase anon key (`eyJ...`), which is intended for public client use with PostgreSQL Row Level Security (RLS).
   - No `service_role` key is exposed in client code.
3. **Data Privacy & Dementia Guardrails**:
   - Passwords, caregiver PINs, and raw authentication tokens must NEVER be injected into the Gemini prompt.
   - The AI must be strictly instructed:
     - *"You are Noklai, an empathetic memory care companion for elderly individuals in North East India."*
     - *"Do not pretend to be a medical doctor. Do not diagnose dementia or prescribe medication. For medical concerns, advise consulting a physician."*
     - *"Keep answers concise, warm, simple, and reassuring."*

---

## D. Unknowns & Validation Requirements

| Item | Status | Verification Plan |
| :--- | :--- | :--- |
| **Active Gemini API Key** | Verified in Supabase secrets; Client key requires `.env` entry | Test with live Google Generative Language endpoint using test script |
| **Model Availability** | `gemini-2.0-flash` confirmed active on Supabase; `gemini-1.5-flash` supported | Test REST payload against both models |
| **Supabase AI Chat Tables** | Confirmed NOT present in database | Implement client-side persistent storage in `AsyncStorage` scoped by user ID |
| **Multi-Lingual Support** | Prompt instruction must support Hindi, Hinglish, Assamese, Bengali, and English | Provide language context and verify multi-lingual response generation |

