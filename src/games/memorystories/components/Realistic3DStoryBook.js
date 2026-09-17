/**
 * REALISTIC 3D PHYSICAL STORYBOOK - Xuworoni Kotha (Memory Stories)
 * Specially Crafted for Senior Citizens & Dementia-Friendly Cognitive Assistance (Age 60+)
 * Fully Multilingual & Culturally Adaptive: English, Assamese, Bengali, and Hindi
 *
 * Physical Realism & Tactile Book Craftsmanship:
 * 1. Authentic Physical Book Anatomy:
 *    - Handcrafted hardcover casing in heritage oxblood-madder book cloth (#3A1212 / #4C1A1A)
 *    - Real book block thickness: 3D multi-layered deckled paper edge stacks on sides & bottom
 *    - Traditional woven headband / tailband (red & amber silk stripes) at spine extremities
 *    - Deep spine valley shadows with realistic paper curvature & soft ambient arch highlights
 *    - Authentic 5-hole hand-stitched flax cord binding loops with pierced needle holes
 *    - Satin amber fabric bookmark ribbon trailing naturally from the spine onto the surface
 *    - Beveled squares overhang: hardcover boards extending realistically past paper pages
 *    - Multi-layered soft surface drop shadows anchoring the physical book on the table
 * 2. High-Legibility Elderly Typography & Color Palette:
 *    - Deep antique carbon printer's ink (#1A140E) on warm antique ivory parchment (#FAF5E8)
 *    - High contrast ratio (> 13:1) for effortless reading without digital glare or eye strain
 *    - Enlarged readable font size: 16.5px (mobile) / 19.5px (tablet) with generous 24.5px / 29px line-height
 *    - Wide physical book margins: text strictly never touches the spine crease or page edges
 *    - Classical book layout: Running chapter heads, dignified title, foliation
 * 3. 100% Dynamic Language Adaptation:
 *    - Automatically updates all titles, story text, chapter labels, book cover plates,
 *      interactive prompts, captions, and foliation numerals when language changes.
 * 4. Minimal Handcrafted Story Vignettes:
 *    - Zero emoji clutter or cartoon badges
 *    - Page 1: Handcrafted vignette of Maya's Blue Woven Scarf with delicate fringe
 *    - Page 2: Handcrafted vignette of a Fresh Sweet Red Apple with wooden stem & leaf
 * 5. Authentic 3D Book Kinematics:
 *    - Outward opening around the central spine: left rotates left, right rotates right
 *    - Central spine remains firmly stationed in the middle throughout unfolding
 *    - Strictly preserves the horizontal two-page open-book format across all screen sizes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoundManager } from '../../../modules/audio/SoundManager';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * Handcrafted Minimal Vignette: Maya's Blue Cotton Scarf
 * Quiet, warm, and directly supports story recall without emoji clutter.
 */
function BlueScarfIllustration({ caption = "Maya's Blue Woven Scarf" }) {
  return (
    <View style={illusStyles.container} accessibilityLabel={caption}>
      <View style={illusStyles.scarfArtwork}>
        {/* Scarf draped back loop */}
        <View style={illusStyles.scarfLoopBack} />
        {/* Scarf draped front fold */}
        <View style={illusStyles.scarfDrapeFront}>
          {/* Subtle woven pattern stripe */}
          <View style={illusStyles.scarfWeaveStripe} />
          {/* Hand-tied cotton fringe threads */}
          <View style={illusStyles.fringeRow}>
            {[...Array(7)].map((_, i) => (
              <View key={`fringe-${i}`} style={illusStyles.fringeLine} />
            ))}
          </View>
        </View>
      </View>
      <Text style={illusStyles.captionText}>{caption}</Text>
    </View>
  );
}

/**
 * Handcrafted Minimal Vignette: Fresh Market Red Apple
 * Quiet, warm, and directly supports story recall without emoji clutter.
 */
