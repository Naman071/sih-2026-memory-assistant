import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function LanguageSelector({ compact = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const { theme, isDarkMode } = useTheme();

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  const handleSelectLanguage = (langCode) => {
    changeLanguage(langCode);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Change language"
        accessibilityHint="Opens language selection dialog"
        style={[
          styles.triggerButton,
          compact ? styles.compactButton : styles.normalButton,
          {
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderColor: theme.border || '#e5e7eb',
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="language"
          size={compact ? 18 : 20}
          color={theme.primary || '#2563eb'}
          style={styles.globeIcon}
        />
        <Text
          style={[
            styles.triggerText,
            { color: theme.text },
            compact && styles.compactText,
          ]}
        >
          {currentLangObj.nativeLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.cardBackground || '#ffffff',
                borderColor: theme.cardBorder || '#e5e7eb',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('common.selectLanguage') || 'Select Language'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                accessibilityLabel="Close"
              >
                <Ionicons name="close-circle" size={28} color={theme.subText || '#6b7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {languages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleSelectLanguage(lang.code)}
                    activeOpacity={0.7}
                    style={[
                      styles.languageOption,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? '#1e3a8a'
                            : '#dbeafe'
                          : isDarkMode
                          ? '#2a3447'
                          : '#f9fafb',
                        borderColor: isSelected
                          ? theme.primary || '#2563eb'
                          : theme.border || '#e5e7eb',
                      },
                    ]}
                  >
                    <View style={styles.langInfo}>
                      <Text
                        style={[
                          styles.nativeName,
                          {
                            color: isSelected ? theme.primary || '#2563eb' : theme.text,
                            fontWeight: isSelected ? 'bold' : '600',
                          },
                        ]}
                      >
                        {lang.nativeLabel}
                      </Text>
                      <Text style={[styles.englishName, { color: theme.subText || '#6b7280' }]}>
                        {lang.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={theme.primary || '#2563eb'}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  normalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  compactButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  globeIcon: {
    marginRight: 4,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: 18,
  },
  englishName: {
    fontSize: 13,
    marginTop: 2,
  },
});

