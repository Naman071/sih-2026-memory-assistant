import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';
import QuoteCard from '../../components/QuoteCard';
import { getFamilyMembers } from '../../../modules/database';

const DEFAULT_FAMILY = [
  {
    id: 'f1',
    name: 'Rahul',
    relation: 'Grandson',
    age: 19,
    avatar: '👦',
    phone: '+91 98765 43210',
    notes: 'Studying in college in Guwahati. Loves football and visits every festival!',
  },
  {
    id: 'f2',
    name: 'Priya',
    relation: 'Daughter',
    age: 44,
    avatar: '👩',
    phone: '+91 98765 43211',
    notes: 'Calls every evening at 6:00 PM. Made the traditional bamboo pickle you love.',
  },
  {
    id: 'f3',
    name: 'Anand',
    relation: 'Brother',
    age: 69,
    avatar: '👨',
    phone: '+91 98765 43212',
    notes: 'Lives nearby in the village. Enjoys morning walks and sharing old tales.',
  },
];

export default function PatientMemoriesScreen() {
  const { isDarkMode } = useTheme();
  const { activePatient } = useNoklai();

  const [family, setFamily] = useState(DEFAULT_FAMILY);

  useEffect(() => {
    async function loadFamily() {
      try {
        const data = await getFamilyMembers(activePatient.id);
        if (data && data.length > 0) {
          setFamily(data);
        }
      } catch (e) {
        // use default fallback
      }
    }
    loadFamily();
  }, [activePatient.id]);

  const handleCallMember = (member) => {
    Alert.alert('Call Loved One', `Dialing ${member.name} (${member.relation})...`, [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.backgroundDark
            : noklaiTheme.colors.background,
        },
      ]}
    >
      <NoklaiHeader title="Family & Memories" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Your Loved Ones
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            People who love and care for you. Tap to call or remember cherished stories.
          </Text>
        </View>

        {/* Family Cards */}
        <View style={styles.familyList}>
          {family.map((member) => (
            <View
              key={member.id}
              style={[
                styles.memberCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
                !isDarkMode && noklaiTheme.shadows.card,
              ]}
            >
              <View style={styles.topRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={{ fontSize: 32 }}>{member.avatar || '👤'}</Text>
                </View>

                <View style={styles.memberInfoCol}>
                  <Text
                    style={[
                      styles.memberName,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    {member.name}
                  </Text>
                  <View style={styles.relationBadge}>
                    <Text style={styles.relationText}>{member.relation || member.relationship}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callCircleButton}
                  onPress={() => handleCallMember(member)}
                  accessibilityLabel={`Call ${member.name}`}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {member.notes && (
                <View
                  style={[
                    styles.memoryNoteBox,
                    {
                      backgroundColor: isDarkMode ? '#18241D' : '#F2FAF4',
                      borderColor: isDarkMode ? '#23442E' : '#D1EAD8',
                    },
                  ]}
                >
                  <Ionicons name="heart" size={16} color="#16A34A" style={{ marginRight: 8, marginTop: 1 }} />
                  <Text
                    style={[
                      styles.memoryNoteText,
                      { color: isDarkMode ? '#A7F3D0' : '#14532D' },
                    ]}
                  >
                    {member.notes}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <QuoteCard
          quote="Every smile remembers love."
          author="Noklai Family"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBox: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  familyList: {
    gap: 14,
  },
  memberCard: {
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  memberInfoCol: {
    flex: 1,
  },
  memberName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 3,
  },
  relationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0ECF9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relationText: {
    color: '#5B409E',
    fontWeight: '700',
    fontSize: 12,
  },
  callCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: noklaiTheme.radii.lg,
    borderWidth: 1,
    marginTop: 12,
  },
  memoryNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

