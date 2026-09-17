/**
 * HANDMADE STORYBOOK COMPONENT - Xuworoni Kotha (Memory Stories)
 * 
 * Authentic Traditional Northeast Indian Storybook Aesthetic:
 * - Inspired by indigenous manuscript traditions (Sanchi-pat / handmade cotton paper)
 * - Natural handloom textile cover casing (warm terracotta madder red & earthy amber woven borders)
 * - Central stitched cord binding (traditional hand-sewn thread spine)
 * - Realistic deckled paper edges with layered page depth
 * - Responsive 2-page open book layout (side-by-side on wide screens, open folio on mobile)
 * - Elderly-friendly typography (high contrast charcoal on ivory paper, 18-20px font, generous line height)
 * - Smooth, calm book-opening animation with single gentle page turn sound
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoundManager } from '../../../modules/audio/SoundManager';

export function HandmadeStoryBook({
  title,
  paragraph1,
  paragraph2,
  isDarkMode = false,
  playOpenSound = true,
  style,
}) {
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= 700;

  // Book opening animation values
  const openAnim = useRef(new Animated.Value(0)).current;
  const pageFlipAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // Trigger gentle paper sound on open
    if (playOpenSound) {
      try {
        SoundManager.memoryStories.playPageTurn(0.75);
      } catch (_) {}
    }

    // Smooth, calm book opening animation
    Animated.parallel([
      Animated.timing(openAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(pageFlipAnim, {
        toValue: 1,
        duration: 480,
        delay: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [openAnim, pageFlipAnim, playOpenSound]);

  const bookScale = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const bookOpacity = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <Animated.View
      style={[
        styles.bookOuterWrapper,
        {
          opacity: bookOpacity,
          transform: [{ scale: bookScale }],
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Storybook: ${title}. ${paragraph1} ${paragraph2}`}
    >
      {/* 1. Traditional Handloom Textile Outer Cover (Mat / Desk Depth) */}
      <View
        style={[
          styles.textileCoverBoard,
          isDarkMode && styles.textileCoverBoardDark,
        ]}
      >
        {/* Woven Border Motif Trim */}
        <View style={styles.wovenBorderTrim}>
          <View style={styles.wovenCornerTL} />
          <View style={styles.wovenCornerTR} />
          <View style={styles.wovenCornerBL} />
          <View style={styles.wovenCornerBR} />
        </View>

        {/* 2. Realistic Stacked Deckle Paper Leaves (Visual Depth Under Pages) */}
        <View style={styles.stackedPaperEdgeLeft} />
        <View style={styles.stackedPaperEdgeRight} />

        {/* 3. Open Book Pages Container */}
        <View style={[styles.openPagesSpread, isWide && styles.openPagesSpreadWide]}>
          {/* ========================================================
              LEFT PAGE (Page 1): Story Title & Opening Paragraph
              ======================================================== */}
          <View
            style={[
              styles.singlePageLeaf,
              styles.leftPageLeaf,
              isWide && styles.singlePageLeafWide,
            ]}
          >
            {/* Subtle Deckled Top & Left Edge Shading */}
            <View style={styles.deckleEdgeGlow} />

            {/* Page Header Ornament */}
            <View style={styles.pageHeaderRow}>
              <View style={styles.traditionalOrnamentLine} />
              <View style={styles.ornamentEmblem}>
                <Ionicons name="sunny" size={16} color="#B45309" />
              </View>
              <View style={styles.traditionalOrnamentLine} />
            </View>

            {/* Story Title with Traditional Styling */}
            <Text style={styles.storyBookTitle}>{title}</Text>

            <View style={styles.titleUnderlineOrnament}>
              <View style={styles.diamondDot} />
            </View>

            {/* Paragraph 1 with Drop-Cap Styling Accent */}
            <View style={styles.paragraphContainer}>
              <Text style={styles.storyBookParagraph}>{paragraph1}</Text>
            </View>

            {/* Page Footer Foliation */}
            <View style={styles.pageFooterRow}>
              <Text style={styles.pageNumberText}>— ১ / 1 —</Text>
            </View>
          </View>

          {/* ========================================================
              CENTRAL STITCHED CORD SPINE BINDING
              ======================================================== */}
          <View style={[styles.centralBindingSpine, isWide && styles.centralBindingSpineWide]}>
            {/* Center Crease Valley Shadow */}
            <View style={styles.creaseShadowLeft} />
            <View style={styles.creaseShadowRight} />

            {/* Hand-Sewn Stitched Cord Loops */}
            <View style={styles.stitchedCordLoopContainer}>
              {[...Array(6)].map((_, idx) => (
                <View key={`cord-stitch-${idx}`} style={styles.cordStitchSegment}>
                  <View style={styles.stitchHole} />
                  <View style={styles.stitchThread} />
                  <View style={styles.stitchHole} />
                </View>
              ))}
            </View>
          </View>

          {/* ========================================================
              RIGHT PAGE (Page 2): Continuation Paragraph & Seal
              ======================================================== */}
          <View
            style={[
              styles.singlePageLeaf,
              styles.rightPageLeaf,
              isWide && styles.singlePageLeafWide,
            ]}
          >
            {/* Subtle Deckled Top & Right Edge Shading */}
            <View style={styles.deckleEdgeGlow} />

            {/* Page Header Ornament */}
            <View style={styles.pageHeaderRow}>
              <View style={styles.traditionalOrnamentLine} />
              <View style={styles.ornamentEmblem}>
                <Ionicons name="leaf" size={15} color="#15803D" />
              </View>
              <View style={styles.traditionalOrnamentLine} />
            </View>

            {/* Paragraph 2 */}
            <View style={styles.paragraphContainer}>
              <Text style={styles.storyBookParagraph}>{paragraph2}</Text>
            </View>

            {/* Traditional Finishing Seal */}
            <View style={styles.closingEmblemWrapper}>
              <View style={styles.closingEmblemRing}>
                <Ionicons name="flower-outline" size={18} color="#92400E" />
              </View>
            </View>

            {/* Page Footer Foliation */}
            <View style={styles.pageFooterRow}>
              <Text style={styles.pageNumberText}>— ২ / 2 —</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default HandmadeStoryBook;

