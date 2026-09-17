import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatient } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { cognitiveAnalytics } from '../../modules/performance/CognitiveAnalyticsService';
import { getReminders } from '../../modules/database';
import { supabase } from '../../modules/supabaseClient';

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

  // Load saved credentials, role, and setup status
  useEffect(() => {
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
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_PHONE),
          AsyncStorage.getItem(STORAGE_KEYS.CAREGIVER_GENDER),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PHONE),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_GENDER),
        ]);

        if (savedCaregiverName) setCaregiverName(savedCaregiverName);
        if (savedCaregiverPhone) setCaregiverPhone(savedCaregiverPhone);
        if (savedCaregiverGender) setCaregiverGender(savedCaregiverGender);
        if (savedPatientGender) setPatientGender(savedPatientGender);
        if (savedPatientName) {
          setActivePatientName(savedPatientName);
          setPatients((prev) =>
            prev.map((p) => (p.id === activePatientId ? {
              ...p,
              name: savedPatientName,
              gender: savedPatientGender || p.gender,
              avatarText: (savedPatientGender || p.gender) === 'male' ? '👴' : '👵',
            } : p))
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
  }, [activePatientId, existingPatientName]);

  // Save Caregiver & Patient Credentials
  const saveCredentials = useCallback(async ({
    caregiverName: newCaregiverName,
    caregiverPhone: newCaregiverPhone,
    caregiverGender: newCaregiverGender,
    patientName: newPatientName,
    patientPhone: newPatientPhone,
    patientGender: newPatientGender,
  }) => {
    setCaregiverName(newCaregiverName);
    setCaregiverPhone(newCaregiverPhone || '');
    if (newCaregiverGender) setCaregiverGender(newCaregiverGender);
    setActivePatientName(newPatientName);
    setPatientPhone(newPatientPhone || '');
    if (newPatientGender) setPatientGender(newPatientGender);
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
    } catch (e) {
      console.warn('AsyncStorage save error:', e);
    }

    // Sync with global PatientContext if available
    if (savePatientSetup) {
      try {
        await savePatientSetup({
          caregiverName: newCaregiverName,
          caregiverPhone: newCaregiverPhone || '',
          patientName: newPatientName,
          patientPhone: newPatientPhone || '',
        });
      } catch (e) {
        // Continue safely offline
      }
    }
  }, [activePatientId, savePatientSetup]);

  // Load REAL Reminders
  const loadReminders = useCallback(async () => {
    setLoadingReminders(true);
    try {
      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      let localList = [];

      const localRaw = await AsyncStorage.getItem(storageKey);
      if (localRaw) {
        try {
          localList = JSON.parse(localRaw) || [];
        } catch (e) {
          localList = [];
        }
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
          });
          localList = Array.from(map.values());
        }
      } catch (dbErr) {
        // Offline fallback
      }

      setReminders(localList);
    } catch (err) {
      console.warn('Error loading reminders:', err);
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  }, [activePatientId]);

  // Load REAL Analytics & Sessions
  const loadAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const patientInfo = {
        patientId: activePatientId,
        patientName: activePatientName,
        patientAge: existingPatientAge || '72',
        caregiverName,
        relationship: existingRelationship || 'Caregiver',
      };

      const [dashboard, sessions] = await Promise.all([
        cognitiveAnalytics.getCaregiverDashboardData('7d', patientInfo),
        cognitiveAnalytics.getAllSessions(),
      ]);

      setAnalyticsData(dashboard);
      const patientSessions = (sessions || []).filter(
        (s) => !s.patientId || s.patientId === activePatientId
      );
      setAllSessions(patientSessions.reverse());
    } catch (err) {
      console.warn('Error loading real cognitive analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [activePatientId, activePatientName, caregiverName, existingPatientAge, existingRelationship]);

  useEffect(() => {
    loadReminders();
    loadAnalytics();
  }, [loadReminders, loadAnalytics]);

  const handleGameFinished = useCallback(() => {
    setActivePatientGame(null);
    loadAnalytics();
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
      }

      return updated;
    });
  }, [activePatientId]);

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
    }
  }, [activePatientId]);

  const deleteReminder = useCallback(async (itemId) => {
    setReminders((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      const storageKey = `${STORAGE_KEYS.LOCAL_REMINDERS_PREFIX}${activePatientId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (supabase && typeof supabase.from === 'function') {
      try {
        await supabase.from('reminders').delete().eq('id', itemId);
      } catch (e) {}
    }
  }, [activePatientId]);

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
  }, []);

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

    return allSessions.slice(0, 15).map((s) => {
      const sTime = new Date(s.timestamp).getTime();
      let day = 'Earlier';
      if (sTime >= startOfToday) day = 'Today';
      else if (sTime >= startOfYesterday) day = 'Yesterday';

      let timeFormatted = '';
      try {
        timeFormatted = new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        timeFormatted = 'Recently';
      }

      return {
        id: s.id,
        game: s.gameName || s.gameId || 'Brain Exercise',
        time: timeFormatted,
        day,
        score: typeof s.accuracy === 'number' ? `${Math.round(s.accuracy)}%` : `${s.score || 0}`,
        icon: s.gameId?.includes('suh') ? 'musical-notes-outline' : s.gameId?.includes('dhop') ? 'football-outline' : 'game-controller-outline',
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

  return (
    <NoklaiContext.Provider
      value={{
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

        isDarkMode,
      }}
    >
      {children}
    </NoklaiContext.Provider>
  );
}

export function useNoklai() {
  const context = useContext(NoklaiContext);
  if (!context) {
    throw new Error('useNoklai must be used within a NoklaiProvider');
  }
  return context;
}

export default NoklaiContext;
