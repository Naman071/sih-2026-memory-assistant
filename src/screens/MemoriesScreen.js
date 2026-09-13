import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFamilyMembers } from '../modules/database';
import AddFamilyMemberModal from '../components/AddFamilyMemberModal';

export default function MemoriesScreen() {
  const { patientId } = usePatient();
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFamily = async () => {
    try {
      setLoading(true);
      console.log(`MemoriesScreen: patientId = ${patientId}`);
      if (!patientId) {
        setFamily([]);
        return;
      }
      const data = await getFamilyMembers(patientId);
      console.log(`MemoriesScreen: family =`, data);
      setFamily(data || []);
    } catch (error) {
      console.error('MemoriesScreen: Error fetching family:', error);
      setFamily([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [patientId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subText }]}>
          {t('memories.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const familyList = family || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('memories.title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>
              {familyList.length === 1
                ? t('memories.membersSavedOne')
                : t('memories.membersSavedMany', { count: familyList.length })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('common.add') || 'Add'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={familyList}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              {item.photo_url && !item.photo_url.includes('placeholder') ? (
                <Image source={{ uri: item.photo_url }} style={styles.image} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
                  <Ionicons name="person" size={34} color={theme.primary} />
                </View>
              )}
              <View style={styles.info}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  {item.relationship ? (
                    <View style={styles.relationPill}>
                      <Text style={[styles.relationText, { color: theme.primary }]}>{item.relationship}</Text>
                    </View>
                  ) : null}
                </View>

                {item.phone ? (
                  <View style={styles.phonePill}>
                    <Ionicons name="call" size={13} color={isDarkMode ? '#34D399' : '#059669'} style={{ marginRight: 5 }} />
                    <Text style={[styles.phoneText, { color: isDarkMode ? '#34D399' : '#059669' }]}>{item.phone}</Text>
                  </View>
                ) : null}

                {item.description ? (
                  <Text style={[styles.description, { color: theme.subText }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.subText} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t('memories.emptyTitle')}
              </Text>
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {t('memories.emptyText')}
              </Text>
            </View>
          }
        />

        <AddFamilyMemberModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          patientId={patientId}
          onAdded={loadFamily}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
    marginTop: 4,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginRight: 16,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  relationPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  relationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  phonePill: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  phoneText: {
     
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});