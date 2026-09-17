import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DhopkhelGame from '../games/DhopkhelGame';
import MemoryStoriesGame from '../games/MemoryStoriesGame';
import SuhTahLamGame from '../games/suhTahLam';
import UbilakapkiGame from '../games/ubilakapki/UbilakapkiGame';
import NortheastMemoryGame from '../games/NortheastMemoryGame';
import LanguageSelector from '../components/LanguageSelector';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();

  React.useEffect(() => {
    if (route?.params?.game) {
      setSelectedGame(route.params.game);
    }
  }, [route?.params?.game]);

  if (!selectedGame) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: theme.text, marginTop: 20 }}>
            {t('games.title')}
          </Text>
          
          <Text style={{ fontSize: 16, color: theme.subText, marginBottom: 20 }}>
            {t('games.selectExercise', 'Select an exercise to help maintain cognitive function and memory.')}
          </Text>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('suhTahLam')}
            accessibilityRole="button"
            accessibilityLabel={`${t('games.suhTahLam.title', 'SUH TAH LAM')}, ${t('games.suhTahLam.tagline', 'Observe the rhythm, remember the movement.')}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
              <Ionicons name="musical-notes-outline" size={24} color="#D97706" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[styles.menuCardTitle, { color: theme.text, marginBottom: 0 }]}>
                  {t('games.suhTahLam.title', 'SUH TAH LAM')}
                </Text>
                <View style={{ backgroundColor: isDarkMode ? '#3B2716' : '#FDE68A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDarkMode ? '#FDE68A' : '#92400E' }}>
                    {t('games.suhTahLam.culturalCategory', 'CULTURAL MEMORY')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>
                {t('games.suhTahLam.tagline', 'Observe the rhythm, remember the movement.')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          {/* UBILAKAPKI (Coconut Passing Game) */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('ubilakapki')}
            accessibilityRole="button"
            accessibilityLabel={`${t('games.ubilakapki.title', 'Ubilakapki Coconut Toss')}, ${t('games.ubilakapki.tagline', 'Watch the circle closely, remember the movement, and recall where the coconut goes.')}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
              <Ionicons name="ellipse-outline" size={24} color="#B45309" />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[styles.menuCardTitle, { color: theme.text, marginBottom: 0 }]}>
                  {t('games.ubilakapki.title', '🥥 Ubilakapki Coconut Toss')}
                </Text>
                <View style={{ backgroundColor: isDarkMode ? '#3B2716' : '#FDE68A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDarkMode ? '#FDE68A' : '#92400E' }}>
                    {t('games.suhTahLam.culturalCategory', 'CULTURAL MEMORY')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>
                {t('games.ubilakapki.tagline', 'Watch the circle closely, remember the movement, and recall where the coconut goes.')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          {/* SINAKI STHAN (PHOTO MEMORY) */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('northeast')}
            accessibilityRole="button"
            accessibilityLabel={`${t('games.northeastTitle', '🏞️ Sinaki Sthan')}, ${t('games.northeastSub', 'Observe scenic photos & recall details')}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
              <Ionicons name="image-outline" size={24} color="#059669" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>
                {t('games.northeastTitle', '🏞️ Sinaki Sthan')}
              </Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>
                {t('games.northeastSub', 'Observe scenic photos & recall details')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('dhopkhel')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#14532D' : '#DCFCE7' }]}>
              <Ionicons name="sparkles" size={24} color="#15803D" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.dhopkhel.title')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.dhopkhel.tagline')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('stories')}
            accessibilityRole="button"
            accessibilityLabel={`${t('games.memoryStoriesTitle', '📖 Xuworoni Kotha')}, ${t('games.memoryStoriesSub', 'Read traditional stories and recall details')}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="book-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[styles.menuCardTitle, { color: theme.text, marginBottom: 0 }]}>
                  {t('games.memoryStoriesTitle', '📖 Xuworoni Kotha')}
                </Text>
                <View style={{ backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDarkMode ? '#DBEAFE' : '#1E40AF' }}>
                    {t('games.suhTahLam.culturalCategory', 'CULTURAL MEMORY')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>
                {t('games.memoryStoriesSub', 'Read short stories and recall details')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.cardBorder, marginTop: 10 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} style={{ marginRight: 8 }} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'suhTahLam') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <SuhTahLamGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  if (selectedGame === 'ubilakapki') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <UbilakapkiGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  if (selectedGame === 'northeast') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <NortheastMemoryGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  if (selectedGame === 'dhopkhel') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <DhopkhelGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  if (selectedGame === 'stories') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <MemoryStoriesGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  return null;
}


const styles = StyleSheet.create({
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuCardSub: {
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
