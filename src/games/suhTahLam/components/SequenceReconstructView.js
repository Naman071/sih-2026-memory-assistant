/**
 * SUH TAH LAM - SequenceReconstructView (Mode 6: Reconstruct the Sequence)
 *
 * Sequence slot builder:
 *   [ ? ] [ ? ] [ ? ]
 * Selectable action chips:
 *   OPEN, CLOSE, STEP LEFT, STEP RIGHT, TURN, CENTER STEP
 *
 * Fully reactive with useLanguage() so action chips and buttons update instantly
 * when the user switches the app language.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

const ACTION_CHIPS_DATA = [
  { id: 'OPEN', key: 'games.suhTahLam.actions.open', fallback: 'OPEN' },
  { id: 'CLOSE', key: 'games.suhTahLam.actions.close', fallback: 'CLOSE' },
  { id: 'STEP LEFT', key: 'games.suhTahLam.actions.step_left', fallback: 'STEP LEFT' },
  { id: 'STEP RIGHT', key: 'games.suhTahLam.actions.step_right', fallback: 'STEP RIGHT' },
  { id: 'TURN', key: 'games.suhTahLam.actions.turn', fallback: 'TURN' },
  { id: 'CENTER STEP', key: 'games.suhTahLam.actions.step_center', fallback: 'CENTER STEP' },
];

export default function SequenceReconstructView({
  reconstructConfig,
  isDarkMode = false,
  onComplete,
}) {
  const { t, currentLanguage } = useLanguage();
  const config = reconstructConfig || {
    targetSlots: ['OPEN', 'STEP LEFT', 'CLOSE'],
    availableOptions: ['OPEN', 'CLOSE', 'STEP LEFT', 'STEP RIGHT', 'TURN', 'CENTER STEP'],
  };

  const targetLength = config.targetSlots.length;
  const [filledSlotIds, setFilledSlotIds] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getActionLabel = (actionId) => {
    const found = ACTION_CHIPS_DATA.find((c) => c.id === actionId);
    return found ? t(found.key, found.fallback) : actionId;
  };

  const handleAddAction = (actionId) => {
    if (isSubmitted || filledSlotIds.length >= targetLength) return;
    setFilledSlotIds([...filledSlotIds, actionId]);
  };

  const handleRemoveSlot = (index) => {
    if (isSubmitted) return;
    setFilledSlotIds(filledSlotIds.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (isSubmitted) return;
    setFilledSlotIds([]);
  };

  const handleSubmit = () => {
    if (filledSlotIds.length === 0 || isSubmitted) return;
    setIsSubmitted(true);

    const matches = filledSlotIds.reduce((count, actionId, i) => {
      return actionId === config.targetSlots[i] ? count + 1 : count;
    }, 0);

    const isFullMatch = matches === targetLength && filledSlotIds.length === targetLength;
    const accuracy = Math.round((matches / targetLength) * 100) / 100;

    onComplete && onComplete({
      chosenSequence: filledSlotIds,
      correctSequence: config.targetSlots,
      isCorrect: isFullMatch,
      accuracy,
    });
  };

  const isFull = filledSlotIds.length === targetLength;
  const isCorrect =
    isSubmitted && JSON.stringify(filledSlotIds) === JSON.stringify(config.targetSlots);

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <View style={styles.headerRow}>
          <Ionicons name="git-commit-outline" size={24} color="#EA580C" style={{ marginRight: 8 }} />
          <Text style={[styles.domainTitle, isDarkMode && styles.domainTitleDark]}>
            {t('games.suhTahLam.domains.reconstruct', 'Sequence Reconstruction')}
          </Text>
        </View>
        <Text style={[styles.promptTitle, isDarkMode && styles.textDark]}>
          {t('games.suhTahLam.reconstructInstruction', 'Put the actions in the order they happened')}
        </Text>
        <Text style={[styles.slotCounter, isDarkMode && styles.slotCounterDark]}>
          {t('games.suhTahLam.slotsFilled', 'Slots filled')}: {filledSlotIds.length} / {targetLength}
        </Text>
      </View>

      {/* Slots Display */}
      <View style={styles.slotsContainer}>
        {config.targetSlots.map((_, idx) => {
          const actionId = filledSlotIds[idx];
          const actionLabel = actionId ? getActionLabel(actionId) : null;
          return (
            <TouchableOpacity
              key={`slot_${idx}`}
              style={[
                styles.slotBox,
                actionId ? styles.slotBoxFilled : styles.slotBoxEmpty,
                isDarkMode && styles.slotBoxDark,
              ]}
              onPress={() => actionId && handleRemoveSlot(idx)}
              disabled={isSubmitted}
              activeOpacity={0.7}
            >
              <Text style={styles.slotNumberBadge}>{idx + 1}</Text>
              <Text style={[styles.slotActionText, actionId && styles.slotActionTextFilled]}>
                {actionLabel || '?'}
              </Text>
              {actionId && !isSubmitted && (
                <Ionicons name="close-circle" size={16} color="#94A3B8" style={styles.removeIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Available Action Chips */}
      <Text style={[styles.optionsHeader, isDarkMode && styles.textDark]}>
        {t('games.suhTahLam.tapToAdd', 'Tap an action to add it:')}
      </Text>
      <View style={styles.chipsContainer}>
        {ACTION_CHIPS_DATA.map((opt) => (
          <TouchableOpacity
            key={`chip_${opt.id}`}
            style={[styles.actionChip, isDarkMode && styles.chipDark]}
            onPress={() => handleAddAction(opt.id)}
            disabled={isSubmitted || isFull}
            activeOpacity={0.75}
          >
            <Ionicons
              name={opt.id.includes('OPEN') ? 'scan-outline' : opt.id.includes('CLOSE') ? 'contract-outline' : 'footsteps'}
              size={18}
              color={isDarkMode ? '#CBD5E1' : '#475569'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.chipText, isDarkMode && styles.textDark]}>
              {t(opt.key, opt.fallback)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Controls: Clear / Submit */}
      {!isSubmitted ? (
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            disabled={filledSlotIds.length === 0}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.clearBtnText}>{t('common.clear', 'Clear')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, !isFull && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isFull}
          >
            <Text style={styles.submitBtnText}>{t('common.confirm', 'Confirm Order')}</Text>
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.feedbackCard, isCorrect ? styles.feedbackCorrect : styles.feedbackEncourage]}>
          <Ionicons
            name={isCorrect ? 'sparkles' : 'heart'}
            size={24}
            color={isCorrect ? '#15803D' : '#92400E'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextEncourage]}>
            {isCorrect
              ? t('games.suhTahLam.feedback.reconstructPerfect', 'Remarkable sequence recall! You reconstructed it perfectly.')
              : t('games.suhTahLam.feedback.reconstructGood', 'Great attempt! Remembering sequential actions takes practice.')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  cardDark: {
    backgroundColor: '#431407',
    borderColor: '#7C2D12',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  domainTitleDark: {
    color: '#FB923C',
  },
  promptTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotCounter: {
    fontSize: 14,
    color: '#C2410C',
    marginTop: 4,
    fontWeight: '600',
  },
  slotCounterDark: {
    color: '#FDBA74',
  },
  textDark: {
    color: '#F8FAFC',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  slotBox: {
    minWidth: 80,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative',
  },
  slotBoxEmpty: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  slotBoxFilled: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  slotBoxDark: {
    backgroundColor: '#1E293B',
  },
  slotNumberBadge: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  slotActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  slotActionTextFilled: {
    color: '#C2410C',
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  optionsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: 18,
  },
  actionChip: {
    height: 52, // Large touch target
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  controlRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 6,
  },
  clearBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  submitBtn: {
    flex: 2,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
  },
  feedbackCorrect: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feedbackEncourage: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackTextCorrect: {
    color: '#15803D',
  },
  feedbackTextEncourage: {
    color: '#92400E',
  },
});
