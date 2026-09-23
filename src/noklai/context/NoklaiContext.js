import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatient } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { cognitiveAnalytics } from '../../modules/performance/CognitiveAnalyticsService';
import {
  getReminders,
  getPatientByCode,
  getPatientsByCaregiverPhone,
  linkPatientToCaregiver,
  savePatientProfile,
} from '../../modules/database';
import { supabase } from '../../modules/supabaseClient';
import NetInfo from '@react-native-community/netinfo';

const NoklaiContext = createContext();

const STORAGE_KEYS = {
  CURRENT_ROLE: '@noklai_current_role',
  ONBOARDING_SEEN: '@noklai_onboarding_seen',
  LOCAL_REMINDERS_PREFIX: '@noklai_local_reminders_',
  CAREGIVER_NAME: '@noklai_caregiver_name',
  CAREGIVER_PHONE: '@noklai_caregiver_phone',
  CAREGIVER_GENDER: '@noklai_caregiver_gender',
  PATIENT_NAME: '@noklai_patient_name',
  PATIENT_PHONE: '@noklai_patient_phone',
  PATIENT_GENDER: '@noklai_patient_gender',
  SETUP_COMPLETED: '@noklai_setup_completed',
  HOUSE_DESCRIPTION: '@noklai_house_description',
  ROOM_DIRECTIONS: '@noklai_room_directions',
  DOOR_SAFETY_NOTE: '@noklai_door_safety_note',
  PENDING_SYNC_QUEUE: '@noklai_pending_sync_queue',
};

