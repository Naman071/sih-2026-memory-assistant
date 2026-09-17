import { supabase } from './supabaseClient.js';

export const getPatientProfile = async (patientId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('patient_id', patientId)
    .single();
  if (error) console.error('Error fetching patient:', error);
  return data;
};

export const savePatientProfile = async (patientData) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .upsert([patientData], { onConflict: 'patient_id' })
      .select();
    if (error) {
      console.warn('Supabase savePatientProfile error:', error.message || error);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Supabase savePatientProfile network exception:', error.message || error);
    return null;
  }
};

export const getAllPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : [
      { id: '1', patient_id: 'P001', name: 'Chandni Devi', age: 72, gender: 'Female' },
      { id: '2', patient_id: 'P002', name: 'Ramesh Sharma', age: 78, gender: 'Male' },
    ];
  } catch (error) {
    console.error('Error fetching all patients:', error);
    return [
      { id: '1', patient_id: 'P001', name: 'Chandni Devi', age: 72, gender: 'Female' },
      { id: '2', patient_id: 'P002', name: 'Ramesh Sharma', age: 78, gender: 'Male' },
    ];
  }
};

export const getReminders = async (patientId) => {
  console.log(`Fetching reminders for patient: ${patientId}`);
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
  console.log(`Data received from Supabase:`, data);
  return data;
};

export const getFamilyMembers = async (patientId) => {
  console.log(`Fetching family members for patient: ${patientId}`);
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('patient_id', patientId);
  if (error) {
    console.error('Error fetching family members:', error);
    throw error;
  }
  console.log(`Data received from Supabase:`, data);
  return data;
};

export const addFamilyMember = async (data) => {
  console.log('Adding family member with phone:', data);
  const memberPayload = {
    patient_id: data.patient_id,
    name: data.name,
    relationship: data.relationship,
    description: data.description,
    phone: data.phone || null,
    photo_url: data.photo_url,
  };
  const { data: result, error } = await supabase
    .from('family_members')
    .insert([memberPayload])
    .select();
  if (error) {
    console.error('Error adding family member:', error);
    throw error;
  }
  return result;
};

