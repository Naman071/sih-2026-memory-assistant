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
  const { data, error } = await supabase
    .from('game_results')
    .insert([resultData]);
  if (error) console.error('Error saving game result:', error);
  return data;
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