export function NoklaiProvider({ children }) {
  const {
    patientId: existingPatientId,
    patientName: existingPatientName,
    patientAge: existingPatientAge,
    patientPhone: existingPatientPhone,
    caregiverName: existingCaregiverName,
    caregiverPhone: existingCaregiverPhone,
    relationship: existingRelationship,
    savePatientSetup,
    selectPatient,
  } = usePatient();

  const { isDarkMode } = useTheme();
  const { currentLanguage, t } = useLanguage();

  const [currentStep, setCurrentStep] = useState('launch'); // 'launch' | 'login' | 'role_select' | 'main'
  const [role, setRole] = useState('caregiver');            // 'caregiver' | 'patient'
  const [caregiverName, setCaregiverName] = useState(existingCaregiverName || 'Caregiver');
  const [caregiverPhone, setCaregiverPhone] = useState(existingCaregiverPhone || '');
  const [caregiverGender, setCaregiverGender] = useState('female'); // 'female' | 'male'
  const [activePatientId, setActivePatientId] = useState(existingPatientId || 'P001');
  const [activePatientName, setActivePatientName] = useState(existingPatientName || 'Patient');
  const [patientPhone, setPatientPhone] = useState(existingPatientPhone || '');
  const [patientGender, setPatientGender] = useState('female');     // 'female' | 'male'
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [houseDescription, setHouseDescription] = useState('');
  const [roomDirections, setRoomDirections] = useState('');
  const [doorSafetyNote, setDoorSafetyNote] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const patientContextSyncedRef = useRef(false);

  // Sync patientId once when PatientContext loads from storage without re-triggering loops
  useEffect(() => {
    if (!patientContextSyncedRef.current) {
      if (existingPatientId && existingPatientId !== 'P001' && existingPatientId !== activePatientId) {
        setActivePatientId(existingPatientId);
        patientContextSyncedRef.current = true;
      }
      if (existingPatientName && existingPatientName !== 'Patient' && existingPatientName !== activePatientName) {
        setActivePatientName(existingPatientName);
        patientContextSyncedRef.current = true;
      }
    }
  }, [existingPatientId, existingPatientName, activePatientId, activePatientName]);

  const caregiverAvatar = caregiverGender === 'male' ? '👨' : '👩';
  const patientAvatar = patientGender === 'male' ? '👴' : '👵';

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [activeCaregiverSubScreen, setActiveCaregiverSubScreen] = useState(null);
  const [activePatientGame, setActivePatientGame] = useState(null);

  // Patients List
  const [patients, setPatients] = useState([
    {
      id: existingPatientId || 'P001',
      name: existingPatientName || 'Patient',
      connectedSince: 'Mar 2025',
      activeToday: true,
      age: existingPatientAge || '72',
      gender: 'female',
      relation: existingRelationship || 'Loved One',
      status: 'Active today',
      avatarText: '👵',
    },
  ]);

  // Active Patient Object
  const activePatient = useMemo(() => {
    const found = patients.find((p) => p.id === activePatientId);
    if (found) {
      return {
        ...found,
        avatarText: found.gender === 'male' ? '👴' : (found.avatarText || patientAvatar),
      };
    }
    return {
      id: activePatientId || 'P001',
      name: activePatientName || 'Patient',
      connectedSince: 'Mar 2025',
      activeToday: true,
      age: existingPatientAge || '72',
      relation: existingRelationship || 'Loved One',
      status: 'Active today',
      avatarText: patientAvatar,
    };
  }, [patients, activePatientId, activePatientName, existingPatientAge, existingRelationship, patientAvatar]);

  // Reminders & Analytics
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const hasInitializedRef = useRef(false);

  // Helper: Enqueue an offline action to sync when connection resumes
  const enqueueOfflineAction = async (action) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ ...action, timestamp: Date.now() });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue));
    } catch (err) {
      console.warn('enqueueOfflineAction error:', err);
    }
  };

  // Helper: Flush pending offline queue to Supabase
  const flushOfflineSyncQueue = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
      if (!raw) return;
      const queue = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      setIsSyncing(true);
      const remainingQueue = [];

      for (const item of queue) {
        try {
          if (item.type === 'ADD_REMINDER' && supabase && typeof supabase.from === 'function') {
            await supabase.from('reminders').insert([item.payload]);
          } else if (item.type === 'UPDATE_REMINDER' && supabase && typeof supabase.from === 'function') {
            await supabase.from('reminders').update(item.payload.updates).eq('id', item.payload.id);
          } else if (item.type === 'DELETE_REMINDER' && supabase && typeof supabase.from === 'function') {
            await supabase.from('reminders').delete().eq('id', item.payload.id);
          } else if (item.type === 'SAVE_PROFILE') {
            await savePatientProfile(item.payload);
          }
        } catch (opErr) {
          remainingQueue.push(item);
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(remainingQueue));
    } catch (err) {
      console.warn('flushOfflineSyncQueue error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Monitor network status with NetInfo and auto-flush offline changes when online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online) {
        flushOfflineSyncQueue();
      }
    });

    NetInfo.fetch().then((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online) {
        flushOfflineSyncQueue();
      }
    }).catch(() => {});

    return () => {
      unsubscribe();
    };
  }, [flushOfflineSyncQueue]);

  // Load saved credentials, role, and setup status (runs once on mount)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    async function initNoklai() {
      try {
        const [
          savedRole,
          setupCompleted,
          savedCaregiverName,
          savedCaregiverPhone,
          savedCaregiverGender,
          savedPatientName,
          savedPatientPhone,
          savedPatientGender,
          savedHouseDesc,
          savedRoomDirs,
          savedDoorNote,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_PHONE),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_GENDER),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PHONE),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_GENDER),
          AsyncStorage.getItem(STORAGE_KEYS.HOUSE_DESCRIPTION),
          AsyncStorage.getItem(STORAGE_KEYS.ROOM_DIRECTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.DOOR_SAFETY_NOTE),
        ]);

        if (savedCaregiverName) setCaregiverName(savedCaregiverName);
        if (savedCaregiverPhone) setCaregiverPhone(savedCaregiverPhone);
        if (savedCaregiverGender) setCaregiverGender(savedCaregiverGender);
        if (savedPatientGender) setPatientGender(savedPatientGender);
        if (savedHouseDesc) setHouseDescription(savedHouseDesc);
        if (savedRoomDirs) setRoomDirections(savedRoomDirs);
        if (savedDoorNote) setDoorSafetyNote(savedDoorNote);

        if (savedPatientName) {
          setActivePatientName(savedPatientName);
          setPatients((prev) =>
            prev.map((p) => ({
              ...p,
              name: savedPatientName,
              gender: savedPatientGender || p.gender,
              avatarText: (savedPatientGender || p.gender) === 'male' ? '👴' : '👵',
            }))
          );
        }
        if (savedPatientPhone) setPatientPhone(savedPatientPhone);

        const isSetup = setupCompleted === 'true' || !!savedCaregiverName || !!existingPatientName;
        setHasCompletedSetup(isSetup);

        if (savedRole) setRole(savedRole);
        if (isSetup && savedRole) {
          setCurrentStep('main');
        }
      } catch (e) {
        console.warn('Error reading saved Noklai credentials:', e);
      }
    }
    initNoklai();
  }, []);

  // Save Caregiver & Patient Credentials
  const saveCredentials = useCallback(async ({
    caregiverName: newCaregiverName,
    caregiverPhone: newCaregiverPhone,
    caregiverGender: newCaregiverGender,
    patientName: newPatientName,
    patientPhone: newPatientPhone,
    patientGender: newPatientGender,
    houseDescription: newHouseDesc,
    roomDirections: newRoomDirs,
    doorSafetyNote: newDoorNote,
  }) => {
    setCaregiverName(newCaregiverName);
    setCaregiverPhone(newCaregiverPhone || '');
    if (newCaregiverGender) setCaregiverGender(newCaregiverGender);
    setActivePatientName(newPatientName);
    setPatientPhone(newPatientPhone || '');
    if (newPatientGender) setPatientGender(newPatientGender);
    if (newHouseDesc !== undefined) setHouseDescription(newHouseDesc);
    if (newRoomDirs !== undefined) setRoomDirections(newRoomDirs);
    if (newDoorNote !== undefined) setDoorSafetyNote(newDoorNote);
    setHasCompletedSetup(true);

    const patGender = newPatientGender || patientGender;
    const patAvatar = patGender === 'male' ? '👴' : '👵';

    // Update patients list
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatientId ? {
        ...p,
        name: newPatientName,
        gender: patGender,
        avatarText: patAvatar,
      } : p))
    );

    // Persist to AsyncStorage
    // Persist to AsyncStorage immediately (local-first)
    const storageItems = [
      [STORAGE_KEYS.CAREGIVER_NAME, newCaregiverName],
      [STORAGE_KEYS.CAREGIVER_PHONE, newCaregiverPhone || ''],
      [STORAGE_KEYS.CAREGIVER_GENDER, newCaregiverGender || caregiverGender],
      [STORAGE_KEYS.PATIENT_NAME, newPatientName],
      [STORAGE_KEYS.PATIENT_PHONE, newPatientPhone || ''],
      [STORAGE_KEYS.PATIENT_GENDER, newPatientGender || patientGender],
      [STORAGE_KEYS.SETUP_COMPLETED, 'true'],
    ];

    if (newHouseDesc !== undefined) storageItems.push([STORAGE_KEYS.HOUSE_DESCRIPTION, newHouseDesc]);
    if (newRoomDirs !== undefined) storageItems.push([STORAGE_KEYS.ROOM_DIRECTIONS, newRoomDirs]);
    if (newDoorNote !== undefined) storageItems.push([STORAGE_KEYS.DOOR_SAFETY_NOTE, newDoorNote]);

    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.CAREGIVER_NAME, newCaregiverName],
        [STORAGE_KEYS.CAREGIVER_PHONE, newCaregiverPhone || ''],
        [STORAGE_KEYS.CAREGIVER_GENDER, newCaregiverGender || caregiverGender],
        [STORAGE_KEYS.PATIENT_NAME, newPatientName],
        [STORAGE_KEYS.PATIENT_PHONE, newPatientPhone || ''],
        [STORAGE_KEYS.PATIENT_GENDER, newPatientGender || patientGender],
        [STORAGE_KEYS.SETUP_COMPLETED, 'true'],
      ]);
      await AsyncStorage.multiSet(storageItems);
    } catch (e) {
      console.warn('AsyncStorage save error:', e);
    }

    // Sync with global PatientContext if available
    if (savePatientSetup) {
      try {
        await savePatientSetup({
          patientId: activePatientId || existingPatientId || 'P001',
          caregiverName: newCaregiverName,
          caregiverPhone: newCaregiverPhone || '',
          patientName: newPatientName,
          patientPhone: newPatientPhone || '',
        });
      } catch (e) {
        // Continue safely offline
      }
    }

    // Sync to Supabase patients table
    // Sync to Supabase patients table or queue if offline
    const profilePayload = {
      patient_id: activePatientId || existingPatientId || 'P001',
      name: newPatientName,
      caregiver_phone: newCaregiverPhone || null,
      patient_phone: newPatientPhone || null,
      gender: patGender,
      house_description: newHouseDesc ?? houseDescription ?? null,
      room_directions: newRoomDirs ?? roomDirections ?? null,
      door_safety_note: newDoorNote ?? doorSafetyNote ?? null,
    };

    if (isOnline) {
      try {
        await savePatientProfile(profilePayload);
      } catch (e) {
        await enqueueOfflineAction({ type: 'SAVE_PROFILE', payload: profilePayload });
      }
    } else {
      await enqueueOfflineAction({ type: 'SAVE_PROFILE', payload: profilePayload });
    }
  }, [
    activePatientId,
    existingPatientId,
    savePatientSetup,
    caregiverGender,
    patientGender,
    houseDescription,
    roomDirections,
    doorSafetyNote,
    isOnline,
  ]);

  // Save Caregiver Reality-Orientation & Environment Settings
  const saveEnvironmentSettings = useCallback(async ({
    houseDescription: newHouseDesc,
    roomDirections: newRoomDirs,
    doorSafetyNote: newDoorNote,
  }) => {
    if (newHouseDesc !== undefined) setHouseDescription(newHouseDesc);
    if (newRoomDirs !== undefined) setRoomDirections(newRoomDirs);
    if (newDoorNote !== undefined) setDoorSafetyNote(newDoorNote);

    const storageItems = [
      [STORAGE_KEYS.HOUSE_DESCRIPTION, newHouseDesc ?? houseDescription ?? ''],
      [STORAGE_KEYS.ROOM_DIRECTIONS, newRoomDirs ?? roomDirections ?? ''],
      [STORAGE_KEYS.DOOR_SAFETY_NOTE, newDoorNote ?? doorSafetyNote ?? ''],
    ];

    try {
      await savePatientProfile({
        patient_id: activePatientId || existingPatientId || 'P001',
        name: newPatientName,
        caregiver_phone: newCaregiverPhone || null,
        patient_phone: newPatientPhone || null,
        gender: patGender,
      });
      await AsyncStorage.multiSet(storageItems);
    } catch (e) {
      // Continue safely offline
      console.warn('AsyncStorage saveEnvironmentSettings error:', e);
    }
  }, [activePatientId, existingPatientId, savePatientSetup]);

  // Load REAL Reminders
    const payload = {
      patient_id: activePatientId || existingPatientId || 'P001',
      house_description: newHouseDesc ?? houseDescription,
      room_directions: newRoomDirs ?? roomDirections,
      door_safety_note: newDoorNote ?? doorSafetyNote,
    };

    if (isOnline) {
      try {
        await savePatientProfile(payload);
      } catch (err) {
        await enqueueOfflineAction({ type: 'SAVE_PROFILE', payload });
      }
    } else {
      await enqueueOfflineAction({ type: 'SAVE_PROFILE', payload });
    }
  }, [activePatientId, existingPatientId, houseDescription, roomDirections, doorSafetyNote, isOnline]);

  // Load REAL Reminders (Local-First: instant cache reading so UI never blocks on network)
  const loadReminders = useCallback(async () => {
    setLoadingReminders(true);
    const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
    let localList = [];

    try {
      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      let localList = [];

      const localRaw = await AsyncStorage.getItem(storageKey);
      if (localRaw) {
        try {
          localList = JSON.parse(localRaw) || [];
          if (Array.isArray(localList) && localList.length > 0) {
            setReminders(localList);
            setLoadingReminders(false);
          }
        } catch (e) {
          localList = [];
        }
      }
    } catch (err) {
      console.warn('Error reading local reminders cache:', err);
    }

      try {
        const remoteData = await getReminders(activePatientId);
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          const map = new Map();
          localList.forEach((item) => map.set(item.id?.toString(), item));
          remoteData.forEach((item) => {
            map.set(item.id?.toString(), {
              id: item.id?.toString(),
              title: item.title,
              time: item.time,
              done: !!item.completed,
              category: item.category || 'General',
            });
    // Background fetch from Supabase to refresh and sync cache
    try {
      const remoteData = await getReminders(activePatientId);
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        const map = new Map();
        localList.forEach((item) => map.set(item.id?.toString(), item));
        remoteData.forEach((item) => {
          map.set(item.id?.toString(), {
            id: item.id?.toString(),
            title: item.title,
            time: item.time,
            done: !!item.completed,
            category: item.category || 'General',
          });
          localList = Array.from(map.values());
        }
      } catch (dbErr) {
        // Offline fallback
        });
        const merged = Array.from(map.values());
        setReminders(merged);
        AsyncStorage.setItem(storageKey, JSON.stringify(merged)).catch(() => {});
      }

      setReminders(localList);
    } catch (err) {
      console.warn('Error loading reminders:', err);
      setReminders([]);
    } catch (dbErr) {
      // Offline fallback: keep cached localList without error
    } finally {
      setLoadingReminders(false);
    }
  }, [activePatientId]);

  // Load REAL Analytics & Sessions
  const loadAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const patientInfo = {
        patientId: activePatientId || 'P001',
        patientName: activePatientName,
        patientAge: existingPatientAge || '72',
        caregiverName,
        relationship: existingRelationship || 'Caregiver',
      };

      const [dashboard, sessions] = await Promise.all([
        cognitiveAnalytics.getCaregiverDashboardData('7d', patientInfo),
        cognitiveAnalytics.getMergedSessions(activePatientId || 'P001'),
      ]);

      setAnalyticsData(dashboard);
      const effectiveId = activePatientId || 'P001';
      const patientSessions = (sessions || []).filter((s) => {
        if (!s.patientId) return true;
        if (s.patientId === effectiveId) return true;
        if (effectiveId === 'P001' && (s.patientId === 'guest_player' || s.patientId?.startsWith('P_'))) return true;
        if (s.patientId === 'P001' && effectiveId?.startsWith('P_')) return true;
        return false;
      });
      setAllSessions(patientSessions.reverse());
    } catch (err) {
      console.warn('Error loading real cognitive analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [activePatientId, activePatientName, caregiverName, existingPatientAge, existingRelationship]);

  // Load Linked Patients from Supabase based on caregiver's phone
  const loadLinkedPatients = useCallback(async (cgPhone = null) => {
    const targetPhone = cgPhone || caregiverPhone;
    if (!targetPhone) return;

    try {
      const remotePatients = await getPatientsByCaregiverPhone(targetPhone);
      if (Array.isArray(remotePatients) && remotePatients.length > 0) {
        setPatients((prev) => {
          const map = new Map();
          prev.forEach((p) => map.set(p.id, p));
          remotePatients.forEach((rp) => {
            const isMale = (rp.gender || '').toLowerCase() === 'male';
            map.set(rp.patient_id, {
              id: rp.patient_id,
              name: rp.name || 'Loved One',
              age: rp.age ? String(rp.age) : '72',
              gender: rp.gender || 'female',
              connectedSince: rp.created_at
                ? new Date(rp.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                : 'Recent',
              activeToday: true,
              relation: 'Loved One',
              status: 'Connected via phone',
              avatarText: isMale ? '👴' : '👵',
              caregiverPhone: rp.caregiver_phone,
            });
          });
          return Array.from(map.values());
        });

        // Set active patient if current is default and remote has different ID
        if ((!activePatientId || activePatientId === 'P001') && remotePatients[0].patient_id && remotePatients[0].patient_id !== activePatientId) {
          setActivePatientId(remotePatients[0].patient_id);
          if (remotePatients[0].name) {
            setActivePatientName(remotePatients[0].name);
            if (typeof selectPatient === 'function') {
              selectPatient(remotePatients[0].patient_id, remotePatients[0].name);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not load linked patients from Supabase:', err);
    }
  }, [caregiverPhone, activePatientId, selectPatient]);

  // Link a Patient by Invite Code (e.g. "P001" or "P_1789648234497")
  const linkPatientByInviteCode = useCallback(async (inviteCode) => {
    if (!inviteCode || !inviteCode.trim()) {
      return { success: false, message: 'Please enter a valid patient connection code.' };
    }

    try {
      const cleanCode = inviteCode.trim();
      const patientData = await getPatientByCode(cleanCode);

      if (!patientData) {
        return {
          success: false,
          message: `No patient found with code "${cleanCode}". Please verify the code on the elder's screen.`,
        };
      }

      // Found patient! Link with current caregiver in Supabase
      if (caregiverPhone) {
        await linkPatientToCaregiver(patientData.patient_id, caregiverPhone, caregiverName);
      }

      const isMale = (patientData.gender || '').toLowerCase() === 'male';
      const formatted = {
        id: patientData.patient_id,
        name: patientData.name || 'Loved One',
        age: patientData.age ? String(patientData.age) : '72',
        gender: patientData.gender || 'female',
        connectedSince: 'Today',
        activeToday: true,
        relation: 'Loved One',
        status: 'Linked via code',
        avatarText: isMale ? '👴' : '👵',
        caregiverPhone: caregiverPhone || patientData.caregiver_phone,
      };

      setPatients((prev) => {
        const filtered = prev.filter((p) => p.id !== formatted.id);
        return [formatted, ...filtered];
      });

      setActivePatientId(formatted.id);
      setActivePatientName(formatted.name);
      if (typeof selectPatient === 'function') {
        selectPatient(formatted.id, formatted.name);
      }

      // Force refresh analytics
      setTimeout(() => {
        loadAnalytics();
      }, 200);

      return { success: true, patient: formatted };
    } catch (err) {
      console.warn('linkPatientByInviteCode error:', err);
      return { success: false, message: 'Connection failed. Please check network.' };
    }
  }, [caregiverPhone, caregiverName, loadAnalytics]);

  // Sign out cleanly to isolate user sessions
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CURRENT_ROLE,
      ]);
    } catch (e) {}
    setRole(null);
    setCurrentStep('launch');
    setActiveCaregiverSubScreen(null);
    setAllSessions([]);
    setAnalyticsData(null);
  }, []);

  // Load real reminders and analytics whenever active patient changes (guarded)
  useEffect(() => {
    if (!activePatientId) return;
    loadReminders();
    loadAnalytics();
  }, [activePatientId]);

  // Load linked patients when caregiver role or caregiver phone changes
  useEffect(() => {
    if (role === 'caregiver' && caregiverPhone) {
      loadLinkedPatients(caregiverPhone);
    }
  }, [role, caregiverPhone]);

  const handleGameFinished = useCallback(() => {
    setActivePatientGame(null);
    loadAnalytics();
    setTimeout(() => {
      loadAnalytics();
    }, 400);
  }, [loadAnalytics]);

  const toggleRoutineItem = useCallback(async (itemId) => {
    setReminders((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );

      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch(() => {});

      const current = updated.find((i) => i.id === itemId);
      if (current && supabase && typeof supabase.from === 'function') {
        supabase
          .from('reminders')
          .update({ completed: current.done })
          .eq('id', itemId)
          .then(() => {})
          .catch(() => {});
      if (current) {
        const updatePayload = { id: itemId, updates: { completed: current.done } };
        if (isOnline && supabase && typeof supabase.from === 'function') {
          supabase
            .from('reminders')
            .update({ completed: current.done })
            .eq('id', itemId)
            .then(() => {})
            .catch(() => {
              enqueueOfflineAction({ type: 'UPDATE_REMINDER', payload: updatePayload });
            });
        } else {
          enqueueOfflineAction({ type: 'UPDATE_REMINDER', payload: updatePayload });
        }
      }

      return updated;
    };
  }, [activePatientId]);
   [activePatientId, isOnline];

  const addReminder = useCallback(async (newReminder) => {
    const item = {
      id: `rem_${Date.now()}`,
      title: newReminder.title.trim(),
      time: newReminder.time.trim() || '12:00 PM',
      done: false,
      category: newReminder.category || 'Routine',
      patient_id: activePatientId,
    };

    setReminders((prev) => {
      const updated = [...prev, item];
      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (supabase && typeof supabase.from === 'function') {
    const reminderPayload = {
      patient_id: activePatientId,
      title: item.title,
      time: item.time,
      completed: false,
    };

    if (isOnline && supabase && typeof supabase.from === 'function') {
      try {
        await supabase.from('reminders').insert([
          {
            patient_id: activePatientId,
            title: item.title,
            time: item.time,
            completed: false,
          },
        ]);
      } catch (e) {}
        await supabase.from('reminders').insert([reminderPayload]);
      } catch (e) {
        await enqueueOfflineAction({ type: 'ADD_REMINDER', payload: reminderPayload });
      }
    } else {
      await enqueueOfflineAction({ type: 'ADD_REMINDER', payload: reminderPayload });
    }
  }, [activePatientId]);
  }, [activePatientId, isOnline]);

  const deleteReminder = useCallback(async (itemId) => {
    setReminders((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (supabase && typeof supabase.from === 'function') {
    if (isOnline && supabase && typeof supabase.from === 'function') {
      try {
        await supabase.from('reminders').delete().eq('id', itemId);
      } catch (e) {}
      } catch (e) {
        await enqueueOfflineAction({ type: 'DELETE_REMINDER', payload: { id: itemId } });
      }
    } else {
      await enqueueOfflineAction({ type: 'DELETE_REMINDER', payload: { id: itemId } });
    }
  }, [activePatientId]);
  }, [activePatientId, isOnline]);

  const addPatient = useCallback((newPatient) => {
    const isMale = (newPatient.gender || '').toLowerCase() === 'male';
    const formatted = {
      id: `P_${Date.now()}`,
      name: newPatient.name || 'Loved One',
      connectedSince: 'Today',
      activeToday: true,
      age: newPatient.age || '70',
      gender: isMale ? 'male' : 'female',
      relation: newPatient.relation || 'Relative',
      status: 'Connected today',
      avatarText: isMale ? '👴' : '👵',
    };
    setPatients((prev) => [...prev, formatted]);
    setActivePatientId(formatted.id);
    setActivePatientName(formatted.name);
    if (typeof selectPatient === 'function') {
      selectPatient(formatted.id, formatted.name);
    }
  }, [selectPatient]);

  // Computed Real Stats
  const computedStats = useMemo(() => {
    if (!analyticsData) {
      return {
        gamesToday: 0,
        avgAccuracy: null,
        totalPlayTimeMinutes: 0,
        daysActiveThisWeek: 0,
        currentLevel: 'Beginner',
        accuracyWeeklyDelta: '+0%',
        vitalityIndex: null,
      };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCount = (allSessions || []).filter((s) => {
      const t = new Date(s.timestamp).getTime();
      return t >= startOfToday.getTime();
    }).length;

    return {
      gamesToday: todayCount,
      avgAccuracy: analyticsData.overallAccuracy,
      totalPlayTimeMinutes: analyticsData.exerciseMinutes || 0,
      daysActiveThisWeek: analyticsData.streakDays || ((allSessions || []).length > 0 ? 1 : 0),
      currentLevel: analyticsData.totalSessions >= 8 ? 'Advanced' : analyticsData.totalSessions >= 3 ? 'Medium' : 'Beginner',
      accuracyWeeklyDelta: analyticsData.growthPercent ? `${analyticsData.growthPercent > 0 ? '+' : ''}${analyticsData.growthPercent}%` : '+0%',
      vitalityIndex: analyticsData.vitalityIndex,
    };
  }, [analyticsData, allSessions]);

  // Real Game Breakdown
  const realGamePerformance = useMemo(() => {
    const defaultGames = [
      { id: 'suh_tah_lam', name: 'Suh Tah Lam (Bamboo Rhythm)', icon: 'musical-notes-outline', category: 'Rhythm & Sequence' },
      { id: 'ubilakapki', name: 'Ubilakapki Coconut Toss', icon: 'ellipse-outline', category: 'Spatial Tracking' },
      { id: 'dhop_khel', name: 'Dhopkhel Catch', icon: 'football-outline', category: 'Coordination & Focus' },
      { id: 'northeast_memory', name: 'Sinaki Sthan', icon: 'images-outline', category: 'Cultural Visual Memory' },
      { id: 'memory_stories', name: 'Xuworoni Kotha', icon: 'book-outline', category: 'Cultural Memory' },
    ];

    if (!analyticsData?.gameBreakdown || analyticsData.gameBreakdown.length === 0) {
      return defaultGames.map((g) => ({
        ...g,
        score: null,
        sessionsCount: 0,
      }));
    }

    return defaultGames.map((g) => {
      const found = analyticsData.gameBreakdown.find((b) => b.gameId === g.id);
      return {
        ...g,
        score: found ? found.accuracy : null,
        sessionsCount: found ? found.sessionsCount : 0,
      };
    });
  }, [analyticsData]);

  // Real Recent Activity
  const realRecentActivity = useMemo(() => {
    if (!allSessions || allSessions.length === 0) return [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    return allSessions.slice(0, 25).map((s) => {
      const sTime = new Date(s.timestamp).getTime();
      let day = 'Earlier';
      if (sTime >= startOfToday) day = 'Today';
      else if (sTime >= startOfYesterday) day = 'Yesterday';

      let timeFormatted = '';
      let formattedDate = '';
      let fullDateTime = '';
      try {
        const d = new Date(s.timestamp);
        formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        fullDateTime = `${formattedDate} at ${timeFormatted}`;
      } catch (e) {
        timeFormatted = 'Recently';
        fullDateTime = 'Recently';
      }

      const durationSec = typeof s.durationSec === 'number' ? s.durationSec : (typeof s.duration === 'number' ? s.duration : null);
      const durationMin = durationSec ? Math.floor(durationSec / 60) : 0;
      const durationSecRem = durationSec ? Math.round(durationSec % 60) : 0;
      const durationFormatted = durationSec !== null && durationSec > 0
        ? durationMin > 0
          ? `${durationMin} min ${durationSecRem} sec`
          : `${durationSecRem} sec`
        : null;

      const accuracyVal = typeof s.accuracy === 'number' && !isNaN(s.accuracy)
        ? Math.round(s.accuracy)
        : null;
      const status = s.metadata?.status || (s.completed !== false ? 'Completed' : 'Aborted');

      return {
        id: s.id,
        game: s.gameName || s.gameId || 'Brain Exercise',
        gameId: s.gameId,
        time: timeFormatted,
        day,
        formattedDate,
        fullDateTime,
        status,
        rawScore: typeof s.score === 'number' ? s.score : null,
        score: typeof s.score === 'number' ? `${s.score} pts` : (accuracyVal !== null ? `${accuracyVal}%` : '--'),
        rawAccuracy: accuracyVal,
        accuracy: accuracyVal !== null ? `${accuracyVal}%` : null,
        durationSec: durationSec || 0,
        durationFormatted,
        difficulty: s.difficulty || 'Normal',
        icon: s.gameId?.includes('suh') ? 'musical-notes-outline' : s.gameId?.includes('dhop') ? 'football-outline' : s.gameId?.includes('ubi') ? 'grid-outline' : s.gameId?.includes('memory') ? 'book-outline' : 'game-controller-outline',
        color: '#5B409E',
      };
    });
  }, [allSessions]);

  const selectRole = useCallback(async (selectedRole) => {
    setRole(selectedRole);
    setCurrentStep('main');
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, selectedRole);
    } catch (e) {
      console.warn('Error persisting Noklai role:', e);
    }
  }, []);

  const resetToRoleSelect = useCallback(async () => {
    setCurrentStep('role_select');
  }, []);

  const resetToLaunch = useCallback(async () => {
    setCurrentStep('launch');
  }, []);

  const noklaiContextValue = useMemo(() => ({
    currentStep,
    setCurrentStep,
    role,
    setRole,
    selectRole,
    resetToRoleSelect,
    resetToLaunch,
    hasCompletedSetup,
    caregiverName,
    setCaregiverName,
    caregiverPhone,
    setCaregiverPhone,
    caregiverGender,
    setCaregiverGender,
    caregiverAvatar,
    activePatientId,
    setActivePatientId,
    activePatientName,
    setActivePatientName,
    patientPhone,
    setPatientPhone,
    patientGender,
    setPatientGender,
    patientAvatar,
    saveCredentials,
    patients,
    activePatient,
    addPatient,
    aiModalVisible,
    setAiModalVisible,
    activeCaregiverSubScreen,
    setActiveCaregiverSubScreen,
    activePatientGame,
    setActivePatientGame,
    handleGameFinished,

    // Real data
    reminders,
    loadingReminders,
    addReminder,
    deleteReminder,
    toggleRoutineItem,
    computedStats,
    realGamePerformance,
    realRecentActivity,
    analyticsData,
    isLoadingAnalytics,
    loadAnalytics,
    loadLinkedPatients,
    linkPatientByInviteCode,
    signOut,
    allSessions,

    // Reality Orientation Environment Fields
    houseDescription,
    setHouseDescription,
    roomDirections,
    setRoomDirections,
    doorSafetyNote,
    setDoorSafetyNote,
    saveEnvironmentSettings,

    // Network & Offline Status
    isOnline,
    isSyncing,
    flushOfflineSyncQueue,

    isDarkMode,
  }), [
    currentStep,
    role,
    selectRole,
    resetToRoleSelect,
    resetToLaunch,
    hasCompletedSetup,
    caregiverName,
    caregiverPhone,
    caregiverGender,
    caregiverAvatar,
    activePatientId,
    activePatientName,
    patientPhone,
    patientGender,
    patientAvatar,
    saveCredentials,
    patients,
    activePatient,
    addPatient,
    aiModalVisible,
    activeCaregiverSubScreen,
    activePatientGame,
    handleGameFinished,
    reminders,
    loadingReminders,
    addReminder,
    deleteReminder,
    toggleRoutineItem,
    computedStats,
    realGamePerformance,
    realRecentActivity,
    analyticsData,
    isLoadingAnalytics,
    loadAnalytics,
    loadLinkedPatients,
    linkPatientByInviteCode,
    signOut,
    allSessions,
    houseDescription,
    roomDirections,
    doorSafetyNote,
    saveEnvironmentSettings,
    isOnline,
    isSyncing,
    flushOfflineSyncQueue,
    isDarkMode,
  ]);

  return (
    <NoklaiContext.Provider value={noklaiContextValue}>
      {children}
    </NoklaiContext.Provider>
  );


export function useNoklai() {
  const context = useContext(NoklaiContext);
  if (!context) {
    throw new Error('useNoklai must be used within a NoklaiProvider');
  }
  return context;
}

export default NoklaiContext;