export const deleteFamilyMember = async (id) => {
  const { data, error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
  return data;
};

export const saveGameResult = async (resultData) => {
  try {
    const payload = {
      patient_id: resultData.patient_id || 'P001',
      game_name: resultData.game_name || 'Brain Exercise',
      score: typeof resultData.score === 'number' ? resultData.score : 10,
      duration: typeof resultData.duration === 'number' ? resultData.duration : 45,
      difficulty: resultData.difficulty
        ? resultData.difficulty.charAt(0).toUpperCase() + resultData.difficulty.slice(1)
        : 'Medium',
      played_at: resultData.played_at || new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('game_results')
      .insert([payload])
      .select();
    if (error) {
      console.warn('Error saving game result to Supabase:', error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('saveGameResult exception:', err.message || err);
    return null;
  }
};

export const getPatientByCode = async (code) => {
  if (!code) return null;
  const cleanCode = code.trim();
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', cleanCode)
      .maybeSingle();
    if (data) return data;

    if (!isNaN(cleanCode)) {
      const { data: numData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', parseInt(cleanCode, 10))
        .maybeSingle();
      if (numData) return numData;
    }
    return null;
  } catch (err) {
    console.warn('getPatientByCode exception:', err.message || err);
    return null;
  }
};

export const getPatientsByCaregiverPhone = async (phone) => {
  if (!phone) return [];
  const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    if (error || !data) return [];

    return data.filter((p) => {
      if (!p.caregiver_phone) return false;
      const cgDigits = p.caregiver_phone.replace(/\D/g, '').slice(-10);
      return cgDigits === cleanPhone;
    });
  } catch (err) {
    console.warn('getPatientsByCaregiverPhone exception:', err);
    return [];
  }
};

export const linkPatientToCaregiver = async (patientId, caregiverPhone, caregiverName = 'Caregiver') => {
  try {
    const cleanPhone = caregiverPhone.trim();
    const { error: pErr } = await supabase
      .from('patients')
      .update({ caregiver_phone: cleanPhone })
      .eq('patient_id', patientId);

    if (pErr) console.warn('linkPatient update caregiver_phone warning:', pErr.message);

    const { data: existingFm } = await supabase
      .from('family_members')
      .select('id')
      .eq('patient_id', patientId)
      .eq('relationship', 'Primary Caregiver')
      .maybeSingle();

    if (existingFm) {
      await supabase
        .from('family_members')
        .update({ name: caregiverName, phone: cleanPhone })
        .eq('id', existingFm.id);
    } else {
      await supabase
        .from('family_members')
        .insert([{
          patient_id: patientId,
          name: caregiverName,
          relationship: 'Primary Caregiver',
          description: 'Linked Family Caregiver monitoring cognitive vitality.',
          phone: cleanPhone,
        }]);
    }

    return true;
  } catch (err) {
    console.warn('linkPatientToCaregiver exception:', err);
    return false;
  }
};

export const getRemoteGameSessions = async (patientId) => {
  if (!patientId) return [];
  try {
    const [resultsRes, perfRes] = await Promise.all([
      supabase
        .from('game_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('played_at', { ascending: false }),
      supabase
        .from('game_performance')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),
    ]);

    const results = resultsRes.data || [];
    const performances = perfRes.data || [];

    return results.map((r) => {
      const gName = r.game_name || 'Brain Exercise';
      const gId = gName.toLowerCase().includes('suh')
        ? 'suh_tah_lam'
        : gName.toLowerCase().includes('dhop')
        ? 'dhop_khel'
        : gName.toLowerCase().includes('ubila')
        ? 'ubilakapki'
        : gName.toLowerCase().includes('story') || gName.toLowerCase().includes('xuwo')
        ? 'memory_stories'
        : 'northeast_memory';

      const relatedPerfs = performances.filter((p) => p.game_name === r.game_name);
      const validRts = relatedPerfs
        .map((p) => p.response_time)
        .filter((t) => typeof t === 'number' && t > 0);
      const avgRt =
        validRts.length > 0
          ? Math.round((validRts.reduce((a, b) => a + b, 0) / validRts.length) * 10) / 10
          : null;

      const scoreNum = typeof r.score === 'number' ? r.score : 10;
      const accuracyCalc = scoreNum >= 10 ? 100 : scoreNum > 0 ? scoreNum * 10 : 70;

      return {
        id: `supabase_gr_${r.id}`,
        patientId: r.patient_id,
        gameId: gId,
        gameName: gName,
        difficulty: (r.difficulty || 'Medium').toLowerCase(),
        durationSec: r.duration || 45,
        questionsTotal: 10,
        questionsCorrect: Math.round(accuracyCalc / 10),
        accuracy: accuracyCalc,
        responseTimeSec: avgRt,
        score: scoreNum,
        maxScore: 10,
        timestamp: r.played_at || new Date().toISOString(),
        metadata: {
          eligibleForCVI: true,
          source: 'supabase_remote',
        },
      };
    });
  } catch (err) {
    console.warn('getRemoteGameSessions exception:', err);
    return [];
  }
};

export const updateReminder = async (id, updates) => {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id);
  if (error) console.error('Error updating reminder:', error);
  return data;
};

export const getNextMemoryScene = async (patientId) => {
  try {
    // Get scenes the patient has NOT seen
    const { data: seen } = await supabase
      .from('player_scene_history')
      .select('scene_id')
      .eq('patient_id', patientId);
    
    const seenIds = seen?.map(s => s.scene_id).filter(Boolean) || [];
    
    let query = supabase
      .from('memory_scenes')
      .select('*')
      .eq('active', true);
    
    if (seenIds.length > 0) {
      query = query.not('scene_id', 'in', `(${seenIds.join(',')})`);
    }
    
    const { data } = await query.limit(1).maybeSingle();
    if (data) return data;

    // Fallback: If all scenes have been seen, return any active scene so the player can always play
    const { data: fallback } = await supabase
      .from('memory_scenes')
      .select('*')
      .eq('active', true)
      .limit(1)
      .maybeSingle();

    return fallback || null;
  } catch (err) {
    console.error('Error in getNextMemoryScene:', err);
    return null;
  }
};

export const getSceneQuestions = async (sceneId) => {
  try {
    const { data, error } = await supabase
      .from('memory_questions')
      .select('*')
      .eq('scene_id', sceneId)
      .eq('active', true);
    if (error) {
      console.error('Error in getSceneQuestions:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error in getSceneQuestions exception:', err);
    return [];
  }
};

export const recordSceneView = async (patientId, sceneId) => {
  const { error } = await supabase
    .from('player_scene_history')
    .insert([{ patient_id: patientId, scene_id: sceneId }]);
  if (error) console.error(error);
};

export const recordPerformance = async (data) => {
  const { error } = await supabase
    .from('game_performance')
    .insert([data]);
  if (error) console.error(error);
};