import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={24} color="#16A34A" />
            </View>
            <Text
              style={[
                styles.logoTitle,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Noklai
            </Text>
          </View>
          <Text
            style={[
              styles.logoTagline,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            Our Culture. Their Memories. Always With Them.
          </Text>
        </View>

        {/* Scenic Cultural Art Card */}
        <View
          style={[
            styles.scenicCard,
            {
              backgroundColor: isDarkMode ? '#1E2430' : '#EAF2EB',
              borderColor: isDarkMode ? '#2B3545' : '#D0E3D3',
            },
          ]}
        >
          {/* Mountain / Hills Visual Illustration with Native Icons */}
          <View style={styles.sceneryContainer}>
            <View style={styles.hillSun} />
            <View style={styles.mountainsRow}>
              <Ionicons name="triangle" size={110} color={isDarkMode ? '#243427' : '#C7DFC9'} style={styles.mountainLeft} />
              <Ionicons name="triangle" size={140} color={isDarkMode ? '#1B2C1F' : '#A9CFA9'} style={styles.mountainCenter} />
              <Ionicons name="triangle" size={110} color={isDarkMode ? '#243427' : '#B8D7B8'} style={styles.mountainRight} />
            </View>
            {/* Cultural traditional huts / village */}
            <View style={styles.villageRow}>
              <View style={styles.hutBadge}>
                <Ionicons name="home" size={24} color="#92400E" />
              </View>
              <View style={styles.hutBadge}>
                <Ionicons name="leaf" size={20} color="#15803D" />
              </View>
              <View style={styles.hutBadge}>
                <Ionicons name="home" size={22} color="#B45309" />
              </View>
            </View>
          </View>

          {/* Elders Portrait Card */}
          <View
            style={[
              styles.eldersCard,
              {
                backgroundColor: isDarkMode ? '#242C3B' : '#FFFFFF',
                borderColor: isDarkMode ? '#323E54' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.avatarPairRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.avatarEmoji}>👴</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#DCFCE7', marginLeft: -16 }]}>
                <Text style={styles.avatarEmoji}>👵</Text>
              </View>
            </View>
            <Text
              style={[
                styles.caringHeadline,
                { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
              ]}
            >
              Caring
            </Text>
            <Text
              style={[
                styles.caringSubline,
                { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
              ]}
            >
              for brighter tomorrows
            </Text>
          </View>
        </View>

        {/* Cultural Motto Banner */}
        <View style={styles.mottoRow}>
          <Ionicons name="heart" size={16} color="#EC4899" style={{ marginRight: 6 }} />
          <Text style={[styles.mottoText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
            Culture Connects. Care Continues.
          </Text>
        </View>

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
              style={{ marginTop: 14, alignItems: 'center', padding: 6 }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary,
                  textDecorationLine: 'underline',
                }}
              >
                Change Caregiver & Patient Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  scenicCard: {
    width: width - 44,
    borderRadius: noklaiTheme.radii.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sceneryContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hillSun: {
    position: 'absolute',
    top: 10,
    right: 30,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDE68A',
  },
  mountainsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  mountainLeft: {
    marginRight: -40,
    transform: [{ rotate: '5deg' }],
  },
  mountainCenter: {
    zIndex: 2,
  },
  mountainRight: {
    marginLeft: -40,
    transform: [{ rotate: '-5deg' }],
  },
  villageRow: {
    position: 'absolute',
    bottom: 6,
    flexDirection: 'row',
    gap: 16,
    zIndex: 5,
  },
  hutBadge: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  eldersCard: {
    width: '100%',
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 14,
  },
  avatarPairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  caringHeadline: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  caringSubline: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 4,
  },
  mottoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  mottoText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actionContainer: {
    width: '100%',
  },
});

