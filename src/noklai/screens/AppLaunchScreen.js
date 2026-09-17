import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../theme/noklaiTheme';
import { useTheme } from '../../context/ThemeContext';
import { useNoklai } from '../context/NoklaiContext';
import NoklaiButton from '../components/NoklaiButton';

const { width } = Dimensions.get('window');

export default function AppLaunchScreen() {
  const { isDarkMode } = useTheme();
  const { setCurrentStep, hasCompletedSetup } = useNoklai();

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
      {/* Background Cultural Hero Image with Low Transparency */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image
          source={require('../../../assets/launch_hero.jpg')}
          style={[
            styles.backgroundImage,
            {
              // Low transparency (high opacity ~0.85) so the scenic mountains and elders are rich & vibrant
              opacity: isDarkMode ? 0.82 : 0.85,
            },
          ]}
          resizeMode="cover"
        />
        {/* Soft Vignette Overlay to maintain contrast for top brand and bottom action cards */}
        <View
          style={[
            styles.vignetteOverlay,
            {
              backgroundColor: isDarkMode
                ? 'rgba(15, 23, 42, 0.40)'
                : 'rgba(255, 255, 255, 0.20)',
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Brand Header Pill */}
        <View
          style={[
            styles.brandCard,
            {
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
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

        {/* Scenic Center Space - Unobstructed view of the grandparents and Himalayan mountains */}
        <View style={styles.heroSpace} />

        {/* Bottom Card with Cultural Motto & Get Started Button */}
        <View
          style={[
            styles.bottomCard,
            {
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
            },
          ]}
        >
          {/* Motto Badge */}
          <View
            style={[
              styles.mottoBadge,
              {
                backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.15)' : 'rgba(22, 163, 74, 0.12)',
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
              { color: isDarkMode ? '#CBD5E1' : '#4B5563' },
            ]}
          >
            A culturally familiar memory assistance platform for elderly people and their caregivers.
          </Text>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <NoklaiButton
              title="Get Started"
              variant="primary"
              size="lg"
              iconRight="arrow-forward"
              onPress={() => setCurrentStep(hasCompletedSetup ? 'role_select' : 'login')}
            />
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
                  Change Caregiver & Patient Details
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100%',
  },
  brandCard: {
    width: width - 40,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  heroSpace: {
    flex: 1,
    minHeight: 180,
  },
  bottomCard: {
    width: width - 40,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  mottoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  mottoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  caringHeadline: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  caringSubline: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 18,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
  },
});