const styles = StyleSheet.create({
  bookOuterWrapper: {
    width: '100%',
    marginVertical: 12,
    alignItems: 'center',
  },

  /* -------------------------------------------------------------
     1. Textile Cover Board (Madder Red / Terracotta Handloom Cloth)
  ------------------------------------------------------------- */
  textileCoverBoard: {
    width: '100%',
    backgroundColor: '#7F1D1D', // Deep authentic madder terracotta cloth
    borderRadius: 18,
    padding: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#991B1B',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  textileCoverBoardDark: {
    backgroundColor: '#3E1010',
    borderColor: '#5C1818',
  },
  wovenBorderTrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 224, 71, 0.45)', // Tribal gold woven accent line
    margin: 4,
    pointerEvents: 'none',
  },
  wovenCornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FBBF24',
  },
  wovenCornerTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FBBF24',
  },
  wovenCornerBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FBBF24',
  },
  wovenCornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FBBF24',
  },

  /* -------------------------------------------------------------
     2. Stacked Deckle Paper Leaves Underneath
  ------------------------------------------------------------- */
  stackedPaperEdgeLeft: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    left: 4,
    width: 5,
    backgroundColor: '#E7DFD0',
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: '#D3C7B3',
    opacity: 0.9,
  },
  stackedPaperEdgeRight: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    right: 4,
    width: 5,
    backgroundColor: '#E7DFD0',
    borderRadius: 2,
    borderRightWidth: 1,
    borderRightColor: '#D3C7B3',
    opacity: 0.9,
  },

  /* -------------------------------------------------------------
     3. Open Book Pages Spread
  ------------------------------------------------------------- */
  openPagesSpread: {
    flexDirection: 'column',
    backgroundColor: '#FAF6ED', // Warm handmade cotton/Sanchi ivory paper
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4C7B0',
    elevation: 4,
    shadowColor: '#38220F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
  openPagesSpreadWide: {
    flexDirection: 'row',
  },

  /* -------------------------------------------------------------
     4. Single Page Leaf Styling
  ------------------------------------------------------------- */
  singlePageLeaf: {
    flex: 1,
    backgroundColor: '#FCF9F2', // Authentic natural parchment tone
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: 'relative',
    justifyContent: 'space-between',
  },
  singlePageLeafWide: {
    minHeight: 340,
  },
  leftPageLeaf: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2D7C2',
  },
  rightPageLeaf: {
    borderTopWidth: 1,
    borderTopColor: '#E2D7C2',
  },
  deckleEdgeGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 237, 218, 0.25)',
    pointerEvents: 'none',
  },

  /* Header Ornament */
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  traditionalOrnamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4AF37', // Traditional soft gold accent
    opacity: 0.6,
  },
  ornamentEmblem: {
    marginHorizontal: 8,
    padding: 3,
    backgroundColor: '#F7EED9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6D3A3',
  },

  /* Typography */
  storyBookTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B1E08', // Traditional dark organic walnut ink
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 29,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  titleUnderlineOrnament: {
    alignItems: 'center',
    marginVertical: 8,
  },
  diamondDot: {
    width: 6,
    height: 6,
    backgroundColor: '#B45309',
    transform: [{ rotate: '45deg' }],
  },
  paragraphContainer: {
    marginVertical: 6,
  },
  storyBookParagraph: {
    fontSize: 18,
    lineHeight: 28,
    color: '#261C14', // High-contrast, dementia-friendly soft charcoal ink
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* Closing Emblem on Right Page */
  closingEmblemWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  closingEmblemRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5ECDA',
    borderWidth: 1.2,
    borderColor: '#D4B982',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Footer Foliation */
  pageFooterRow: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#E2D7C2',
  },
  pageNumberText: {
    fontSize: 12,
    color: '#8C775D',
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  /* -------------------------------------------------------------
     5. Central Stitched Cord Spine
  ------------------------------------------------------------- */
  centralBindingSpine: {
    width: '100%',
    height: 18,
    backgroundColor: '#EFE6D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D3C4A8',
  },
  centralBindingSpineWide: {
    width: 24,
    height: '100%',
    flexDirection: 'column',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  creaseShadowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(92, 59, 31, 0.12)',
  },
  creaseShadowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(92, 59, 31, 0.12)',
  },
  stitchedCordLoopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
  },
  cordStitchSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stitchHole: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#451A03',
  },
  stitchThread: {
    width: 14,
    height: 2,
    backgroundColor: '#9A3412', // Warm ochre-terracotta binding thread
    marginHorizontal: 1,
  },
});

