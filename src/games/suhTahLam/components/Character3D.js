/**
 * SUH TAH LAM - Character3D
 *
 * High-Definition 3D Northeast Character Models & Living Kinematics:
 * - Lead Dancer: Kimboi
 *   Authentic Northeast traditional attire:
 *   - 3D chignon bun with gradient sheen & brass hairpin (Samkhir)
 *   - Vakiria ceremonial headdress with gold gem and crimson plumes
 *   - Sunlit face, earrings, and multi-strand Taikang beads (carnelian & turquoise)
 *   - Handwoven raw ivory silk vest (Kawrchei) with 3D shoulder bevels & vertical chevrons
 *   - Ceremonial Khamtang / Saipikhup wrap skirt (Puan) with golden lozenge diamonds
 *   - Dynamic ground cast shadow, articulated arms with brass bangles, brass anklets
 *   - 60 FPS living kinematics: dance bob, arm sways, head tilt, skirt swish, foot stepping
 * - Bamboo Rhythm Holders: Thangminlen (Left) & Paominlun (Right)
 *   - 3D timber platform stools
 *   - Cropped hair, Lakhon woven crimson/gold headbands with white feather plumes
 *   - Traditional forest-green handwoven elder vests (Lengbu)
 *   - Seated crossed knees with handwoven crimson Dholna wraps
 *   - Articulated muscular gripping arms holding the bamboo joint handles
 *   - Synchronized push-pull body rocking and handle grip rotation
 * - 30-40% Translucent Name Badges on top of players with safe non-colliding clearance
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Easing } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';

export default function Character3D({
  role = 'dancer',
  positionX = 0,
  positionY = 0,
  actionState = 'idle',
  isAltered = false,
  name,
  showName = true,
}) {
  let t = (k, def) => def;
  try {
    const langContext = useLanguage();
    if (langContext?.t) t = langContext.t;
  } catch (e) {
    // Fallback if rendered outside LanguageProvider
  }

  const isDancer = role === 'dancer';
  const isLeftHolder = role === 'holder_left';
  const isRightHolder = role === 'holder_right';

  // Localized authentic Northeast names
  const displayName =
    name ||
    (isDancer
      ? t('games.suhTahLam.dancerKimboi', 'Kimboi · Lead Dancer')
      : isLeftHolder
      ? t('games.suhTahLam.holderThangminlen', 'Thangminlen')
      : t('games.suhTahLam.holderPaominlun', 'Paominlun'));

  // Continuous living kinematics
  const idleBobAnim = useRef(new Animated.Value(0)).current;
  const armSwayAnim = useRef(new Animated.Value(0)).current;
  const hopAnim = useRef(new Animated.Value(0)).current;
  const holderRockAnim = useRef(new Animated.Value(0)).current;
  const leftStepAnim = useRef(new Animated.Value(0)).current;
  const rightStepAnim = useRef(new Animated.Value(0)).current;
  // Extra living micro-kinematics
  const breathAnim = useRef(new Animated.Value(0)).current;
  const weightShiftAnim = useRef(new Animated.Value(0)).current;
  const shoulderShimmerAnim = useRef(new Animated.Value(0)).current;

  // 1. Dancer continuous living idle dance bobbing & arm sway
  useEffect(() => {
    if (isDancer) {
      // Main dance bob rhythm
      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(idleBobAnim, {
            toValue: -4,
            duration: 350,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(idleBobAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      // Graceful arm sway — slightly offset from the bob
      const swayLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(armSwayAnim, {
            toValue: 1,
            duration: 820,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(armSwayAnim, {
            toValue: -1,
            duration: 820,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      // Subtle weight-shift: gentle left-right body drift while dancing
      const weightShiftLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(weightShiftAnim, {
            toValue: 2,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(weightShiftAnim, {
            toValue: -2,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      // Shoulder shimmer — very subtle roll oscillation
      const shoulderLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shoulderShimmerAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shoulderShimmerAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      bobLoop.start();
      swayLoop.start();
      weightShiftLoop.start();
      shoulderLoop.start();

      return () => {
        bobLoop.stop();
        swayLoop.stop();
        weightShiftLoop.stop();
        shoulderLoop.stop();
      };
    }
  }, [isDancer, idleBobAnim, armSwayAnim, weightShiftAnim, shoulderShimmerAnim]);

  // Breathing animation — all characters breathe gently
  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathLoop.start();
    return () => breathLoop.stop();
  }, [breathAnim]);

  // 2. Holder continuous push-pull rocking kinematics
  useEffect(() => {
    if (!isDancer) {
      if (actionState === 'push_pull') {
        const rockLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(holderRockAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(holderRockAnim, {
              toValue: -1,
              duration: 500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        rockLoop.start();
        return () => rockLoop.stop();
      } else {
        Animated.timing(holderRockAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isDancer, actionState, holderRockAnim]);


  // 3. Dancer dynamic stepping & hop kinematics when moving
  useEffect(() => {
    if (isDancer && actionState.startsWith('step')) {
      const isLeft = actionState.includes('left');
      const activeFoot = isLeft ? leftStepAnim : rightStepAnim;

      Animated.parallel([
        Animated.sequence([
          Animated.timing(hopAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(hopAnim, {
            toValue: 0,
            duration: 260,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(activeFoot, {
            toValue: -6,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(activeFoot, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isDancer, actionState, hopAnim, leftStepAnim, rightStepAnim]);

  // Dynamic interpolations for Dancer
  const dancerBounceY = Animated.add(
    idleBobAnim,
    hopAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -11],
    })
  );

  const dancerHopScale = hopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const shadowScale = hopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.68],
  });

  const leftArmRotate = armSwayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-16deg', '0deg', '16deg'],
  });

  const rightArmRotate = armSwayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['16deg', '0deg', '-16deg'],
  });

  const skirtTilt = armSwayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  const headTilt = armSwayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  // New: weight shift lateral drift for dancer
  const dancerWeightShift = weightShiftAnim; // direct lateral X nudge

  // New: breathing scale on torso (very subtle)
  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  // New: breathing on holder torso
  const holderBreathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.018],
  });

  // Dynamic interpolations for Rhythm Holders
  const holderLeanRotation = holderRockAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: isLeftHolder ? ['-4.5deg', '0deg', '4.5deg'] : ['4.5deg', '0deg', '-4.5deg'],
  });

  const holderArmRotation = holderRockAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: isLeftHolder ? ['22deg', '0deg', '-18deg'] : ['-22deg', '0deg', '18deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.rootAnchor,
        isDancer ? styles.dancerAnchor : styles.holderAnchor,
        {
          transform: [{ translateX: positionX }, { translateY: positionY }],
        },

      ]}
    >
      {/* ========================================================
          DEDICATED NAME BADGE ON TOP OF PLAYER
          30-40% Translucency (Exact 35%), Non-Colliding Safe Spacing
          ======================================================== */}
      {showName && (
        <View style={[styles.nameBadgeContainer, isDancer ? styles.dancerBadgePos : styles.holderBadgePos]}>
          <View style={styles.nameBadgeBackground}>
            <Text style={styles.nameBadgeText} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>
      )}

      {/* Spot-the-Change Subtle Marker */}
      {isAltered && <View style={styles.alteredMarker} />}

      {/* ========================================================
          CENTRAL LEAD DANCER (KIMBOI) 3D MODEL
          ======================================================== */}
      {isDancer ? (
        <Animated.View
          style={[
            styles.dancerRig,
            {
              transform: [
                { translateX: dancerWeightShift },
                { translateY: dancerBounceY },
                { scale: dancerHopScale },
              ],
            },
          ]}
        >
          {/* Dynamic 3D Ground Cast Shadow */}
          <Animated.View
            style={[
              styles.dancerGroundShadow,
              { transform: [{ scale: shadowScale }] },
            ]}
          />

          {/* 3D Head Group & Vakiria Headdress */}
          <Animated.View style={[styles.dancerHeadGroup, { transform: [{ rotate: headTilt }] }]}>
            {/* 3D Chignon Bun with Volumetric Sheen & Brass Hairpin (Samkhir) */}
            <View style={styles.hairBun3D}>
              <View style={styles.bunHighlight} />
              <View style={styles.brassHairPin} />
            </View>

            {/* 3D Facial Structure */}
            <View style={styles.dancerFace}>
              {/* Sunlit Cheek Specular Highlight */}
              <View style={styles.sunlitCheek} />

              {/* 3D Vakiria Layered Crest Headdress */}
              <View style={styles.vakiriaCrest}>
                <View style={styles.crestPlumeLeft} />
                <View style={styles.crestGemCenter} />
                <View style={styles.crestPlumeRight} />
              </View>

              {/* Serene Facial Eyes & Smile */}
              <View style={styles.eyesRow}>
                <View style={styles.eyePupil} />
                <View style={styles.eyePupil} />
              </View>
              <View style={styles.gentleSmile} />

              {/* Polished Brass Earrings */}
              <View style={styles.earringLeft} />
              <View style={styles.earringRight} />
            </View>
          </Animated.View>

          {/* 3D Neck & Multi-Strand Taikang Beads (Carnelian & Turquoise) */}
          <View style={styles.dancerNeck}>
            <View style={styles.carnelianStrand}>
              <View style={styles.beadSheen} />
            </View>
            <View style={styles.turquoiseStrand} />
          </View>

          {/* 3D Torso & Handwoven Raw Ivory Silk Vest (Kawrchei) */}
          <Animated.View style={[styles.dancerBodice, { transform: [{ scaleY: breathScale }] }]}>
            <View style={styles.silkVest}>
              {/* 3D Beveled Shoulder Panels for Depth */}
              <View style={styles.vestShoulderLeft} />
              <View style={styles.vestShoulderRight} />

              {/* Embroidered Vertical Chevrons */}
              <View style={styles.vestChevronBandLeft} />
              <View style={styles.vestChevronBandRight} />
            </View>

            {/* Articulated Swaying Left Arm with Brass Bangle */}
            <Animated.View style={[styles.dancerArmLeft, { transform: [{ rotate: leftArmRotate }] }]}>
              <View style={styles.armUpper} />
              <View style={styles.brassBangle} />
              <View style={styles.gracefulHand} />
            </Animated.View>

            {/* Articulated Swaying Right Arm with Brass Bangle */}
            <Animated.View style={[styles.dancerArmRight, { transform: [{ rotate: rightArmRotate }] }]}>
              <View style={styles.armUpper} />
              <View style={styles.brassBangle} />
              <View style={styles.gracefulHand} />
            </Animated.View>
          </Animated.View>

          {/* 3D Khamtang / Saipikhup Ceremonial Wrap Skirt (Puan) */}
          <Animated.View style={[styles.khamtangSkirt, { transform: [{ rotate: skirtTilt }] }]}>
            {/* Black Woven Waistband */}
            <View style={styles.skirtWaistband} />

            {/* Golden Lozenge Diamond Chevrons */}
            <View style={styles.chevronBand}>
              <View style={styles.goldDiamond} />
              <View style={styles.goldDiamond} />
              <View style={styles.goldDiamond} />
            </View>
            <View style={styles.goldAccentStripe} />

            {/* Wrap Fold Depth Shadow */}
            <View style={styles.skirtFoldShadow} />
            <View style={styles.skirtHemShadow} />
          </Animated.View>

          {/* 3D Stepping Legs, Brass Anklets & Feet */}
          <View style={styles.steppingLegsRow}>
            <Animated.View style={[styles.steppingFoot, { transform: [{ translateY: leftStepAnim }] }]}>
              <View style={styles.calfMuscle} />
              <View style={styles.brassAnklet} />
              <View style={styles.dancerFootSole} />
            </Animated.View>

            <Animated.View style={[styles.steppingFoot, { transform: [{ translateY: rightStepAnim }] }]}>
              <View style={styles.calfMuscle} />
              <View style={styles.brassAnklet} />
              <View style={styles.dancerFootSole} />
            </Animated.View>
          </View>
        </Animated.View>
      ) : (
        /* ========================================================
            RHYTHM HOLDERS (THANGMINLEN & PAOMINLUN) 3D MODEL
            ======================================================== */
        <Animated.View
          style={[
            styles.holderRig,
            { transform: [{ rotate: holderLeanRotation }] },
          ]}
        >
          {/* 3D Timber Stool Platform */}
          <View style={styles.holderStool} />

          {/* 3D Head & Lakhon Headband Headdress */}
          <View style={styles.holderHead}>
            <View style={styles.holderHair} />
            <View style={styles.holderHeadband} />
            <View style={styles.holderFeather} />
            <View style={isLeftHolder ? styles.holderEyeFacingRight : styles.holderEyeFacingLeft} />
          </View>

          {/* 3D Torso & Traditional Forest Green Elder Vest (Lengbu) */}
          <Animated.View style={[styles.holderTorso, { transform: [{ scaleY: holderBreathScale }] }]}>
            <View style={styles.holderVestHighlight} />
            <View style={styles.holderVestStripe} />
          </Animated.View>

          {/* 3D Crossed Knees with Handwoven Crimson Dholna Wrap */}
          <View style={styles.holderSeatedLegs}>
            <View style={styles.dholnaGreenStripe} />
            <View style={styles.dholnaGoldStripe} />
          </View>

          {/* 3D Articulated Gripping Arm with Wooden Bamboo Handle */}
          <Animated.View
            style={[
              styles.holderArmGrip,
              isRightHolder && styles.holderArmGripRight,
              { transform: [{ rotate: holderArmRotation }] },
            ]}
          >
            <View style={styles.holderForearm} />
            <View style={styles.holderHand} />
            <View style={styles.bambooGripHandle} />
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dancerAnchor: {
    width: 64,
    height: 120,
    zIndex: 22,
  },
  holderAnchor: {
    width: 68,
    height: 92,
    zIndex: 16,
  },

  /* Name Badges: 30-40% Translucent (Exact 35%) in Safe Zones */
  nameBadgeContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  dancerBadgePos: {
    top: -26,
  },
  holderBadgePos: {
    top: -24,
  },
  nameBadgeBackground: {
    backgroundColor: 'rgba(15, 25, 18, 0.35)', // Exact 35% transparency
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  nameBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2.5,
  },

  /* Spot-The-Change Marker */
  alteredMarker: {
    position: 'absolute',
    top: -32,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 110,
  },

  /* Lead Dancer (Kimboi) 3D Styles */
  dancerRig: {
    width: 64,
    height: 120,
    alignItems: 'center',
    position: 'relative',
  },
  dancerGroundShadow: {
    position: 'absolute',
    bottom: -2,
    width: 44,
    height: 9,
    backgroundColor: 'rgba(20, 38, 20, 0.45)',
    borderRadius: 22,
  },
  dancerHeadGroup: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 2,
  },
  hairBun3D: {
    position: 'absolute',
    top: -7,
    width: 19,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16110D',
    borderWidth: 1,
    borderColor: '#291F18',
    alignItems: 'flex-end',
    elevation: 3,
  },
  bunHighlight: {
    width: 10,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 1,
    marginRight: 2,
  },
  brassHairPin: {
    width: 14,
    height: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
    marginRight: -4,
    marginTop: 2,
  },
  dancerFace: {
    width: 24,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#C48D62',
    alignItems: 'center',
    position: 'relative',
    marginTop: 4,
    borderWidth: 0.8,
    borderColor: '#9E6D47',
    elevation: 4,
  },
  sunlitCheek: {
    position: 'absolute',
    top: 6,
    left: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 230, 200, 0.3)',
  },
  vakiriaCrest: {
    position: 'absolute',
    top: 1.5,
    width: 24,
    height: 5.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crestPlumeLeft: {
    width: 5.5,
    height: 4.5,
    backgroundColor: '#9E1A22',
    borderTopLeftRadius: 3,
  },
  crestGemCenter: {
    width: 5.5,
    height: 5.5,
    backgroundColor: '#ECC348',
    borderRadius: 1,
  },
  crestPlumeRight: {
    width: 5.5,
    height: 4.5,
    backgroundColor: '#9E1A22',
    borderTopRightRadius: 3,
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginTop: 11,
  },
  eyePupil: {
    width: 2.2,
    height: 2.2,
    borderRadius: 1.1,
    backgroundColor: '#160E08',
  },
  gentleSmile: {
    width: 5.5,
    height: 2,
    borderBottomWidth: 1.4,
    borderBottomColor: '#6B3C22',
    borderRadius: 1,
    marginTop: 1.5,
  },
  earringLeft: {
    position: 'absolute',
    top: 12,
    left: -2,
    width: 3,
    height: 4,
    borderRadius: 1.5,
    backgroundColor: '#F59E0B',
  },
  earringRight: {
    position: 'absolute',
    top: 12,
    right: -2,
    width: 3,
    height: 4,
    borderRadius: 1.5,
    backgroundColor: '#F59E0B',
  },
  dancerNeck: {
    width: 13,
    height: 7,
    backgroundColor: '#BA8459',
    alignItems: 'center',
    marginTop: -1,
  },
  carnelianStrand: {
    width: 12,
    height: 2.8,
    backgroundColor: '#DC2626',
    borderRadius: 1.4,
    borderWidth: 0.5,
    borderColor: '#991B1B',
  },
  beadSheen: {
    width: 2.5,
    height: 1.4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 0.7,
    marginLeft: 2,
  },
  turquoiseStrand: {
    width: 14,
    height: 2.8,
    backgroundColor: '#0D9488',
    borderRadius: 1.4,
    marginTop: 0.8,
  },
  dancerBodice: {
    width: 38,
    height: 35,
    position: 'relative',
    alignItems: 'center',
    zIndex: 3,
  },
  silkVest: {
    width: 30,
    height: 35,
    backgroundColor: '#FAF5EA',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D4C5AD',
    position: 'relative',
    overflow: 'hidden',
    elevation: 3,
  },
  vestShoulderLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 9,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  vestShoulderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  vestChevronBandLeft: {
    position: 'absolute',
    top: 0,
    left: 7,
    width: 3,
    height: '100%',
    backgroundColor: '#9E1A22',
  },
  vestChevronBandRight: {
    position: 'absolute',
    top: 0,
    right: 7,
    width: 3,
    height: '100%',
    backgroundColor: '#9E1A22',
  },
  dancerArmLeft: {
    position: 'absolute',
    left: -6,
    top: 2,
    width: 9,
    height: 29,
    alignItems: 'center',
  },
  dancerArmRight: {
    position: 'absolute',
    right: -6,
    top: 2,
    width: 9,
    height: 29,
    alignItems: 'center',
  },
  armUpper: {
    width: 7.5,
    height: 20,
    backgroundColor: '#C48D62',
    borderRadius: 3.8,
    borderWidth: 0.6,
    borderColor: '#9E6D47',
  },
  brassBangle: {
    width: 8,
    height: 3.5,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
    marginTop: -2,
  },
  gracefulHand: {
    width: 6.5,
    height: 7,
    backgroundColor: '#B57B52',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  khamtangSkirt: {
    width: 42,
    height: 38,
    backgroundColor: '#991B1B',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    marginTop: -3,
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
  },
  skirtWaistband: {
    width: '100%',
    height: 4,
    backgroundColor: '#17110C',
  },
  chevronBand: {
    width: '100%',
    height: 8,
    backgroundColor: '#17110C',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  goldDiamond: {
    width: 4.5,
    height: 4.5,
    backgroundColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
  },
  goldAccentStripe: {
    width: '100%',
    height: 3,
    backgroundColor: '#F59E0B',
    marginTop: 8,
  },
  skirtFoldShadow: {
    position: 'absolute',
    right: 9,
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  skirtHemShadow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#5B0D13',
  },
  steppingLegsRow: {
    flexDirection: 'row',
    width: 28,
    justifyContent: 'space-between',
    marginTop: 1,
  },
  steppingFoot: {
    alignItems: 'center',
  },
  calfMuscle: {
    width: 7,
    height: 5.5,
    backgroundColor: '#B57B52',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  brassAnklet: {
    width: 8,
    height: 2.5,
    backgroundColor: '#F59E0B',
    borderRadius: 1.2,
  },
  dancerFootSole: {
    width: 8.5,
    height: 7,
    backgroundColor: '#A86C45',
    borderBottomLeftRadius: 3.5,
    borderBottomRightRadius: 3.5,
  },

  /* Rhythm Holders (Thangminlen & Paominlun) Styles */
  holderRig: {
    width: 68,
    height: 88,
    alignItems: 'center',
    position: 'relative',
  },
  holderStool: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 12,
    backgroundColor: '#3E2B1A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#614328',
  },
  holderHead: {
    width: 23,
    height: 24,
    borderRadius: 11.5,
    backgroundColor: '#BA8459',
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
  },
  holderHair: {
    position: 'absolute',
    top: 0,
    width: 23,
    height: 10,
    backgroundColor: '#17110C',
    borderTopLeftRadius: 11.5,
    borderTopRightRadius: 11.5,
  },
  holderHeadband: {
    position: 'absolute',
    top: 8,
    width: 23,
    height: 3.5,
    backgroundColor: '#A62128',
    borderWidth: 0.5,
    borderColor: '#EAA92A',
  },
  holderFeather: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 4.5,
    height: 9,
    backgroundColor: '#EAE2D5',
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
  },
  holderEyeFacingRight: {
    position: 'absolute',
    top: 14,
    right: 5,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.2,
    backgroundColor: '#140E0A',
  },
  holderEyeFacingLeft: {
    position: 'absolute',
    top: 14,
    left: 5,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.2,
    backgroundColor: '#140E0A',
  },
  holderTorso: {
    width: 32,
    height: 30,
    backgroundColor: '#38523A',
    borderRadius: 5,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#1F3320',
    overflow: 'hidden',
  },
  holderVestHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 13,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  holderVestStripe: {
    position: 'absolute',
    top: 0,
    right: 5,
    width: 3.5,
    height: '100%',
    backgroundColor: '#9E1A22',
  },
  holderSeatedLegs: {
    width: 42,
    height: 16,
    backgroundColor: '#9E1A22',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#661015',
    marginTop: -2,
    overflow: 'hidden',
  },
  dholnaGreenStripe: {
    position: 'absolute',
    top: 3,
    width: '100%',
    height: 3,
    backgroundColor: '#2A5D34',
  },
  dholnaGoldStripe: {
    position: 'absolute',
    top: 8,
    width: '100%',
    height: 2,
    backgroundColor: '#ECC348',
  },
  holderArmGrip: {
    position: 'absolute',
    top: 28,
    left: 18,
    width: 38,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 6,
  },
  holderArmGripRight: {
    left: -18,
    flexDirection: 'row-reverse',
  },
  holderForearm: {
    width: 18,
    height: 7.5,
    backgroundColor: '#B57B52',
    borderRadius: 3.5,
    borderWidth: 0.8,
    borderColor: '#8C5A37',
  },
  holderHand: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A36E44',
  },
  bambooGripHandle: {
    width: 9,
    height: 13,
    backgroundColor: '#4E311A',
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#241407',
  },
});
