/**
 * SUH TAH LAM - Environment3D
 *
 * Authentic Open Northeast Indian Mountain Valley Landscape:
 * - Upper Backdrop: Himalayan azure sky, distant snow-capped peaks, rolling green tea hills
 * - Parallax drifting mountain clouds (3 streams)
 * - Hillside stilt granary architecture & swaying bamboo grove silhouettes
 * - Raised Open-Air Festival Stage Platform:
 *   - Sandstone courtyard floor & woven bamboo mat floor planks
 *   - Transverse runner logs (resting crossbeams under the bamboo poles)
 *   - 3x3 dance arena ground markers aligned to GRID_COORDINATES
 *   - Warm glowing festival lanterns on stage corners
 *   - Front timber trim edge
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function Environment3D({ isDarkMode = false, showGridHints = false }) {
  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;
  const cloud3Anim = useRef(new Animated.Value(0)).current;
  const groveSway = useRef(new Animated.Value(0)).current;
  const lanternGlow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const cloud1Loop = Animated.loop(
      Animated.timing(cloud1Anim, {
        toValue: 1,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const cloud2Loop = Animated.loop(
      Animated.timing(cloud2Anim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const cloud3Loop = Animated.loop(
      Animated.timing(cloud3Anim, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const groveSwayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(groveSway, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(groveSway, { toValue: -1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const lanternLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lanternGlow, { toValue: 0.9, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(lanternGlow, { toValue: 0.4, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );

    cloud1Loop.start();
    cloud2Loop.start();
    cloud3Loop.start();
    groveSwayLoop.start();
    lanternLoop.start();

    return () => {
      cloud1Loop.stop();
      cloud2Loop.stop();
      cloud3Loop.stop();
      groveSwayLoop.stop();
      lanternLoop.stop();
    };
  }, [cloud1Anim, cloud2Anim, cloud3Anim, groveSway, lanternGlow]);

  const c1x = cloud1Anim.interpolate({ inputRange: [0, 1], outputRange: [-100, 380] });
  const c2x = cloud2Anim.interpolate({ inputRange: [0, 1], outputRange: [-200, 300] });
  const c3x = cloud3Anim.interpolate({ inputRange: [0, 1], outputRange: [50, 420] });
  const groveRotate = groveSway.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-2.5deg', '0deg', '2.5deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* ========================================================
          1. SKY BACKDROP (Fills entire screen behind stage)
          ======================================================== */}
      <View style={[styles.skyLayer, isDarkMode && styles.skyLayerDark]} />

      {/* ========================================================
          2. DISTANT HIMALAYAN MOUNTAIN PEAKS
          ======================================================== */}
      <View style={styles.mountainsWrapper}>
        <View style={styles.peakFarLeft} />
        <View style={styles.peakFarRight} />
        <View style={styles.peakCenter} />
        <View style={styles.snowCapLeft} />
        <View style={styles.snowCapRight} />
      </View>

      {/* ========================================================
          3. ANIMATED PARALLAX CLOUDS
          ======================================================== */}
      <Animated.View style={[styles.cloudWrap, { top: 8, transform: [{ translateX: c1x }] }]}>
        <View style={styles.cloudPuff1} />
        <View style={styles.cloudPuff2} />
        <View style={styles.cloudPuff3} />
      </Animated.View>
      <Animated.View style={[styles.cloudWrap, { top: 22, opacity: 0.8, transform: [{ translateX: c2x }] }]}>
        <View style={styles.cloudPuff1} />
        <View style={styles.cloudPuff2} />
      </Animated.View>
      <Animated.View style={[styles.cloudWrap, { top: 14, opacity: 0.65, transform: [{ translateX: c3x }] }]}>
        <View style={[styles.cloudPuff1, { width: 40, height: 16 }]} />
      </Animated.View>

      {/* ========================================================
          4. ROLLING GREEN TEA HILLS & RIDGES
          ======================================================== */}
      <View style={styles.hillsWrapper}>
        <View style={styles.teaHillLeft} />
        <View style={styles.teaHillRight} />
        <View style={styles.teaHillCenter} />
      </View>

      {/* ========================================================
          5. HILLSIDE VILLAGE GRANARY & SWAYING BAMBOO GROVE
          ======================================================== */}
      <View style={styles.villageGranary}>
        <View style={styles.granaryRoof} />
        <View style={styles.granaryBody} />
        <View style={styles.granaryStilts} />
      </View>

      <Animated.View style={[styles.bambooGroveCluster, { transform: [{ rotate: groveRotate }] }]}>
        <View style={[styles.groveCulm, { height: 32 }]} />
        <View style={[styles.groveCulm, { height: 40, backgroundColor: '#1E5C28' }]} />
        <View style={[styles.groveCulm, { height: 26 }]} />
        <View style={[styles.groveCulm, { height: 36, backgroundColor: '#245E2C' }]} />
      </Animated.View>

      {/* ========================================================
          6. RAISED OPEN-AIR FESTIVAL STAGE PLATFORM
          Bounded from top: 58 down to bottom: 14 (Exact bounds of stageArena)
          ======================================================== */}
      <View style={[styles.stagePlatform, isDarkMode && styles.stagePlatformDark]}>
        {/* Natural Sandstone Courtyard Floor Base */}
        <View style={styles.courtyardFloorBase} />

        {/* Woven Bamboo Floor Planks */}
        <View style={styles.bambooPlankRow1} />
        <View style={styles.bambooPlankRow2} />
        <View style={styles.bambooPlankRow3} />

        {/* Vertical floor weave planks */}
        <View style={[styles.plankVertical, { left: '25%' }]} />
        <View style={[styles.plankVertical, { left: '50%' }]} />
        <View style={[styles.plankVertical, { left: '75%' }]} />

        {/* 3x3 Ground Inlay Markers matching GRID_COORDINATES */}
        <View style={styles.gridInlayContainer}>
          {/* Row 1: y = -42 */}
          <View style={[styles.gridMarkerDot, { left: '26%', top: '22%' }, showGridHints && styles.gridMarkerActive]} />
          <View style={[styles.gridMarkerDot, { left: '49%', top: '22%' }, showGridHints && styles.gridMarkerActive]} />
          <View style={[styles.gridMarkerDot, { left: '72%', top: '22%' }, showGridHints && styles.gridMarkerActive]} />

          {/* Row 2: y = 0 */}
          <View style={[styles.gridMarkerDot, { left: '26%', top: '48%' }, showGridHints && styles.gridMarkerActive]} />
          <View style={[styles.gridMarkerDot, styles.gridCenterMarker, { left: '48.5%', top: '47.5%' }]} />
          <View style={[styles.gridMarkerDot, { left: '72%', top: '48%' }, showGridHints && styles.gridMarkerActive]} />

          {/* Row 3: y = +42 */}
          <View style={[styles.gridMarkerDot, { left: '26%', top: '74%' }, showGridHints && styles.gridMarkerActive]} />
          <View style={[styles.gridMarkerDot, { left: '49%', top: '74%' }, showGridHints && styles.gridMarkerActive]} />
          <View style={[styles.gridMarkerDot, { left: '72%', top: '74%' }, showGridHints && styles.gridMarkerActive]} />
        </View>

        {/* Transverse Wooden Runner Logs (Resting crossbeams under bamboo poles) */}
        <View style={[styles.baseRunnerLog, { top: 22 }]}>
          <View style={styles.woodGrainStripe} />
          <View style={styles.woodEndCapLeft} />
          <View style={styles.woodEndCapRight} />
        </View>

        <View style={[styles.baseRunnerLog, { bottom: 22 }]}>
          <View style={styles.woodGrainStripe} />
          <View style={styles.woodEndCapLeft} />
          <View style={styles.woodEndCapRight} />
        </View>

        {/* Warm Glowing Amber Stage Lanterns on Corners */}
        <Animated.View style={[styles.stageLantern, { top: 8, left: 10, opacity: lanternGlow }]} />
        <Animated.View style={[styles.stageLantern, { top: 8, right: 10, opacity: lanternGlow }]} />
      </View>

      {/* Front Platform Timber Trim Ledge */}
      <View style={styles.frontPlatformEdge} />
    </View>
  );
}

