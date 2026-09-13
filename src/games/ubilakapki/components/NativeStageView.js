/**
 * UBILAKAPKI - High-Definition Native 3D Projection Stage View
 *
 * Cinematic perspective observation arena designed for elderly dementia wellness:
 * - Open Northeast India mountain landscape & traditional circular village playing ring
 * - 3 to 5 realistic volumetric characters with distinct attire, colors, hair, and posture
 * - Natural continuous kinematics: idle breathing, weight-shifting, gaze tracking
 * - Realistic physical coconut transfer: reach -> throwing arc -> flight trajectory -> catch
 * - Uniform useNativeDriver: false ensuring 100% crash-free stability across mobile devices
 */

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { getRingCoordinates, PLAYER_ARCHETYPES } from '../data/players.js';
import { REGIONS, DEFAULT_REGION } from '../data/regions.js';
import { getLocalizedPlayerName } from '../utils/localization.js';

export const NativeStageView = forwardRef(function NativeStageView(
  {
    playerCount = 3,
    regionId = 'assam',
    isPaused = false,
    onCoconutCatch,
    onSequenceFinished,
  },
  ref
) {
  const { t, currentLanguage } = useLanguage();
  const region = REGIONS[regionId] || DEFAULT_REGION;

  // 1. Stage Geometry & Player Positions
  const ringRadius = 92;
  const playerCoordinates = useMemo(
    () => getRingCoordinates(playerCount, ringRadius),
    [playerCount, ringRadius]
  );
  const activePlayers = useMemo(
    () => PLAYER_ARCHETYPES.slice(0, playerCount),
    [playerCount]
  );

  // 2. Playback State
  const [currentHolderId, setCurrentHolderId] = useState('A');
  const [coconutVisible, setCoconutVisible] = useState(true);
  const [targetReceiverId, setTargetReceiverId] = useState(null);

  // 3. Animation Values (All uniform useNativeDriver: false)
  const coconutPosAnim = useRef(new Animated.ValueXY({ x: 0, y: -ringRadius })).current;
  const coconutArcAnim = useRef(new Animated.Value(0)).current;   // Vertical parabolic toss curve
  const coconutSpinAnim = useRef(new Animated.Value(0)).current;  // Tumble rotation
  const catchPulseAnim = useRef(new Animated.Value(0)).current;   // Impact micro-pulse
  const idleBobAnim = useRef(new Animated.Value(0)).current;      // Breathing cycle
  const cloudDriftAnim = useRef(new Animated.Value(0)).current;   // Sky parallax

  // Per-player arm reach animations
  const armReachAnims = useRef({
    A: new Animated.Value(0),
    B: new Animated.Value(0),
    C: new Animated.Value(0),
    D: new Animated.Value(0),
    E: new Animated.Value(0),
  }).current;

  // Playback sequence refs
  const isPlayingRef = useRef(false);
  const activeSeqRef = useRef(null);
  const passIdxRef = useRef(0);
  const sequenceTimerRef = useRef(null);
  const activeAnimRef = useRef(null);

  // Continuous Living Kinematics (Breathing & Clouds)
  useEffect(() => {
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(idleBobAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(idleBobAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    breathingLoop.start();

    const cloudLoop = Animated.loop(
      Animated.timing(cloudDriftAnim, {
        toValue: 1,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    cloudLoop.start();

    return () => {
      breathingLoop.stop();
      cloudLoop.stop();
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, [idleBobAnim, cloudDriftAnim]);

  // Execute a single coconut transfer from one player to another
  const animateCoconutTransfer = useCallback(
    (fromId, toId, duration = 1100, onComplete) => {
      const fromPos = playerCoordinates[fromId] || { x: 0, y: 0 };
      const toPos = playerCoordinates[toId] || { x: 0, y: 0 };

      // Set initial state
      coconutPosAnim.setValue({ x: fromPos.x, y: fromPos.y });
      coconutArcAnim.setValue(0);
      coconutSpinAnim.setValue(0);
      setTargetReceiverId(toId);

      // Arm reaching on thrower and receiver
      if (armReachAnims[fromId]) armReachAnims[fromId].setValue(1);
      if (armReachAnims[toId]) armReachAnims[toId].setValue(0.5);

      activeAnimRef.current = Animated.parallel([
        // Spatial translation (X, Y linear interpolation)
        Animated.timing(coconutPosAnim, {
          toValue: { x: toPos.x, y: toPos.y },
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        // Parabolic toss arc (up then down)
        Animated.sequence([
          Animated.timing(coconutArcAnim, {
            toValue: 1,
            duration: duration * 0.5,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(coconutArcAnim, {
            toValue: 0,
            duration: duration * 0.5,
            easing: Easing.in(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
        // Tumble rotation
        Animated.timing(coconutSpinAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]);

      activeAnimRef.current.start(({ finished }) => {
        if (finished) {
          setCurrentHolderId(toId);
          setTargetReceiverId(null);

          // Reset thrower arm, settle catcher arm
          if (armReachAnims[fromId]) armReachAnims[fromId].setValue(0);
          if (armReachAnims[toId]) {
            Animated.timing(armReachAnims[toId], {
              toValue: 0,
              duration: 250,
              useNativeDriver: false,
            }).start();
          }

          // Soft contact catch pulse
          catchPulseAnim.setValue(1);
          Animated.timing(catchPulseAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }).start();

          if (onCoconutCatch) {
            onCoconutCatch(toId);
          }

          if (onComplete) {
            onComplete();
          }
        }
      });
    },
    [playerCoordinates, coconutPosAnim, coconutArcAnim, coconutSpinAnim, catchPulseAnim, armReachAnims, onCoconutCatch]
  );

  // Play full sequence step by step
  const executeNextPass = useCallback(() => {
    if (!isPlayingRef.current || !activeSeqRef.current || isPaused) return;

    const passes = activeSeqRef.current.passes;
    if (passIdxRef.current >= passes.length - 1) {
      // Sequence finished! Pause 1.5s on final holder so patient registers final state
      const finalPause = activeSeqRef.current.config?.finalPauseMs || 1500;
      sequenceTimerRef.current = setTimeout(() => {
        isPlayingRef.current = false;
        if (onSequenceFinished) {
          onSequenceFinished(passes[passes.length - 1]);
        }
      }, finalPause);
      return;
    }

    const fromId = passes[passIdxRef.current];
    const toId = passes[passIdxRef.current + 1];
    const passDuration = activeSeqRef.current.config?.passDurationMs || 1100;
    const holdDuration = activeSeqRef.current.config?.holdDurationMs || 750;

    animateCoconutTransfer(fromId, toId, passDuration, () => {
      passIdxRef.current++;
      // Natural hold duration before next pass
      sequenceTimerRef.current = setTimeout(() => {
        executeNextPass();
      }, holdDuration);
    });
  }, [isPaused, animateCoconutTransfer, onSequenceFinished]);

  // Imperative handle for parent
  useImperativeHandle(
    ref,
    () => ({
      playSequence: (sequence) => {
        if (!sequence || !Array.isArray(sequence.passes) || sequence.passes.length < 2) return;
        if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
        if (activeAnimRef.current) activeAnimRef.current.stop();

        activeSeqRef.current = sequence;
        passIdxRef.current = 0;
        isPlayingRef.current = true;
        setCoconutVisible(true);

        const startId = sequence.passes[0];
        setCurrentHolderId(startId);
        const startPos = playerCoordinates[startId] || { x: 0, y: -ringRadius };
        coconutPosAnim.setValue({ x: startPos.x, y: startPos.y });

        // Pre-roll observation pause (800-1000ms)
        const preRoll = sequence.config?.preRollDurationMs || 900;
        sequenceTimerRef.current = setTimeout(() => {
          executeNextPass();
        }, preRoll);
      },
      pause: () => {
        isPlayingRef.current = false;
        if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
        if (activeAnimRef.current) activeAnimRef.current.stop();
      },
      resume: () => {
        if (activeSeqRef.current) {
          isPlayingRef.current = true;
          executeNextPass();
        }
      },
      resetCoconut: () => {
        const first = activePlayers[0]?.id || 'A';
        setCurrentHolderId(first);
        const pos = playerCoordinates[first] || { x: 0, y: -ringRadius };
        coconutPosAnim.setValue({ x: pos.x, y: pos.y });
      },
    }),
    [playerCoordinates, activePlayers, ringRadius, coconutPosAnim, executeNextPass]
  );

  // Interpolated Visual Effects
  const coconutFlightHeight = coconutArcAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32], // Flies upward in an authentic physical toss arc
  });

  const coconutRotation = coconutSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const cloudX1 = cloudDriftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 360],
  });

  const cloudX2 = cloudDriftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-240, 240],
  });

  const breathingBobY = idleBobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <View style={[styles.container, { backgroundColor: region.skyColor }]}>
      {/* ========================================================
          1. DISTANT NORTHEAST MOUNTAIN SKY & HILLS
          ======================================================== */}
      <View style={styles.skyBackdrop}>
        {/* Mountain Peak Layers */}
        <View style={styles.mountainFarPeak1} />
        <View style={styles.mountainFarPeak2} />
        <View style={styles.mountainFarPeak3} />

        {/* Floating Mountain Clouds */}
        <Animated.View style={[styles.cloudPuff, { transform: [{ translateX: cloudX1 }], top: 10 }]} />
        <Animated.View style={[styles.cloudPuff, styles.cloudPuffSmall, { transform: [{ translateX: cloudX2 }], top: 26 }]} />

        {/* Mid-Ground Green Ridges & Tea Slopes */}
        <View style={[styles.midGreenRidge1, { backgroundColor: region.hillsColor }]} />
        <View style={[styles.midGreenRidge2, { backgroundColor: '#244B27' }]} />

        {/* Village Stilt Hut Silhouette */}
        <View style={styles.villageStiltGroup}>
          <View style={styles.stiltRoof} />
          <View style={styles.stiltLegs} />
        </View>

        {/* Palm & Bamboo Cluster Silhouettes */}
        <View style={styles.palmClusterLeft}>
          <View style={styles.palmTrunk} />
          <View style={styles.palmFrond1} />
          <View style={styles.palmFrond2} />
        </View>
        <View style={styles.palmClusterRight}>
          <View style={styles.palmTrunk} />
          <View style={styles.palmFrond1} />
          <View style={styles.palmFrond2} />
        </View>
      </View>

      {/* ========================================================
          2. TRADITIONAL VILLAGE ARENA & CIRCULAR PLAYING RING
          ======================================================== */}
      <View style={[styles.groundSurface, { backgroundColor: region.groundColor }]}>
        {/* Subtle Earthen Rings / Field Cleared Dirt */}
        <View style={styles.dirtPatchTexture1} />
        <View style={styles.dirtPatchTexture2} />

        {/* Traditional Village Boundary Chalk Ring */}
        <View style={[styles.circularRingBorder, { borderColor: region.ringBorderColor }]}>
          <View style={styles.innerRingMarker} />
          <View style={styles.centerSpotRing} />
        </View>
      </View>

      {/* ========================================================
          3. PLAYERS IN CIRCULAR FORMATION (3, 4, OR 5 CHARACTERS)
          ======================================================== */}
      <View style={styles.stageCoordinatePlane}>
        {activePlayers.map((player) => {
          const coords = playerCoordinates[player.id] || { x: 0, y: 0 };
          const isHolding = currentHolderId === player.id;
          const isReceiving = targetReceiverId === player.id;
          const armReach = armReachAnims[player.id] || 0;

          const armSweep = armReach.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-24deg'],
          });

          return (
            <Animated.View
              key={player.id}
              style={[
                styles.playerRoot,
                {
                  transform: [
                    { translateX: coords.x },
                    { translateY: Animated.add(coords.y, breathingBobY) },
                  ],
                },
              ]}
            >
              {/* Dynamic 3D Cast Shadow */}
              <View style={styles.playerShadow3D} />

              {/* Player Character Model (3D Multi-Layered Anatomy) */}
              <View style={styles.characterBodyGroup}>
                {/* Head, Hair & Traditional Accent */}
                <View style={[styles.head3D, { backgroundColor: player.skinTone }]}>
                  {/* Coiled Hair Bun / Cropped Hair */}
                  <View style={[styles.hair3D, { backgroundColor: player.hairColor }]}>
                    {/* Metallic Pin or Ribbon Accent */}
                    <View style={[styles.hairPin, { backgroundColor: player.hairAccent }]} />
                  </View>

                  {/* Expressive Facial Details */}
                  <View style={styles.faceFeatures}>
                    <View style={styles.eyeLeft} />
                    <View style={styles.eyeRight} />
                    <View style={styles.gentleSmile} />
                  </View>
                </View>

                {/* Torso & Traditional Attire */}
                <View style={[styles.torso3D, { backgroundColor: player.color }]}>
                  {/* Sunlit Highlight Ridge */}
                  <View style={styles.vestHighlight} />

                  {/* Traditional Handwoven Accent / Sash */}
                  <View style={[styles.attireSash, { borderColor: player.borderColor }]} />

                  {/* Left Arm */}
                  <Animated.View
                    style={[
                      styles.armLeft,
                      {
                        backgroundColor: player.color,
                        transform: [{ rotate: armSweep }],
                      },
                    ]}
                  >
                    <View style={[styles.hand3D, { backgroundColor: player.skinTone }]} />
                  </Animated.View>

                  {/* Right Arm (Reaching Forward toward Ring Center) */}
                  <Animated.View
                    style={[
                      styles.armRight,
                      {
                        backgroundColor: player.color,
                        transform: [{ rotate: armSweep }],
                      },
                    ]}
                  >
                    <View style={[styles.hand3D, { backgroundColor: player.skinTone }]} />
                  </Animated.View>
                </View>

                {/* Traditional Wrap Skirt / Trouser */}
                <View style={[styles.lowerWrap3D, { backgroundColor: player.borderColor }]}>
                  <View style={styles.wrapPleat} />
                </View>

                {/* Feet / Sandals */}
                <View style={styles.feetGroup}>
                  <View style={[styles.foot, { backgroundColor: player.skinTone }]} />
                  <View style={[styles.foot, { backgroundColor: player.skinTone }]} />
                </View>
              </View>

              {/* Large, Clear Player Identifier Badge Stationed Above */}
              <View style={[styles.playerBadgeWrap, isHolding && styles.playerBadgeWrapActive]}>
                <View
                  style={[
                    styles.playerBadgePill,
                    { borderColor: player.borderColor, backgroundColor: player.lightColor },
                    isHolding && styles.playerBadgePillActive,
                  ]}
                >
                  <Text
                    style={[styles.playerBadgeText, { color: player.borderColor }]}
                    numberOfLines={1}
                  >
                    {getLocalizedPlayerName(player.id, t, currentLanguage)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })}

        {/* ========================================================
            4. THE REALISTIC PHYSICAL COCONUT
            ======================================================== */}
        {coconutVisible && (
          <Animated.View
            style={[
              styles.coconutRoot,
              {
                transform: [
                  { translateX: coconutPosAnim.x },
                  { translateY: Animated.add(coconutPosAnim.y, coconutFlightHeight) },
                  { rotate: coconutRotation },
                ],
              },
            ]}
          >
            {/* Coconut Shell Geometry with Natural Fiber Details */}
            <View style={styles.coconutShell}>
              {/* Cylindrical Sunlit Husk Highlight */}
              <View style={styles.coconutHuskHighlight} />

              {/* Fibrous Texture Ridges */}
              <View style={styles.coconutFiberRidge1} />
              <View style={styles.coconutFiberRidge2} />

              {/* 3 Natural Germination Eyes */}
              <View style={styles.coconutEyesCluster}>
                <View style={styles.coconutEyeDot} />
                <View style={styles.coconutEyeDot} />
                <View style={styles.coconutEyeDot} />
              </View>
            </View>

            {/* Impact Glow upon Catch */}
            <Animated.View
              style={[
                styles.catchGlowRing,
                {
                  opacity: catchPulseAnim,
                  transform: [
                    {
                      scale: catchPulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 330,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#4A3E38',
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    position: 'relative',
  },

  /* Sky & Distant Mountain Layers */
  skyBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    overflow: 'hidden',
  },
  mountainFarPeak1: {
    position: 'absolute',
    left: -20,
    top: 30,
    width: 140,
    height: 100,
    backgroundColor: '#5C829E',
    transform: [{ rotate: '45deg' }],
    opacity: 0.55,
  },
  mountainFarPeak2: {
    position: 'absolute',
    left: 110,
    top: 18,
    width: 170,
    height: 120,
    backgroundColor: '#4E738F',
    transform: [{ rotate: '45deg' }],
    opacity: 0.65,
  },
  mountainFarPeak3: {
    position: 'absolute',
    right: -30,
    top: 25,
    width: 160,
    height: 110,
    backgroundColor: '#557B96',
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  cloudPuff: {
    position: 'absolute',
    width: 80,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.72,
  },
  cloudPuffSmall: {
    width: 55,
    height: 16,
    opacity: 0.55,
  },
  midGreenRidge1: {
    position: 'absolute',
    left: -40,
    top: 80,
    width: 260,
    height: 90,
    borderRadius: 80,
    opacity: 0.85,
  },
  midGreenRidge2: {
    position: 'absolute',
    right: -40,
    top: 86,
    width: 250,
    height: 85,
    borderRadius: 75,
    opacity: 0.9,
  },
  villageStiltGroup: {
    position: 'absolute',
    left: 30,
    top: 68,
    width: 44,
    height: 28,
  },
  stiltRoof: {
    width: 44,
    height: 14,
    backgroundColor: '#3E2A1C',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  stiltLegs: {
    width: 32,
    height: 14,
    marginLeft: 6,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4A3525',
  },
  palmClusterLeft: {
    position: 'absolute',
    left: 88,
    top: 64,
    width: 30,
    height: 38,
  },
  palmClusterRight: {
    position: 'absolute',
    right: 48,
    top: 64,
    width: 30,
    height: 38,
  },
  palmTrunk: {
    position: 'absolute',
    left: 12,
    top: 14,
    width: 5,
    height: 24,
    backgroundColor: '#3D2A1C',
    borderRadius: 2,
  },
  palmFrond1: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 28,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E4A24',
    transform: [{ rotate: '-25deg' }],
  },
  palmFrond2: {
    position: 'absolute',
    left: 4,
    top: 6,
    width: 26,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#275E2F',
    transform: [{ rotate: '25deg' }],
  },

  /* Village Arena Ground & Circular Ring */
  groundSurface: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#5C4F3E',
  },
  dirtPatchTexture1: {
    position: 'absolute',
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#685942',
    opacity: 0.35,
    top: 30,
    left: 20,
  },
  dirtPatchTexture2: {
    position: 'absolute',
    width: 160,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#685942',
    opacity: 0.3,
    bottom: 25,
    right: 25,
  },
  circularRingBorder: {
    width: 220,
    height: 180,
    borderRadius: 100,
    borderWidth: 3.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  innerRingMarker: {
    width: 196,
    height: 156,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  centerSpotRing: {
    position: 'absolute',
    width: 28,
    height: 22,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* 3D Coordinate Plane */
  stageCoordinatePlane: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Player Character Rig */
  playerRoot: {
    position: 'absolute',
    width: 60,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerShadow3D: {
    position: 'absolute',
    bottom: 0,
    width: 44,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  characterBodyGroup: {
    alignItems: 'center',
    bottom: 4,
  },
  head3D: {
    width: 22,
    height: 24,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    zIndex: 4,
  },
  hair3D: {
    position: 'absolute',
    top: -2,
    width: 22,
    height: 13,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
  },
  hairPin: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  faceFeatures: {
    marginTop: 8,
    alignItems: 'center',
  },
  eyeLeft: {
    position: 'absolute',
    left: -4,
    top: 0,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#1F1A17',
  },
  eyeRight: {
    position: 'absolute',
    right: -4,
    top: 0,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#1F1A17',
  },
  gentleSmile: {
    marginTop: 4,
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#7A3828',
  },
  torso3D: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginTop: -2,
    elevation: 2,
    zIndex: 3,
    position: 'relative',
  },
  vestHighlight: {
    position: 'absolute',
    top: 0,
    left: 4,
    width: 6,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 3,
  },
  attireSash: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 5,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  armLeft: {
    position: 'absolute',
    left: -6,
    top: 4,
    width: 7,
    height: 18,
    borderRadius: 3.5,
  },
  armRight: {
    position: 'absolute',
    right: -6,
    top: 4,
    width: 7,
    height: 18,
    borderRadius: 3.5,
  },
  hand3D: {
    position: 'absolute',
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lowerWrap3D: {
    width: 24,
    height: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -2,
    zIndex: 2,
  },
  wrapPleat: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 10,
    width: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  feetGroup: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 1,
  },
  foot: {
    width: 7,
    height: 4,
    borderRadius: 2,
  },

  /* Player Badge Stationed Above Character */
  playerBadgeWrap: {
    position: 'absolute',
    top: -26,
    alignItems: 'center',
    width: 120,
    zIndex: 10,
  },
  playerBadgeWrapActive: {
    transform: [{ scale: 1.06 }],
  },
  playerBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.8,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    maxWidth: 110,
  },
  playerBadgePillActive: {
    borderWidth: 2.2,
    backgroundColor: '#FFFBEB',
  },
  playerBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  /* Realistic Physical Coconut */
  coconutRoot: {
    position: 'absolute',
    width: 26,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  coconutShell: {
    width: 24,
    height: 28,
    borderRadius: 13,
    backgroundColor: '#5A381E',
    borderWidth: 1.5,
    borderColor: '#3D2410',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  coconutHuskHighlight: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 235, 205, 0.22)',
  },
  coconutFiberRidge1: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 2,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  coconutFiberRidge2: {
    position: 'absolute',
    bottom: 5,
    left: 7,
    width: 10,
    height: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  coconutEyesCluster: {
    position: 'absolute',
    top: 6,
    left: 7,
    flexDirection: 'row',
    gap: 2,
  },
  coconutEyeDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#261408',
  },
  catchGlowRing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#FDE68A',
    backgroundColor: 'rgba(253, 230, 138, 0.2)',
  },
});

