/**
 * SUH TAH LAM - RecallGrid (Mode 4: Dancer Path Memory)
 *
 * 3x3 Spatial working memory grid:
 *   [ 1 ][ 2 ][ 3 ]
 *   [ 4 ][ 5 ][ 6 ]   (5 = Center between poles)
 *   [ 7 ][ 8 ][ 9 ]
 *
 * Fully reactive with useLanguage() so position chips, undo, reset, and confirm
 * immediately translate when the language is changed.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

export default function RecallGrid({
  targetPath = [5, 4, 1, 2],
  isDarkMode = false,
  onComplete,
}) {
  const { t, currentLanguage } = useLanguage();
  const [selectedPath, setSelectedPath] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCellPress = (pos) => {
    if (isSubmitted) return;
    if (selectedPath.length >= targetPath.length) return;

    setSelectedPath([...selectedPath, pos]);
  };

  const handleUndo = () => {
    if (isSubmitted || selectedPath.length === 0) return;
    setSelectedPath(selectedPath.slice(0, -1));
  };

  const handleReset = () => {
    if (isSubmitted) return;
    setSelectedPath([]);
  };

  const handleSubmit = () => {
    if (selectedPath.length === 0 || isSubmitted) return;
    setIsSubmitted(true);

    const correctCount = selectedPath.reduce((acc, pos, idx) => {
      return pos === targetPath[idx] ? acc + 1 : acc;
    }, 0);

    const isFullMatch = correctCount === targetPath.length && selectedPath.length === targetPath.length;
    const accuracy = Math.round((correctCount / targetPath.length) * 100) / 100;

    onComplete && onComplete({
      chosenPath: selectedPath,
      correctPath: targetPath,
      isCorrect: isFullMatch,
      accuracy,
    });
  };

  const isComplete = selectedPath.length === targetPath.length;
  const isCorrect = isSubmitted && JSON.stringify(selectedPath) === JSON.stringify(targetPath);

  return (
    <View style={styles.container}>
      {/* Title & Instructions */}
      <View style={[styles.instructionCard, isDarkMode && styles.cardDark]}>
        <View style={styles.instructionHeader}>
          <Ionicons name="footsteps-outline" size={24} color="#7C3AED" style={{ marginRight: 8 }} />
          <Text style={[styles.instructionDomain, isDarkMode && styles.domainDark]}>
            {t('games.suhTahLam.domains.spatial', 'Spatial Path Memory')}
          </Text>
        </View>
        <Text style={[styles.instructionTitle, isDarkMode && styles.textDark]}>
          {t('games.suhTahLam.pathInstruction', "Tap the squares to recreate the dancer's path")}
        </Text>
        <Text style={[styles.pathTargetSub, isDarkMode && styles.subDark]}>
          {t('games.suhTahLam.stepsCount', 'Expected steps')}: {selectedPath.length} / {targetPath.length}
        </Text>
      </View>

      {/* Path Breadcrumbs */}
      <View style={styles.breadcrumbRow}>
        {targetPath.map((_, index) => {
          const chosenPos = selectedPath[index];
          return (
            <View
              key={`bread_${index}`}
              style={[
                styles.breadcrumbChip,
                chosenPos ? styles.breadcrumbFilled : styles.breadcrumbEmpty,
              ]}
            >
              <Text style={[styles.breadcrumbText, chosenPos && styles.breadcrumbTextFilled]}>
                {chosenPos ? t('games.suhTahLam.positions.posShort', `Pos ${chosenPos}`, { pos: chosenPos }) : '?'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 3x3 Spatial Grid */}
      <View style={[styles.gridContainer, isDarkMode && styles.gridContainerDark]}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ].map((row, rowIdx) => (
          <View key={`row_${rowIdx}`} style={styles.gridRow}>
            {row.map((pos) => {
              const stepIndex = selectedPath.indexOf(pos);
              const isSelected = stepIndex !== -1;
              const isCenter = pos === 5;

              return (
                <TouchableOpacity
                  key={`cell_${pos}`}
                  style={[
                    styles.gridCell,
                    isCenter && styles.centerCell,
                    isSelected && styles.selectedCell,
                    isDarkMode && styles.gridCellDark,
                  ]}
                  onPress={() => handleCellPress(pos)}
                  disabled={isSubmitted}
                  accessibilityRole="button"
                  accessibilityLabel={`Position ${pos}`}
                >
                  <Text style={[styles.cellNumber, isSelected && styles.cellNumberSelected]}>
                    {pos}
                  </Text>
                  {isCenter && !isSelected && (
                    <Text style={styles.centerLabel}>
                      {t('games.suhTahLam.positions.centerLabel', 'CENTER')}
                    </Text>
                  )}
                  {isSelected && (
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{stepIndex + 1}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Action Controls: Undo / Clear / Submit */}
      {!isSubmitted ? (
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.smallBtn, styles.undoBtn]}
            onPress={handleUndo}
            disabled={selectedPath.length === 0}
          >
            <Ionicons name="arrow-undo-outline" size={20} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.smallBtnText}>{t('common.undo', 'Undo')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallBtn, styles.resetBtn]}
            onPress={handleReset}
            disabled={selectedPath.length === 0}
          >
            <Ionicons name="refresh-outline" size={20} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={[styles.smallBtnText, { color: '#DC2626' }]}>{t('common.reset', 'Reset')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, !isComplete && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isComplete}
          >
            <Text style={styles.submitBtnText}>{t('common.confirm', 'Confirm Path')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.resultBanner, isCorrect ? styles.resultCorrect : styles.resultEncourage]}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'heart'}
            size={24}
            color={isCorrect ? '#15803D' : '#92400E'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.resultText, isCorrect ? styles.resultTextCorrect : styles.resultTextEncourage]}>
            {isCorrect
              ? t('games.suhTahLam.feedback.pathPerfect', 'Excellent path memory! Exactly right.')
              : t('games.suhTahLam.feedback.pathGood', 'Good effort remembering the steps!')}
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
  instructionCard: {
    width: '100%',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  cardDark: {
    backgroundColor: '#1E1B4B',
    borderColor: '#3730A3',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructionDomain: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  domainDark: {
    color: '#A78BFA',
  },
  instructionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
  },
  pathTargetSub: {
    fontSize: 14,
    color: '#6D28D9',
    marginTop: 4,
    fontWeight: '600',
  },
  textDark: {
    color: '#F8FAFC',
  },
  subDark: {
    color: '#C4B5FD',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
  },
  breadcrumbChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  breadcrumbEmpty: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  breadcrumbFilled: {
    backgroundColor: '#7C3AED',
    borderColor: '#6D28D9',
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  breadcrumbTextFilled: {
    color: '#FFFFFF',
  },
  gridContainer: {
    width: 270,
    height: 270,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  gridContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCell: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  gridCellDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  centerCell: {
    borderColor: '#F59E0B',
    borderWidth: 2.5,
  },
  selectedCell: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  cellNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#334155',
  },
  cellNumberSelected: {
    color: '#FFFFFF',
  },
  centerLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  stepBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF08A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#854D0E',
  },
  controlRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
    gap: 10,
    alignItems: 'center',
  },
  smallBtn: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  undoBtn: {
    flex: 1,
  },
  resetBtn: {
    flex: 1,
  },
  smallBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  submitBtn: {
    flex: 2,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
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
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
  },
  resultCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  resultEncourage: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultTextCorrect: {
    color: '#15803D',
  },
  resultTextEncourage: {
    color: '#92400E',
  },
});