const styles = StyleSheet.create({
  /* 1. Sky */
  skyLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7EB1C7',
  },
  skyLayerDark: {
    backgroundColor: '#1E3545',
  },

  /* 2. Mountains */
  mountainsWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  peakFarLeft: {
    position: 'absolute',
    top: -20,
    left: -40,
    width: 220,
    height: 90,
    backgroundColor: '#356375',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    opacity: 0.75,
  },
  peakFarRight: {
    position: 'absolute',
    top: -25,
    right: -30,
    width: 250,
    height: 100,
    backgroundColor: '#274D5C',
    borderTopLeftRadius: 125,
    borderTopRightRadius: 125,
    opacity: 0.8,
  },
  peakCenter: {
    position: 'absolute',
    top: 5,
    left: 80,
    width: 190,
    height: 65,
    backgroundColor: '#3D6F82',
    borderTopLeftRadius: 95,
    borderTopRightRadius: 95,
    opacity: 0.65,
  },
  snowCapLeft: {
    position: 'absolute',
    top: 2,
    left: 20,
    width: 35,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(240, 248, 255, 0.7)',
  },
  snowCapRight: {
    position: 'absolute',
    top: -4,
    right: 38,
    width: 45,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(240, 248, 255, 0.65)',
  },

  /* 3. Parallax Clouds */
  cloudWrap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cloudPuff1: {
    width: 46,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: -7,
  },
  cloudPuff2: {
    width: 58,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginRight: -7,
  },
  cloudPuff3: {
    width: 38,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },

  /* 4. Green Tea Hills */
  hillsWrapper: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 45,
    overflow: 'hidden',
  },
  teaHillLeft: {
    position: 'absolute',
    bottom: 0,
    left: -30,
    width: 220,
    height: 42,
    backgroundColor: '#1E5232',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },
  teaHillRight: {
    position: 'absolute',
    bottom: 0,
    right: -20,
    width: 240,
    height: 45,
    backgroundColor: '#2B6E3F',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  teaHillCenter: {
    position: 'absolute',
    bottom: 0,
    left: 70,
    width: 180,
    height: 35,
    backgroundColor: '#1B4724',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
  },

  /* 5. Village Details */
  villageGranary: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 34,
    height: 28,
  },
  granaryRoof: {
    width: 34,
    height: 10,
    backgroundColor: '#8C5627',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  granaryBody: {
    width: 26,
    height: 9,
    backgroundColor: '#5C3817',
    marginLeft: 4,
  },
  granaryStilts: {
    width: 22,
    height: 9,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#3E240F',
    marginLeft: 6,
  },
  bambooGroveCluster: {
    position: 'absolute',
    top: 28,
    right: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    transformOrigin: 'bottom center',
  },
  groveCulm: {
    width: 3.5,
    backgroundColor: '#17401C',
    borderRadius: 2,
    marginRight: 2.5,
  },

  /* 6. Raised Festival Stage Platform */
  stagePlatform: {
    position: 'absolute',
    top: 58,
    bottom: 14,
    left: 12,
    right: 12,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#2A5D34',
    backgroundColor: '#B3997D',
    overflow: 'hidden',
    elevation: 4,
  },
  stagePlatformDark: {
    backgroundColor: '#5D4632',
    borderColor: '#1E3D23',
  },
  courtyardFloorBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C2A788',
    opacity: 0.9,
  },
  bambooPlankRow1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '33.3%',
    backgroundColor: '#CCAFA2',
    opacity: 0.35,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(54, 38, 22, 0.25)',
  },
  bambooPlankRow2: {
    position: 'absolute',
    top: '33.3%',
    left: 0,
    right: 0,
    height: '33.3%',
    backgroundColor: '#C5A698',
    opacity: 0.3,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(54, 38, 22, 0.25)',
  },
  bambooPlankRow3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33.3%',
    backgroundColor: '#CCAFA2',
    opacity: 0.35,
  },
  plankVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(54, 38, 22, 0.12)',
  },
  gridInlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  gridMarkerDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: 'rgba(27, 77, 32, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridCenterMarker: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: 'rgba(245, 158, 11, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  gridMarkerActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#FCD34D',
    transform: [{ scale: 1.3 }],
  },
  baseRunnerLog: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5D4037',
    borderWidth: 1,
    borderColor: '#3E2723',
    zIndex: 3,
  },
  woodGrainStripe: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 2.5,
    height: 2,
    backgroundColor: '#795548',
    borderRadius: 1,
  },
  woodEndCapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderRadius: 2.5,
    backgroundColor: '#4E342E',
  },
  woodEndCapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderRadius: 2.5,
    backgroundColor: '#4E342E',
  },
  stageLantern: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFAB40',
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 4,
  },
  frontPlatformEdge: {
    position: 'absolute',
    bottom: 9,
    left: 12,
    right: 12,
    height: 6,
    backgroundColor: '#264E2E',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#1D3D23',
    zIndex: 5,
  },
});
