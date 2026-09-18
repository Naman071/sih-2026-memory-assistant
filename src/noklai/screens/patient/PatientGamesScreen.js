import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import NoklaiHeader from '../../components/NoklaiHeader';

// Existing game components
import SuhTahLamGame from '../../../games/suhTahLam';
import UbilakapkiGame from '../../../games/ubilakapki/UbilakapkiGame';
import NortheastMemoryGame from '../../../games/NortheastMemoryGame';
import DhopkhelGame from '../../../games/DhopkhelGame';
import MemoryStoriesGame from '../../../games/MemoryStoriesGame';

export default function PatientGamesScreen({ onBack }) {
  const { isDarkMode } = useTheme();
  const { activePatientGame, setActivePatientGame, handleGameFinished, activePatientId } = useNoklai();

  // Listen to Android hardware back button when a game is active
  useEffect(() => {
    const onHardwareBack = () => {
      if (activePatientGame) {
        if (handleGameFinished) handleGameFinished();
        else setActivePatientGame(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => subscription.remove();
  }, [activePatientGame, handleGameFinished, setActivePatientGame]);

  const games = [
    {
      id: 'suhTahLam',
      title: '🎋 Suh Tah Lam',
      tagline: 'Observe the rhythm, remember the movement',
      category: 'Mizo Cultural Rhythm',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
      icon: 'musical-notes',
    },
    {
      id: 'ubilakapki',
      title: '🥥 Ubilakapki Coconut Toss',
      tagline: 'Watch the circle closely, remember the movement, and recall where the coconut goes.',
      category: 'CULTURAL MEMORY',
      badgeColor: '#B45309',
      badgeBg: '#FDE68A',
      icon: 'ellipse',
    },
    {
      id: 'northeast',
      title: '🏞️ Sinaki Sthan',
      tagline: 'Observe scenic photos and recall details',
      category: 'CULTURAL MEMORY',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      icon: 'images',
    },
    {
      id: 'dhopkhel',
      title: '⚽ Dhopkhel Ball Toss',
      tagline: 'Traditional Assamese ball catch & coordinate',
      category: 'Coordination & Focus',
      badgeColor: '#2563EB',
      badgeBg: '#DBEAFE',
      icon: 'football',
    },
    {
      id: 'stories',
      title: '📖 Xuworoni Kotha',
      tagline: 'Read traditional folklore and recall details',
      category: 'CULTURAL MEMORY',
      badgeColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      icon: 'book',
    },
  ];

  const handleExitGame = () => {
    if (handleGameFinished) {
      handleGameFinished();
    } else {
      setActivePatientGame(null);
    }
  };

  // If a game is active, render that interactive game with BOTH in-game onExit and persistent top bar back button!
  if (activePatientGame) {
    const currentPatientId = activePatientId || 'P001';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }}>
        <View style={styles.gameExitHeader}>
          <TouchableOpacity
            style={styles.gameExitButton}
            onPress={handleExitGame}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Exit game and return to games list"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            <Text style={styles.gameExitText}>Back to Games</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {activePatientGame === 'suhTahLam' && <SuhTahLamGame onExit={handleExitGame} patientId={currentPatientId} />}
          {activePatientGame === 'ubilakapki' && <UbilakapkiGame onExit={handleExitGame} patientId={currentPatientId} />}
          {activePatientGame === 'northeast' && <NortheastMemoryGame onExit={handleExitGame} patientId={currentPatientId} />}
          {activePatientGame === 'dhopkhel' && <DhopkhelGame onExit={handleExitGame} patientId={currentPatientId} />}
          {activePatientGame === 'stories' && <MemoryStoriesGame onExit={handleExitGame} patientId={currentPatientId} />}
        </View>
      </SafeAreaView>
    );
  }

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
      <NoklaiHeader title="Brain Games" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
          >
            Cultural Brain Exercises
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDarkMode ? noklaiTheme.colors.textSecondaryDark : noklaiTheme.colors.textSecondary },
            ]}
          >
            Select a friendly exercise to help keep your memory active, joyful, and connected.
          </Text>
        </View>

        <View style={styles.gamesList}>
          {games.map((g) => (
            <TouchableOpacity
              key={g.id}
              activeOpacity={0.85}
              onPress={() => setActivePatientGame(g.id)}
              style={[
                styles.gameCard,
                {
                  backgroundColor: isDarkMode ? '#1E232E' : '#FFFFFF',
                  borderColor: isDarkMode ? '#2D3545' : '#E8EAE3',
                },
                !isDarkMode && noklaiTheme.shadows.card,
              ]}
            >
              <View style={[styles.gameIconBadge, { backgroundColor: g.badgeBg }]}>
                <Ionicons name={g.icon} size={24} color={g.badgeColor} />
              </View>

              <View style={styles.gameContentCol}>
                <View style={styles.gameTitleRow}>
                  <Text
                    style={[
                      styles.gameTitle,
                      { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                    ]}
                  >
                    {g.title}
                  </Text>
                </View>

                <View style={[styles.categoryBadge, { backgroundColor: g.badgeBg }]}>
                  <Text style={[styles.categoryBadgeText, { color: g.badgeColor }]}>
                    {g.category}
                  </Text>
                </View>

                <Text style={styles.gameTagline}>{g.tagline}</Text>
              </View>

              <Ionicons
                name="play-circle"
                size={34}
                color={noklaiTheme.colors.patientGreen}
              />
            </TouchableOpacity>
          ))}
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
  gamesList: {
    gap: 14,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: noklaiTheme.radii.xl,
    borderWidth: 1.5,
  },
  gameIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gameContentCol: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gameTagline: {
    fontSize: 13,
    color: '#656F7D',
    lineHeight: 17,
  },
  gameExitHeader: {
    backgroundColor: '#1E242B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    zIndex: 100,
  },
  gameExitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gameExitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
