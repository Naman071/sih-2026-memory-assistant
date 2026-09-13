/**
 * UBILAKAPKI - Pause & Navigation Confirmation Dialog
 * 
 * Dementia-friendly pause & exit confirmation modal:
 * - "Leave this game?" confirmation dialog preventing accidental departures
 * - "Yes, Exit" & "Continue" buttons with large touch targets
 * - Reassuring note that progress is safely preserved
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

export function PauseMenu({ visible, onResume, onExit }) {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onResume}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="help-circle-outline" size={44} color="#B45309" />
          </View>

          <Text style={styles.dialogTitle}>
            {t('games.ubilakapki.leaveGameTitle') || 'Leave this game?'}
          </Text>

          <Text style={styles.dialogDescription}>
            {t('games.ubilakapki.leaveGameSubtitle') ||
              'Your exercise progress is safely preserved. Would you like to keep playing or return to the menu?'}
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onResume}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('games.ubilakapki.continuePlaying') || 'Continue Playing'}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>
                {t('games.ubilakapki.continuePlaying') || 'Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={onExit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('games.ubilakapki.yesExit') || 'Yes, Exit'}
            >
              <Text style={styles.exitButtonText}>
                {t('games.ubilakapki.yesExit') || 'Yes, Exit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  dialogDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 20,
    gap: 8,
    elevation: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  exitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    minHeight: 52,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  exitButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
});

