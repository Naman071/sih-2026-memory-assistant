import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { addFamilyMember } from '../modules/database';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AddFamilyMemberModal({ visible, onClose, patientId, onAdded }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!name.trim() || !relationship.trim()) {
      setError(t('memories.nameRelRequired') || 'Name and relationship are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newMember = {
        patient_id: patientId,
        name: name.trim(),
        relationship: relationship.trim(),
        description: description.trim(),
        phone: phone.trim(),
        photo_url: photoUrl.trim() || 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Family'
      };

      await addFamilyMember(newMember);
      
      // Reset form
      setName('');
      setRelationship('');
      setDescription('');
      setPhone('');
      setPhotoUrl('');
      
      onAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add family member:', err);
      setError(err.message || t('memories.addFailed') || 'Failed to add family member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackground}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <ScrollView>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('memories.addMemberModalTitle') || 'Add Family Member'}
            </Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={[styles.label, { color: theme.text }]}>
              {t('memories.nameLabel') || 'Name *'}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
              value={name}
              onChangeText={setName}
              placeholder={t('memories.namePlaceholder') || 'e.g. Rahul Sharma'}
              placeholderTextColor={theme.subText}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              {t('memories.relLabel') || 'Relationship *'}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
              value={relationship}
              onChangeText={setRelationship}
              placeholder={t('memories.relPlaceholder') || 'e.g. Son, Daughter, Spouse'}
              placeholderTextColor={theme.subText}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              {t('memories.descLabel') || 'Description (optional)'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.cardBorder }]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('memories.descPlaceholder') || 'e.g. Visits every Sunday'}
              placeholderTextColor={theme.subText}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              {t('memories.phoneLabel') || 'Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('memories.phonePlaceholder') || 'e.g. +91 98765 43210'}
              placeholderTextColor={theme.subText}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: theme.text }]}>
              {t('memories.photoLabel') || 'Photo URL (optional)'}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
              value={photoUrl}
              onChangeText={setPhotoUrl}
              placeholder={t('memories.photoPlaceholder') || 'https://example.com/photo.jpg'}
              placeholderTextColor={theme.subText}
              keyboardType="url"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>{t('common.save') || 'Save'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 84,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    gap: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

