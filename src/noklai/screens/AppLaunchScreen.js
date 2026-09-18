import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';
import { useNoklai } from '../context/NoklaiContext';
import NoklaiButton from '../components/NoklaiButton';

export default function AppLaunchScreen() {
  const { isDarkMode } = useTheme();
  const { width, height } = useWindowDimensions();
  const { setCurrentStep, selectRole, hasCompletedSetup } = useNoklai();

  const contentWidth = Math.min(width - 32, 480);
  const heroHeight = Math.min(Math.max(height * 0.28, 160), 240);

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Brand Header */}
        <View
          style={[
            styles.brandCard,
            {
              width: contentWidth,
              backgroundColor: isDarkMode
                ? noklaiTheme.colors.cardBackgroundDark
                : noklaiTheme.colors.cardBackground,
              borderColor: isDarkMode
                ? noklaiTheme.colors.borderDark
                : noklaiTheme.colors.border,
            },
          ]}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={24} color="#16A34A" />
            </View>
            <Text
              style={[
                styles.logoTitle,
                { color: isDarkMode ? '#4ADE80' : '#15803D' },
              ]}
            >
              Noklai
            </Text>
          </View>
          <Text
            style={[
              styles.logoTagline,
              { color: isDarkMode ? '#CBD5E1' : '#374151' },
            ]}
          >
            Our Culture. Their Memories. Always With Them.
          </Text>
        </View>

        {/* Hero Illustration / Photo Card - Properly Framed & Proportioned */}
        <View
          style={[
            styles.heroCard,
            {
              width: contentWidth,
              height: heroHeight,
              backgroundColor: isDarkMode ? '#1E293B' : '#DCFCE7',
              borderColor: isDarkMode ? '#334155' : '#BBF7D0',
            },
          ]}
        >
          <Image
            source={require('../../../assets/launch_hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Action & Welcome Card */}
        <View
          style={[
            styles.bottomCard,
            {
              width: contentWidth,
              backgroundColor: isDarkMode
                ? noklaiTheme.colors.cardBackgroundDark
                : noklaiTheme.colors.cardBackground,
              borderColor: isDarkMode
                ? noklaiTheme.colors.borderDark
                : noklaiTheme.colors.border,
            },
          ]}
        >
          {/* Motto Badge */}
          <View
            style={[
              styles.mottoBadge,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(74, 222, 128, 0.15)'
                  : 'rgba(22, 163, 74, 0.12)',
              },
            ]}
          >
            <Ionicons name="heart" size={14} color={isDarkMode ? '#4ADE80' : '#16A34A'} />
            <Text
              style={[
                styles.mottoText,
                { color: isDarkMode ? '#4ADE80' : '#15803D' },
              ]}
            >
              Culture Connects. Care Continues.
            </Text>
          </View>

          <Text
            style={[
              styles.caringHeadline,
              { color: isDarkMode ? '#F8FAFC' : '#111827' },
            ]}
          >
            Memory & Care Platform
          </Text>
          <Text
            style={[
              styles.caringSubline,
              { color: isDarkMode ? '#94A3B8' : '#64748B' },
            ]}
          >
            Culturally familiar memory exercises and continuous daily tracking for elders and caregivers.
          </Text>

          {/* Primary Action Button */}
          <View style={styles.actionContainer}>
            <NoklaiButton
              title="Get Started"
              variant="primary"
              size="lg"
              iconRight="arrow-forward"
              onPress={() => setCurrentStep(hasCompletedSetup ? 'role_select' : 'login')}
            />

            {/* Quick Direct Role Buttons */}
            <View style={styles.quickRolesRow}>
              <TouchableOpacity
                onPress={() => selectRole('caregiver')}
                style={[
                  styles.quickRoleBtn,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="shield-checkmark" size={18} color="#5B409E" />
                <Text style={[styles.quickRoleText, { color: isDarkMode ? '#E2E8F0' : '#1E293B' }]}>
                  Caregiver
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selectRole('patient')}
                style={[
                  styles.quickRoleBtn,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={18} color="#16A34A" />
                <Text style={[styles.quickRoleText, { color: isDarkMode ? '#E2E8F0' : '#1E293B' }]}>
                  Senior / Patient
                </Text>
              </TouchableOpacity>
            </View>

            {hasCompletedSetup && (
              <TouchableOpacity
                onPress={() => setCurrentStep('login')}
                style={{ marginTop: 12, alignItems: 'center', padding: 6 }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDarkMode ? '#94A3B8' : '#64748B',
                    textDecorationLine: 'underline',
                  }}
                >
                  Change Profile Details
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  brandCard: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mottoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  mottoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  caringHeadline: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  caringSubline: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
  },
  quickRolesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  quickRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickRoleText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