function FreshAppleIllustration({ caption = "Sweet Red Market Apple" }) {
  return (
    <View style={illusStyles.container} accessibilityLabel={caption}>
      <View style={illusStyles.appleArtwork}>
        {/* Apple wooden stem & tender leaf */}
        <View style={illusStyles.stemLeafWrap}>
          <View style={illusStyles.appleStem} />
          <View style={illusStyles.appleLeaf} />
        </View>
        {/* Ripe red apple body with soft highlight */}
        <View style={illusStyles.appleBody}>
          <View style={illusStyles.appleHighlight} />
        </View>
      </View>
      <Text style={illusStyles.captionText}>{caption}</Text>
    </View>
  );
}

export function Realistic3DStoryBook({
  title,
  paragraph1,
  paragraph2,
  isDarkMode = false,
  onStartQuestions,
  startQuestionsLabel = 'START QUESTIONS',
  promptLabel = 'Read this calm story carefully. When you are ready, tap below to start answering questions.',
  initialOpen = false,
  style,
}) {
  const { width: windowWidth } = useWindowDimensions();
  const { t, currentLanguage } = useLanguage();

  // Dynamic reactive localized strings
  const coverCategory = t('games.memoryStories.coverCategory', 'XUWORONI KOTHA • CULTURAL STORYBOOK');
  const coverSubtitle = t('games.memoryStories.coverSubtitle', 'A Traditional Story from the Valley');
  const tapToOpen = t('games.memoryStories.tapToOpen', 'TAP TO OPEN STORYBOOK');
  const part1Category = t('games.memoryStories.part1Category', 'XUWORONI KOTHA • PART 1');
  const part2Category = t('games.memoryStories.part2Category', 'CHAPTER 1 • MARKET DAY');
  const part2Title = t('games.memoryStories.part2Title', 'At the Market');
  const scarfCaption = t('games.memoryStories.scarfCaption', "Maya's Blue Woven Scarf");
  const appleCaption = t('games.memoryStories.appleCaption', 'Sweet Red Market Apple');
  const principleText = t('games.memoryStories.tagline', 'Read • Remember • Answer');
  const page1Num = t('games.memoryStories.page1Number', '1');
  const page2Num = t('games.memoryStories.page2Number', '2');

  // Book state: 'closed' | 'opening' | 'open'
  const [bookState, setBookState] = useState(initialOpen ? 'open' : 'closed');

  // Animation values for outward opening around the center spine
  const leftPageRotate = useRef(new Animated.Value(initialOpen ? 1 : 0)).current;
  const rightPageRotate = useRef(new Animated.Value(initialOpen ? 1 : 0)).current;
  const bookSpreadScale = useRef(new Animated.Value(initialOpen ? 1 : 0)).current;
  const coverGlowAnim = useRef(new Animated.Value(1)).current;

  // Gentle breathing pulse animation on closed cover prompt
  useEffect(() => {
    let pulse;
    if (bookState === 'closed') {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(coverGlowAnim, {
            toValue: 1.04,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(coverGlowAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    }
    return () => {
      if (pulse) pulse.stop();
    };
  }, [bookState, coverGlowAnim]);

  // Handle outward opening animation around the center spine
  const handleOpenBook = () => {
    if (bookState !== 'closed') return;
    setBookState('opening');

    try {
      SoundManager.memoryStories.playPageTurn(0.85);
    } catch (_) {}

    Animated.parallel([
      // Left side unfolds outward to the left
      Animated.timing(leftPageRotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Right side unfolds outward to the right
      Animated.timing(rightPageRotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Book expands horizontally around the central spine
      Animated.timing(bookSpreadScale, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBookState('open');
    });
  };

  // Dimensions & scaling (strictly preserving horizontal open-book perspective)
  const isTablet = windowWidth >= 700;
  const targetSpreadWidth = isTablet ? 720 : Math.min(windowWidth - 16, 480);
  // Ample vertical height to comfortably house enlarged elderly typography without crowding
  const targetSpreadHeight = isTablet ? 470 : 425;

  // Closed book animation interpolations
  const closedCoverOpacity = leftPageRotate.interpolate({
    inputRange: [0, 0.45, 0.5],
    outputRange: [1, 0.9, 0],
  });

  // Open book outward reveal interpolations
  const openSpreadOpacity = leftPageRotate.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.6, 1],
  });

  // Left page rotates outward to the left around center spine
  const leftPageTransform = leftPageRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['80deg', '0deg'],
  });

  // Right page rotates outward to the right around center spine
  const rightPageTransform = rightPageRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-80deg', '0deg'],
  });

  return (
    <View style={[styles.outerContainer, style]}>
      {/* ==========================================================
          STEP 1: CLOSED 3D PHYSICAL STORYBOOK
          Lying in authentic perspective on a wooden table surface
          ========================================================== */}
      {bookState !== 'open' && (
        <Animated.View
          style={[
            styles.closedBookRoot,
            {
              opacity: closedCoverOpacity,
              transform: [
                { perspective: 1200 },
                {
                  scale: bookSpreadScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.9],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Deep ambient desk shadow underneath the book */}
          <View style={styles.closedBookSurfaceShadow} />

          {/* Hardcover Casing in Heritage Oxblood-Madder Book Cloth */}
          <View style={styles.closedBookBody}>
            {/* Bound Spine with 3 Gold Foil Embossed Bands on Left Edge */}
            <View style={styles.closedSpineBound}>
              <View style={styles.spineBandTop} />
              <View style={styles.spineBandMid} />
              <View style={styles.spineBandBot} />
            </View>

            {/* Front Cover Board Plate */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleOpenBook}
              style={styles.closedFrontPlate}
              accessibilityRole="button"
              accessibilityLabel={`${tapToOpen}: ${title}`}
            >
              {/* Traditional Gold-Embossed Geometric Filigree Perimeter Border */}
              <View style={styles.closedCoverWovenBorder}>
                {/* Traditional Brass Filigree Corner Clasps */}
                <View style={styles.brassCornerTL} />
                <View style={styles.brassCornerTR} />
                <View style={styles.brassCornerBL} />
                <View style={styles.brassCornerBR} />

                {/* Inner Decorative Cartouche Plate */}
                <View style={styles.closedInnerCartouche}>
                  {/* Subtle Traditional Book Emblem */}
                  <View style={styles.coverEmblemCircle}>
                    <Ionicons name="book" size={26} color="#FDE68A" />
                  </View>

                  {/* Regional Collection Category Tag (Localized) */}
                  <Text style={styles.coverCategoryLabel}>
                    {coverCategory}
                  </Text>

                  {/* Story Title Inscription Box (Localized) */}
                  <View style={styles.coverTitleBox}>
                    <Text style={styles.coverTitleLabel}>
                      {title}
                    </Text>
                    <View style={styles.coverTitleDivider} />
                  </View>

                  {/* Subtitle (Localized) */}
                  <Text style={styles.coverSubtitleText}>
                    {coverSubtitle}
                  </Text>

                  {/* High-Contrast Action Prompt Button (Localized) */}
                  <Animated.View
                    style={[
                      styles.openBookPromptBtn,
                      { transform: [{ scale: coverGlowAnim }] },
                    ]}
                  >
                    <Ionicons name="book-outline" size={20} color="#1E1B4B" style={{ marginRight: 8 }} />
                    <Text style={styles.openBookPromptText}>
                      {tapToOpen}
                    </Text>
                  </Animated.View>
                </View>
              </View>

              {/* 3D Stacked Page Thickness along Right and Bottom Edges */}
              <View style={styles.closedLeafEdgeRight}>
                {[...Array(7)].map((_, i) => (
                  <View key={`paper-grain-${i}`} style={styles.paperGrainStripe} />
                ))}
              </View>
              <View style={styles.closedLeafEdgeBottom} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ==========================================================
          STEP 2 & 3: OPEN TWO-PAGE PHYSICAL 3D STORYBOOK
          Strictly Horizontal Perspective (Left Page | Spine | Right Page)
          ========================================================== */}
      {(bookState === 'open' || bookState === 'opening') && (
        <Animated.View
          style={[
            styles.openSpreadContainer,
            {
              width: targetSpreadWidth,
              opacity: openSpreadOpacity,
            },
          ]}
        >
          {/* Ambient Surface Drop Shadow Underneath Open Book */}
          <View style={styles.openSpreadSurfaceShadow} />

          {/* Hardcover Base Board in Heritage Madder Book Cloth Rim */}
          <View
            style={[
              styles.openCoverBoard,
              { height: targetSpreadHeight },
            ]}
          >
            {/* Authentic Striped Silk Headband at Top Spine Hollow */}
            <View style={styles.openHeadbandTop}>
              <View style={styles.headbandStripeRed} />
              <View style={styles.headbandStripeGold} />
              <View style={styles.headbandStripeRed} />
            </View>

            {/* Authentic Striped Silk Tailband at Bottom Spine Hollow */}
            <View style={styles.openHeadbandBottom}>
              <View style={styles.headbandStripeRed} />
              <View style={styles.headbandStripeGold} />
              <View style={styles.headbandStripeRed} />
            </View>

            {/* Subtle Gold Fillet Inlay along Top & Bottom Cover Board Rim */}
            <View style={styles.coverWovenTrimTop} />
            <View style={styles.coverWovenTrimBottom} />

            {/* 3D Multi-Layered Deckle Edge Stacks on Outer Left & Right Sides */}
            <View style={styles.outerDeckleStackLeft}>
              <View style={styles.deckleRidgeLine1} />
              <View style={styles.deckleRidgeLine2} />
              <View style={styles.deckleRidgeLine3} />
            </View>
            <View style={styles.outerDeckleStackRight}>
              <View style={styles.deckleRidgeLine1} />
              <View style={styles.deckleRidgeLine2} />
              <View style={styles.deckleRidgeLine3} />
            </View>

            {/* Pure Horizontal Two-Page Spread */}
            <View style={styles.horizontalBookSpread}>
              {/* ====================================================
                  LEFT PAGE: Chapter Title & Paragraph 1
                  Stationed clearly on the left with natural curvature
                  ==================================================== */}
              <Animated.View
                style={[
                  styles.pageLeafLeft,
                  {
                    transform: [
                      { perspective: 1000 },
                      { rotateY: leftPageTransform },
                    ],
                  },
                ]}
              >
                {/* Natural Paper Arch Highlight (Light reflecting on page curve) */}
                <View style={styles.pageArchHighlightLeft} pointerEvents="none" />

                {/* Deep Spine Crease Valley Shadow along right gutter */}
                <View style={styles.leftPageCreaseShadow} pointerEvents="none" />

                {/* Left Page Top Header: Clean Classical Book Layout */}
                <View style={styles.pageHeaderArea}>
                  <Text style={styles.pageCategoryLabel}>
                    {part1Category}
                  </Text>
                  <Text
                    style={[
                      styles.pageBookTitle,
                      isTablet && styles.pageBookTitleTablet,
                    ]}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                  <View style={styles.titleDividerLine} />
                </View>

                {/* Paragraph 1: Enlarged, High-Contrast Elderly Typography */}
                <View style={styles.paragraphContentWrap}>
                  <Text
                    style={[
                      styles.pageTextSerif,
                      isTablet && styles.pageTextSerifTablet,
                    ]}
                  >
                    {paragraph1}
                  </Text>
                </View>

                {/* Minimal Handcrafted Vignette: Maya's Blue Scarf */}
                <BlueScarfIllustration caption={scarfCaption} />

                {/* Classical Page Foliation: Left Page (Localized Numeral) */}
                <View style={styles.pageFooterFoliation}>
                  <Text style={styles.pageNumberString}>— {page1Num} —</Text>
                </View>
              </Animated.View>

              {/* ====================================================
                  CENTER SPINE GUTTER
                  Stationed firmly in the middle with crease valley shadows,
                  hand-sewn flax cord loops, and silk bookmark ribbon
                  ==================================================== */}
              <View style={styles.centerSpineGutter}>
                {/* Deep Gutter Crease Valley Shadows */}
                <View style={styles.spineValleyShadowLeft} />
                <View style={styles.spineValleyShadowRight} />

                {/* Authentic 5-Hole Hand-Stitched Flax Cord Binding Loops */}
                <View style={styles.spineStitchColumn}>
                  {[...Array(5)].map((_, idx) => (
                    <View key={`spine-stitch-${idx}`} style={styles.spineStitchUnit}>
                      <View style={styles.stitchPinhole} />
                      <View style={styles.stitchThreadCord} />
                      <View style={styles.stitchPinhole} />
                    </View>
                  ))}
                </View>

                {/* Silk Amber Ribbon Bookmark trailing naturally from the bottom */}
                <View style={styles.bookmarkRibbonRoot} pointerEvents="none">
                  <View style={styles.bookmarkRibbonBody} />
                  <View style={styles.bookmarkRibbonTip} />
                </View>
              </View>

              {/* ====================================================
                  RIGHT PAGE: Chapter 1 Continued & Paragraph 2
                  Stationed clearly on the right with natural curvature
                  ==================================================== */}
              <Animated.View
                style={[
                  styles.pageLeafRight,
                  {
                    transform: [
                      { perspective: 1000 },
                      { rotateY: rightPageTransform },
                    ],
                  },
                ]}
              >
                {/* Natural Paper Arch Highlight (Light reflecting on page curve) */}
                <View style={styles.pageArchHighlightRight} pointerEvents="none" />

                {/* Deep Spine Crease Valley Shadow along left gutter */}
                <View style={styles.rightPageCreaseShadow} pointerEvents="none" />

                {/* Right Page Top Header: Clean Classical Book Layout */}
                <View style={styles.pageHeaderArea}>
                  <Text style={styles.pageCategoryLabel}>
                    {part2Category}
                  </Text>
                  <Text
                    style={[
                      styles.pageBookTitle,
                      isTablet && styles.pageBookTitleTablet,
                    ]}
                    numberOfLines={1}
                  >
                    {part2Title}
                  </Text>
                  <View style={styles.titleDividerLine} />
                </View>

                {/* Paragraph 2: Enlarged, High-Contrast Elderly Typography */}
                <View style={styles.paragraphContentWrap}>
                  <Text
                    style={[
                      styles.pageTextSerif,
                      isTablet && styles.pageTextSerifTablet,
                    ]}
                  >
                    {paragraph2}
                  </Text>
                </View>

                {/* Minimal Handcrafted Vignette: Fresh Sweet Red Apple */}
                <FreshAppleIllustration caption={appleCaption} />

                {/* Classical Page Foliation: Right Page (Localized Numeral) */}
                <View style={styles.pageFooterFoliation}>
                  <Text style={styles.pageNumberString}>— {page2Num} —</Text>
                </View>

                {/* Lifted / Curled Page Corner on Right Side */}
                <View style={styles.liftedPageCornerRoot} pointerEvents="none">
                  {/* Soft cast shadow underneath lifted curl */}
                  <View style={styles.liftedPageCurlShadow} />
                  {/* Exposed under-page corner edge */}
                  <View style={styles.liftedUnderPageEdge} />
                  {/* The lifted paper curl itself showing warm underside */}
                  <View style={styles.liftedPageCurlShape}>
                    <View style={styles.liftedPageCurlInner} />
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Thick Book Base Layer: 3D Stacked Paper Leaves along Bottom */}
            <View style={styles.thickBookBaseBottom}>
              <View style={styles.basePaperLeaf1} />
              <View style={styles.basePaperLeaf2} />
              <View style={styles.basePaperLeaf3} />
            </View>
          </View>

          {/* Calm Guidance Banner: Localized Principle & Subtext */}
          {promptLabel && (
            <View style={styles.readingPromptCard}>
              <View style={styles.promptHeaderRow}>
                <Ionicons name="book-outline" size={18} color="#854D0E" style={{ marginRight: 7 }} />
                <Text style={styles.promptPrincipleText}>{principleText}</Text>
              </View>
              <Text style={styles.readingPromptText}>{promptLabel}</Text>
            </View>
          )}

          {/* Large High-Contrast Primary Action Button: "START QUESTIONS" */}
          {onStartQuestions && (
            <TouchableOpacity
              style={styles.questionsActionBtn}
              onPress={onStartQuestions}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={startQuestionsLabel}
            >
              <Text style={styles.questionsActionBtnText}>{startQuestionsLabel}</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

export default Realistic3DStoryBook;

/* -------------------------------------------------------------
   Illustration Styles: Handcrafted, Warm & Tactile
------------------------------------------------------------- */
const illusStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    marginVertical: 2,
  },
  captionText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#713F12',
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    fontWeight: '600',
  },

  /* Maya's Blue Scarf Drawing */
  scarfArtwork: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scarfLoopBack: {
    position: 'absolute',
    top: 1,
    width: 38,
    height: 14,
    backgroundColor: '#1E3A8A', // Deep traditional indigo-blue cotton
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  scarfDrapeFront: {
    position: 'absolute',
    top: 8,
    width: 26,
    height: 19,
    backgroundColor: '#2563EB', // Vibrant traditional blue fold
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  scarfWeaveStripe: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#BFDBFE', // Gentle light blue handloom weave pattern
    marginBottom: 3,
  },
  fringeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    height: 4,
  },
  fringeLine: {
    width: 1,
    height: 4,
    backgroundColor: '#FDE68A', // Hand-tied cream cotton fringe tassel
  },

  /* Fresh Sweet Red Apple Drawing */
  appleArtwork: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  stemLeafWrap: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  appleStem: {
    width: 2,
    height: 7,
    backgroundColor: '#4A2810', // Natural wooden brown twig
    borderRadius: 1,
    transform: [{ rotate: '-8deg' }],
  },
  appleLeaf: {
    width: 8,
    height: 4.5,
    backgroundColor: '#166534', // Fresh garden leaf green
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    marginLeft: 1,
    marginBottom: 2,
    transform: [{ rotate: '16deg' }],
  },
  appleBody: {
    width: 26,
    height: 23,
    backgroundColor: '#B91C1C', // Ripe market apple crimson
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#991B1B',
    position: 'relative',
  },
  appleHighlight: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 6,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    transform: [{ rotate: '-25deg' }],
  },
});

/* -------------------------------------------------------------
   Main Storybook Styles: Physical 3D Craftsmanship
------------------------------------------------------------- */
const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },

  /* -------------------------------------------------------------
     1. Closed 3D Physical Book
  ------------------------------------------------------------- */
  closedBookRoot: {
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
    marginVertical: 10,
  },
  closedBookSurfaceShadow: {
    position: 'absolute',
    bottom: -12,
    left: 18,
    right: 18,
    height: 26,
    borderRadius: 14,
    backgroundColor: 'rgba(24, 12, 6, 0.42)',
    elevation: 8,
  },
  closedBookBody: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#3A1212', // Heritage Oxblood-Madder Book Cloth
    borderWidth: 2,
    borderColor: '#541C1C',
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 7 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  closedSpineBound: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: '#2A0C0C', // Rounded cloth spine
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#541C1C',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 10,
  },
  spineBandTop: {
    width: 14,
    height: 3,
    backgroundColor: '#D4AF37', // Gold-leaf embossed rib
    borderRadius: 1.5,
  },
  spineBandMid: {
    width: 14,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 1.5,
  },
  spineBandBot: {
    width: 14,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 1.5,
  },
  closedFrontPlate: {
    marginLeft: 22,
    padding: 12,
    minHeight: 420,
    backgroundColor: '#4A1A1A', // Deep textured book cloth finish
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedCoverWovenBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: '#B8862D', // Gold-embossed filigree border
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brassCornerTL: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 13,
    height: 13,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#D4AF37',
  },
  brassCornerTR: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 13,
    height: 13,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#D4AF37',
  },
  brassCornerBL: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    width: 13,
    height: 13,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#D4AF37',
  },
  brassCornerBR: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 13,
    height: 13,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#D4AF37',
  },
  closedInnerCartouche: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  coverEmblemCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A0C0C',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coverCategoryLabel: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverTitleBox: {
    backgroundColor: 'rgba(20, 6, 6, 0.55)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    marginVertical: 8,
  },
  coverTitleLabel: {
    color: '#FFFDF7',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  coverTitleDivider: {
    width: 38,
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginTop: 6,
    borderRadius: 1,
  },
  coverSubtitleText: {
    color: '#FEF08A',
    fontSize: 12.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  openBookPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  openBookPromptText: {
    color: '#1E1B4B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closedLeafEdgeRight: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    right: -11,
    width: 11,
    backgroundColor: '#E4DAC7',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderRightWidth: 1,
    borderRightColor: '#C4B49C',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  paperGrainStripe: {
    height: 1.5,
    backgroundColor: '#C4B49C',
    width: '100%',
    opacity: 0.75,
  },
  closedLeafEdgeBottom: {
    position: 'absolute',
    bottom: -8,
    left: 26,
    right: 2,
    height: 8,
    backgroundColor: '#E4DAC7',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#C4B49C',
  },

  /* -------------------------------------------------------------
     2. Open Horizontal Physical 3D Book
  ------------------------------------------------------------- */
  openSpreadContainer: {
    alignItems: 'center',
  },
  openSpreadSurfaceShadow: {
    position: 'absolute',
    bottom: 50,
    left: 14,
    right: 14,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(20, 10, 4, 0.34)',
    elevation: 7,
  },
  openCoverBoard: {
    width: '100%',
    backgroundColor: '#3A1212', // Exposed hardcover board rim in rich oxblood cloth
    borderRadius: 14,
    padding: 6,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#541C1C',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.35,
    shadowRadius: 9,
  },

  /* Striped Silk Headband (Top Spine Hollow) */
  openHeadbandTop: {
    position: 'absolute',
    top: -4,
    left: '49%',
    width: 20,
    height: 6,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#682020',
    zIndex: 12,
  },
  /* Striped Silk Tailband (Bottom Spine Hollow) */
  openHeadbandBottom: {
    position: 'absolute',
    bottom: -4,
    left: '49%',
    width: 20,
    height: 6,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#682020',
    zIndex: 12,
  },
  headbandStripeRed: {
    flex: 1,
    backgroundColor: '#B91C1C', // Classical red silk thread
  },
  headbandStripeGold: {
    flex: 1,
    backgroundColor: '#D97706', // Classical gold silk thread
  },

  coverWovenTrimTop: {
    position: 'absolute',
    top: 2,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#B8862D',
    opacity: 0.5,
  },
  coverWovenTrimBottom: {
    position: 'absolute',
    bottom: 2,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#B8862D',
    opacity: 0.5,
  },

  /* 3D Multi-Layered Deckle Edge Stacks on Outer Sides */
  outerDeckleStackLeft: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 2,
    width: 4,
    backgroundColor: '#E4DAC7',
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: '#C4B49C',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  outerDeckleStackRight: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    right: 2,
    width: 4,
    backgroundColor: '#E4DAC7',
    borderRadius: 2,
    borderRightWidth: 1,
    borderRightColor: '#C4B49C',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  deckleRidgeLine1: {
    width: '100%',
    height: 1,
    backgroundColor: '#B5A58B',
  },
  deckleRidgeLine2: {
    width: '100%',
    height: 1,
    backgroundColor: '#B5A58B',
  },
  deckleRidgeLine3: {
    width: '100%',
    height: 1,
    backgroundColor: '#B5A58B',
  },

  /* The Pure Horizontal Spread */
  horizontalBookSpread: {
    flex: 1,
    flexDirection: 'row', // STRICTLY HORIZONTAL TWO-PAGE SPREAD
    backgroundColor: '#F5EFE0', // Warm antique ivory parchment base
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D2C4AA',
  },

  /* Left Page */
  pageLeafLeft: {
    flex: 1,
    backgroundColor: '#FCF8EE', // Warm organic book paper tone
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
    justifyContent: 'space-between',
    borderRightWidth: 0.5,
    borderRightColor: '#E2D5BE',
  },
  pageArchHighlightLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 20,
    width: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.42)', // Natural light reflecting on paper curvature
  },
  leftPageCreaseShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 22,
    backgroundColor: 'rgba(54, 28, 10, 0.08)', // Deep spine valley shadow
  },

  /* Right Page */
  pageLeafRight: {
    flex: 1,
    backgroundColor: '#FCF8EE', // Warm organic book paper tone
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
    justifyContent: 'space-between',
    borderLeftWidth: 0.5,
    borderLeftColor: '#E2D5BE',
  },
  pageArchHighlightRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 20,
    width: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.42)', // Natural light reflecting on paper curvature
  },
  rightPageCreaseShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 22,
    backgroundColor: 'rgba(54, 28, 10, 0.08)', // Deep spine valley shadow
  },

  /* Center Spine Gutter */
  centerSpineGutter: {
    width: 17,
    backgroundColor: '#ECE2CE',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CDBEA2',
  },
  spineValleyShadowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(54, 28, 10, 0.14)',
  },
  spineValleyShadowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(54, 28, 10, 0.14)',
  },
  spineStitchColumn: {
    height: '76%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  spineStitchUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stitchPinhole: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#3E1602', // Needle punch eyelet
  },
  stitchThreadCord: {
    width: 8,
    height: 1.5,
    backgroundColor: '#9A3412', // Sewn flax bookbinding thread
  },

  /* Silk Fabric Bookmark Ribbon trailing from the bottom */
  bookmarkRibbonRoot: {
    position: 'absolute',
    bottom: -24,
    left: '50%',
    marginLeft: -7,
    width: 14,
    height: 34,
    zIndex: 15,
  },
  bookmarkRibbonBody: {
    width: 14,
    height: 26,
    backgroundColor: '#C2882E', // Warm woven gold-amber satin ribbon
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#92400E',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  bookmarkRibbonTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: '#C2882E',
    borderRightColor: '#C2882E',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },

  /* Clean Classical Book Top Header Hierarchy */
  pageHeaderArea: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pageCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A481A', // Warm terracotta ochre running head
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  pageBookTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#261508', // Deep antique book title ink
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 19.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  pageBookTitleTablet: {
    fontSize: 19.5,
    lineHeight: 24,
  },
  titleDividerLine: {
    width: 32,
    height: 1.5,
    backgroundColor: '#B45309',
    marginTop: 4,
    borderRadius: 1,
  },

  /* Paragraph Text: Enlarged, High-Contrast & Comfortable for Seniors */
  paragraphContentWrap: {
    marginVertical: 4,
    paddingHorizontal: 2,
  },
  pageTextSerif: {
    fontSize: 16,
    lineHeight: 24.5,
    color: '#1A140E', // Deep antique carbon ink on warm ivory paper (>13:1 contrast)
    letterSpacing: 0.25,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  pageTextSerifTablet: {
    fontSize: 19.5,
    lineHeight: 29,
    letterSpacing: 0.3,
  },

  /* Page Footer Foliation */
  pageFooterFoliation: {
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#DECDB4',
  },
  pageNumberString: {
    fontSize: 11,
    color: '#786047',
    letterSpacing: 1.4,
    fontWeight: '600',
  },

  /* Guidance Banner Below Open Book */
  readingPromptCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginTop: 14,
    width: '100%',
  },
  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  promptPrincipleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.6,
  },
  readingPromptText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 19.5,
    fontWeight: '500',
  },

  /* Large High-Contrast Primary Action Button: "START QUESTIONS" */
  questionsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A', // Deep navy blue for optimal contrast & calm dignity
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginTop: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  questionsActionBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* Lifted Page Corner / Turning Page on Right Side */
  liftedPageCornerRoot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    zIndex: 10,
    overflow: 'hidden',
  },
  liftedPageCurlShadow: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(35, 18, 8, 0.20)',
    borderRadius: 15,
    transform: [{ scaleX: 1.15 }, { rotate: '-22deg' }],
  },
  liftedUnderPageEdge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#E6DCBF',
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#C8BA9C',
  },
  liftedPageCurlShape: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 36,
    height: 36,
    backgroundColor: '#F7EED9',
    borderTopLeftRadius: 18,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#D8CAA8',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  liftedPageCurlInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    backgroundColor: '#EDE1C7',
    borderTopLeftRadius: 12,
  },

  /* Thick Book Base Layer: 3D Stacked Paper Leaves along Bottom */
  thickBookBaseBottom: {
    position: 'absolute',
    bottom: 2,
    left: 10,
    right: 10,
    height: 6,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    zIndex: 5,
  },
  basePaperLeaf1: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#E6DCC5',
    borderRadius: 1,
  },
  basePaperLeaf2: {
    width: '99%',
    alignSelf: 'center',
    height: 1.5,
    backgroundColor: '#D9CCA8',
    borderRadius: 1,
  },
  basePaperLeaf3: {
    width: '98%',
    alignSelf: 'center',
    height: 1.5,
    backgroundColor: '#C5B592',
    borderRadius: 1,
  },
});
