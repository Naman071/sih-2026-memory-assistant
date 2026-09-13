import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SequenceGame from '../games/SequenceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import SupermarketGame from '../games/SupermarketGame';
import SortingGame from '../games/SortingGame';
import MemoryPathGame from '../games/MemoryPathGame';
import DhopkhelGame from '../games/DhopkhelGame';
import MemoryStoriesGame from '../games/MemoryStoriesGame';
import SuhTahLamGame from '../games/suhTahLam';
import LanguageSelector from '../components/LanguageSelector';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const navigation = useNavigation();

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
            accessibilityLabel={`${t('games.memoryStoriesTitle')}, ${t('games.memoryStoriesSub')}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="book-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.memoryStoriesTitle')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.memoryStoriesSub')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('sequence')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="game-controller-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.sequence.title', 'Sequence Recall')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.sequence.tagline', 'Practice pattern recognition')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('memory')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="images-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.memoryMatch.title', 'Memory Match')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.memoryMatch.tagline', 'Find the matching card pairs')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('supermarket')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="cart-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.supermarket.title', 'Supermarket Run')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.supermarket.tagline', 'Remember and find items on your shopping list')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('sorting')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="list-circle-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.sorting.title', 'Category Sorting')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.sorting.tagline', 'Sort items into the right categories')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('path')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="footsteps-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.memoryPath.title', 'Memory Path')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>{t('games.memoryPath.tagline', 'Recall sequences and daily stories')}</Text>
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

  if (selectedGame === 'suhTahLam') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <SuhTahLamGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.headerBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder, justifyContent: 'space-between' }]}>
        <TouchableOpacity style={styles.headerBack} onPress={() => setSelectedGame(null)}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
          <Text style={[styles.headerBackText, { color: theme.primary }]}>{t('games.backToMenu')}</Text>
        </TouchableOpacity>
        <LanguageSelector compact={true} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 10 }}>
          {selectedGame === 'sequence' && <SequenceGame />}
          {selectedGame === 'memory' && <MemoryMatchGame />}
          {selectedGame === 'supermarket' && <SupermarketGame />}
          {selectedGame === 'sorting' && <SortingGame />}
          {selectedGame === 'path' && <MemoryPathGame />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
