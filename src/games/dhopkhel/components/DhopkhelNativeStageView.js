/**
 * DHOP KHEL MEMORY - High-Definition Native 3D Perspective Stage View
 * 
 * True 3D Ground Camera & Volumetric Players:
 * - Camera positioned at eye-level INSIDE the playing field looking across the ground
 * - Upper 34% contains distant Karbi/Assam green hills, trees, and soft morning sky
 * - Lower 66% contains the authentic laterite earth playing pitch with wild grass perimeter
 * - All 3 players are physically planted INSIDE the ground plane:
 *   * Player 1 (Bhaben): Center back on the pitch (x: 0, y: ground - 18, scale: 0.90)
 *   * Player 2 (Dipali): Foreground left on the pitch (x: -80, y: ground + 40, scale: 1.05)
 *   * Player 3 (Pranab): Foreground right on the pitch (x: +80, y: ground + 40, scale: 1.05)
 * - True human anatomy: Head, facial features, hair, articulated arms with cupped hands, distinct attire, sandals
 * - Gaze tracking: Players turn heads toward the active ball holder or receiver
 * - Idle breathing kinematics decoupled from floating name tags (zero label jitter)
 * - Responsive screen boundary constraints: Players, ball, and name tags NEVER leave the screen
 * - Handwoven cloth Dhop ball with parabolic 3D flight arc, tumble spin, and dynamic ground shadow
 * - Strictly zero action sounds inside Stage View
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
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Culturally authentic characters inspired by rural Assam & Karbi Anglong
const DHOP_CHARACTERS = {
  1: {
    id: 1,
    name: 'Bhaben',
    role: 'Elder Chaser',
    shirtColor: '#F4EBD9',       // Assamese Eri Silk Ivory Kurta
    shirtPiping: '#DC2626',      // Red piping
    trouserColor: '#262626',     // Charcoal Slate Trousers
    skinTone: '#D4A373',         // Warm sun-tanned complexion
    hairColor: '#475569',        // Silver-black dignified hair
    hairTrim: '#CBD5E1',
    badgeColor: '#059669',
    badgeBorder: '#10B981',
    hasGamosa: true,             // Authentic Assamese Phulam Gamosa stole
    hasVest: false,
    hasSari: false,
    baseScale: 0.90,             // Receding in 3D perspective
  },
  2: {
    id: 2,
    name: 'Dipali',
    role: 'Agile Tosser',
    shirtColor: '#9A3412',       // Warm Terracotta / Madder Red Mekhela
    shirtPiping: '#FDE047',      // Tribal gold geometric motif
    trouserColor: '#7C2D12',     // Deep Earth Wrap Skirt
    skinTone: '#E0A96D',         // Golden Olive complexion
    hairColor: '#0F172A',        // Dark hair coiled in neat bun
    hairPinColor: '#B45309',     // Carved wooden hairpin
    badgeColor: '#2563EB',
    badgeBorder: '#60A5FA',
    hasVest: false,
    hasSari: true,
    baseScale: 1.05,             // Foreground left
  },
  3: {
    id: 3,
    name: 'Pranab',
    role: 'Steady Catcher',
    shirtColor: '#D97706',       // Karbi ochre-amber vest
    shirtPiping: '#FEF3C7',      // Sand-colored inner kurta
    trouserColor: '#334155',     // Durable slate work trousers
    skinTone: '#C68B59',         // Deep weathered field complexion
    hairColor: '#334155',        // Salt-and-pepper cropped hair
    hairTrim: '#94A3B8',
    badgeColor: '#D97706',
    badgeBorder: '#FBBF24',
    hasVest: true,
    hasSari: false,
    baseScale: 1.05,             // Foreground right
  },
};

export const DhopkhelNativeStageView = forwardRef(function DhopkhelNativeStageView(
  {
    isRecallMode = false,
    selectedPlayerId = null,
    onSelectPlayer,
    isCorrect = null,
    contrast = 'normal',
    isDarkMode = false,
    onPassStart,
    onPassComplete,
  },
  ref
) {
  const { width: windowWidth } = useWindowDimensions();

  // Container layout measurements
  const [stageSize, setStageSize] = useState({
    width: Math.min(windowWidth - 32, 440),
    height: 330,
  });

  const onStageLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 50 && height > 50) {
      setStageSize({ width, height });
    }
  }, []);

  // 3D Eye-Level Ground Coordinates:
  // Horizon is at height * 0.34
  // Ground plane occupies height * 0.34 to height
  const stageCoords = useMemo(() => {
    const w = stageSize.width;
    const h = stageSize.height;

    const groundCenterY = Math.round(h * 0.65); // Ground eye-level focus
    const sideX = Math.round(Math.min(w * 0.28, 88));

    return {
      1: {
        x: 0,
        y: groundCenterY - Math.round(h * 0.22), // Center midfield inside the pitch
        scale: 0.90,
        zIndex: 10,
      },
      2: {
        x: -sideX,
        y: groundCenterY + Math.round(h * 0.08), // Foreground left inside the pitch
        scale: 1.05,
        zIndex: 25,
      },
      3: {
        x: sideX,
        y: groundCenterY + Math.round(h * 0.08), // Foreground right inside the pitch
        scale: 1.05,
        zIndex: 25,
      },
    };
  }, [stageSize]);

  // State
  const [currentHolderId, setCurrentHolderId] = useState(1);
  const [targetReceiverId, setTargetReceiverId] = useState(null);
  const [isBallVisible, setIsBallVisible] = useState(true);
  const [reactionPlayerId, setReactionPlayerId] = useState(null);

  // Ball Spatial Animation Values
  const ballPosAnim = useRef(new Animated.ValueXY({ x: 0, y: 150 })).current;
  const ballArcAnim = useRef(new Animated.Value(0)).current;      // Vertical parabolic flight curve
  const ballSpinAnim = useRef(new Animated.Value(0)).current;     // Tumble rotation
  const ballOpacityAnim = useRef(new Animated.Value(1)).current;  // Fade out for recall
  const catchPulseAnim = useRef(new Animated.Value(0)).current;   // Contact pulse

  // Living Ambient Kinematics
  const idleBreathingAnim = useRef(new Animated.Value(0)).current;
  const valleyMistAnim = useRef(new Animated.Value(0)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;

  // Arm Kinematics for each player
  const armAnims = useRef({
    1: new Animated.Value(0),
    2: new Animated.Value(0),
    3: new Animated.Value(0),
  }).current;

  // Head Turn / Gaze Tracking (-1 = left, 0 = forward, 1 = right)
  const headTurnAnims = useRef({
    1: new Animated.Value(0),
    2: new Animated.Value(0),
    3: new Animated.Value(0),
  }).current;

  // Active animation ref
  const activeAnimationRef = useRef(null);

  // Initialize ball position when coordinates update
  useEffect(() => {
    const pos = stageCoords[currentHolderId] || { x: 0, y: 150 };
    ballPosAnim.setValue({ x: pos.x, y: pos.y - 12 });
  }, [stageCoords, currentHolderId, ballPosAnim]);

  // 1. Continuous Living Kinematics (Breathing & Mist)
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(idleBreathingAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(idleBreathingAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    breathing.start();

    const mistDrift = Animated.loop(
      Animated.timing(valleyMistAnim, {
        toValue: 1,
        duration: 44000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    mistDrift.start();

    return () => {
      breathing.stop();
      mistDrift.stop();
    };
  }, [idleBreathingAnim, valleyMistAnim]);

  // Gaze tracking: Players turn heads toward active ball holder or receiver
  useEffect(() => {
    const focusId = targetReceiverId !== null ? targetReceiverId : currentHolderId;

    [1, 2, 3].forEach((pid) => {
      let targetGaze = 0;
      if (pid === 1) {
        targetGaze = focusId === 2 ? -0.8 : focusId === 3 ? 0.8 : 0;
      } else if (pid === 2) {
        targetGaze = focusId === 1 ? 0.6 : focusId === 3 ? 0.85 : 0;
      } else if (pid === 3) {
        targetGaze = focusId === 1 ? -0.6 : focusId === 2 ? -0.85 : 0;
      }

      Animated.timing(headTurnAnims[pid], {
        toValue: targetGaze,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [currentHolderId, targetReceiverId, headTurnAnims]);

  // 2. Animate a single realistic Dhop Ball transfer
  const animateBallTransfer = useCallback(
    (fromId, toId, travelDuration = 850, onComplete) => {
      const fromPos = stageCoords[fromId] || { x: 0, y: 150 };
      const toPos = stageCoords[toId] || { x: 0, y: 220 };

      // Initialize
      ballPosAnim.setValue({ x: fromPos.x, y: fromPos.y - 12 });
      ballArcAnim.setValue(0);
      ballSpinAnim.setValue(0);
      ballOpacityAnim.setValue(1);
      setIsBallVisible(true);
      setTargetReceiverId(toId);

      // Active player winds up and passes
      if (armAnims[fromId]) {
        Animated.timing(armAnims[fromId], {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }).start();
      }

      // Receiving player raises cupped hands
      if (armAnims[toId]) {
        Animated.timing(armAnims[toId], {
          toValue: 0.65,
          duration: 220,
          useNativeDriver: false,
        }).start();
      }

      if (onPassStart) {
        onPassStart(fromId, toId);
      }

      activeAnimationRef.current = Animated.parallel([
        // Spatial translation
        Animated.timing(ballPosAnim, {
          toValue: { x: toPos.x, y: toPos.y - 12 },
          duration: travelDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        // Parabolic vertical lift and drop (bounded safely to prevent leaving field)
        Animated.sequence([
          Animated.timing(ballArcAnim, {
            toValue: 1,
            duration: travelDuration * 0.52,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(ballArcAnim, {
            toValue: 0,
            duration: travelDuration * 0.48,
            easing: Easing.in(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
        // Smooth tumbling rotation during flight
        Animated.timing(ballSpinAnim, {
          toValue: 1,
          duration: travelDuration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]);

      activeAnimationRef.current.start(({ finished }) => {
        if (finished) {
          setCurrentHolderId(toId);
          setTargetReceiverId(null);

          // Reset thrower arm
          if (armAnims[fromId]) {
            Animated.timing(armAnims[fromId], {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }

          // Catcher settles hands holding the ball
          if (armAnims[toId]) {
            Animated.timing(armAnims[toId], {
              toValue: 0,
              duration: 260,
              useNativeDriver: false,
            }).start();
          }

          // Soft catch visual micro-pulse
          catchPulseAnim.setValue(1);
          Animated.timing(catchPulseAnim, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();

          if (onPassComplete) {
            onPassComplete(toId);
          }
          if (onComplete) {
            onComplete();
          }
        }
      });
    },
    [stageCoords, ballPosAnim, ballArcAnim, ballSpinAnim, ballOpacityAnim, catchPulseAnim, armAnims, onPassStart, onPassComplete]
  );

  // 3. Fade ball out for Recall phase
  const hideBallForRecall = useCallback((duration = 750) => {
    Animated.timing(ballOpacityAnim, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setIsBallVisible(false);
    });
  }, [ballOpacityAnim]);

  // 4. Trigger celebration / retry reaction
  const triggerReaction = useCallback((playerId, reactionType = 'celebrate') => {
    setReactionPlayerId(playerId);
    reactionAnim.setValue(0);

    if (reactionType === 'celebrate') {
      Animated.sequence([
        Animated.timing(reactionAnim, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: false,
        }),
        Animated.timing(reactionAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(() => {
        setReactionPlayerId(null);
      });

      if (armAnims[playerId]) {
        Animated.sequence([
          Animated.timing(armAnims[playerId], {
            toValue: 1,
            duration: 260,
            useNativeDriver: false,
          }),
          Animated.timing(armAnims[playerId], {
            toValue: 0,
            duration: 320,
            useNativeDriver: false,
          }),
        ]).start();
      }
    } else {
      Animated.sequence([
        Animated.timing(reactionAnim, {
          toValue: -0.5,
          duration: 140,
          useNativeDriver: false,
        }),
        Animated.timing(reactionAnim, {
          toValue: 0.5,
          duration: 140,
          useNativeDriver: false,
        }),
        Animated.timing(reactionAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setReactionPlayerId(null);
      });
    }
  }, [reactionAnim, armAnims]);

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      passDhop: (fromId, toId, duration, onDone) => {
        animateBallTransfer(fromId, toId, duration, onDone);
      },
      setHolder: (holderId) => {
        setCurrentHolderId(holderId);
        const pos = stageCoords[holderId] || { x: 0, y: 150 };
        ballPosAnim.setValue({ x: pos.x, y: pos.y - 12 });
        ballOpacityAnim.setValue(1);
        setIsBallVisible(true);
      },
      hideBall: hideBallForRecall,
      showReaction: triggerReaction,
      reset: () => {
        if (activeAnimationRef.current) activeAnimationRef.current.stop();
        setCurrentHolderId(1);
        setTargetReceiverId(null);
        setIsBallVisible(true);
        ballOpacityAnim.setValue(1);
        const startPos = stageCoords[1] || { x: 0, y: 150 };
        ballPosAnim.setValue({ x: startPos.x, y: startPos.y - 12 });
        setReactionPlayerId(null);
      },
    }),
    [animateBallTransfer, hideBallForRecall, triggerReaction, ballPosAnim, ballOpacityAnim, stageCoords]
  );

  // Flight Interpolations - Bounded so ball never leaves screen
  const maxSafeArc = Math.min(Math.round(stageSize.height * 0.14), 44);
  const flightHeight = ballArcAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -maxSafeArc],
  });

  const ballScale = ballArcAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.22, 1],
  });

  const ballShadowScale = ballArcAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.58, 1],
  });

  const ballShadowOpacity = ballArcAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.15, 0.4],
  });

  const ballRotation = ballSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const mistOffset = valleyMistAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 240],
  });

  return (
    <View
      style={[
        styles.stageContainer,
        {
          backgroundColor: isDarkMode ? '#0A130E' : '#E8F5E9',
          borderColor: isDarkMode ? '#1E3A2B' : '#A3D9A5',
        },
      ]}
      onLayout={onStageLayout}
    >
      {/* ========================================================
          1. SKY & DISTANT ENVIRONMENT (Upper 34% of Viewport)
          ======================================================== */}
      <View style={styles.skyLayer} pointerEvents="none">
        <View style={styles.sunGlow} />
        <Animated.View
          style={[
            styles.mistPuffLarge,
            { transform: [{ translateX: mistOffset }], top: 10 },
          ]}
        />
        <Animated.View
          style={[
            styles.mistPuffSmall,
            { transform: [{ translateX: Animated.multiply(mistOffset, 0.6) }], top: 26 },
          ]}
        />
        {/* Distant Hills */}
        <View style={styles.ridgeFar} />
        <View style={styles.ridgeNear} />

        {/* Traditional Granary Silhouette */}
        <View style={styles.ruralStiltGranary}>
          <View style={styles.thatchedRoof} />
          <View style={styles.stiltPosts} />
        </View>

        {/* Rural Split-Timber Field Fence */}
        <View style={styles.ruralTimberFence}>
          {[...Array(14)].map((_, i) => (
            <View key={`t-post-${i}`} style={styles.timberPost}>
              <View style={styles.timberPostCap} />
            </View>
          ))}
          <View style={styles.timberRailTop} />
          <View style={styles.timberRailBottom} />
        </View>

        {/* Perimeter Trees */}
        <View style={styles.treeGroveLeft}>
          <View style={styles.treeTrunk} />
          <View style={styles.treeCanopyA} />
          <View style={styles.treeCanopyB} />
        </View>
        <View style={styles.treeGroveRight}>
          <View style={styles.treeTrunk} />
          <View style={styles.treeCanopyA} />
          <View style={styles.treeCanopyB} />
        </View>
      </View>

      {/* ========================================================
          2. THE 3D PERSPECTIVE GROUND (Lower 66% of Viewport)
          Players and ball are placed physically on this surface
          ======================================================== */}
      <View style={styles.groundSurfacePlane} pointerEvents="none">
        {/* Laterite Soil Playing Pitch Oval */}
        <View style={styles.lateritePitchGround}>
          {/* White Chalk Boundary Oval */}
          <View style={styles.pitchChalkBoundary}>
            {/* Center "Ghee" Dividing Line */}
            <View style={styles.gheeDividerLine} />
            <View style={styles.centerPitchSpot} />
          </View>
        </View>
      </View>

      {/* ========================================================
          3. 3D PLAYERS & BALL LAYER (Camera inside field at eye-level)
          ======================================================== */}
      <View style={StyleSheet.absoluteFillObject}>
        {[1, 2, 3].map((playerId) => {
          const char = DHOP_CHARACTERS[playerId];
          const coords = stageCoords[playerId] || { x: 0, y: 150, scale: 1, zIndex: 10 };
          const isHolding = currentHolderId === playerId && isBallVisible;
          const isSelectedInRecall = isRecallMode && selectedPlayerId === playerId;
          const isReacting = reactionPlayerId === playerId;
          const armReach = armAnims[playerId] || new Animated.Value(0);
          const headTurn = headTurnAnims[playerId] || new Animated.Value(0);

          const breathingShift = idleBreathingAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2.5],
          });

          const headRotate = headTurn.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-18deg', '0deg', '18deg'],
          });

          const armSweep = armReach.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', playerId === 1 ? '38deg' : '-38deg'],
          });

          return (
            <View
              key={`player-${playerId}`}
              style={[
                styles.playerEntityAnchor,
                {
                  left: '50%',
                  top: coords.y,
                  zIndex: coords.zIndex,
                  transform: [
                    { translateX: coords.x - 36 },
                    { scale: coords.scale },
                  ],
                },
              ]}
            >
              {/* Interactive touch area for Recall mode */}
              <TouchableOpacity
                activeOpacity={isRecallMode ? 0.82 : 1.0}
                onPress={() => {
                  if (isRecallMode && onSelectPlayer) {
                    onSelectPlayer(playerId);
                  }
                }}
                disabled={!isRecallMode}
                accessibilityRole={isRecallMode ? 'button' : 'none'}
                accessibilityLabel={`${char.name}, Player ${char.id}`}
                style={styles.playerTouchTarget}
              >
                {/* Contact Ground Shadow on surface */}
                <View
                  style={[
                    styles.playerGroundShadow,
                    isHolding && styles.playerGroundShadowHolding,
                  ]}
                />

                {/* Volumetric Human Character Body */}
                <Animated.View
                  style={[
                    styles.characterBodyMesh,
                    {
                      transform: [
                        {
                          translateY: isReacting
                            ? reactionAnim.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: [3, 0, -10],
                              })
                            : breathingShift,
                        },
                      ],
                    },
                  ]}
                >
                  {/* Head & Traditional Hair */}
                  <Animated.View
                    style={[
                      styles.characterHeadContainer,
                      { transform: [{ rotate: headRotate }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.hairMeshBase,
                        { backgroundColor: char.hairColor },
                        char.hasSari && styles.hairBunShape,
                      ]}
                    />

                    {/* Face */}
                    <View
                      style={[
                        styles.faceSkinMesh,
                        { backgroundColor: char.skinTone },
                      ]}
                    >
                      <View style={styles.faceFeaturesRow}>
                        <View style={styles.eyeDotLeft} />
                        <View style={styles.eyeDotRight} />
                      </View>
                      <View style={styles.smileNose} />
                    </View>

                    {/* Hair Bun Accents for Dipali */}
                    {char.hasSari && (
                      <View
                        style={[
                          styles.hairBunTop,
                          { backgroundColor: char.hairColor },
                        ]}
                      >
                        <View
                          style={[
                            styles.hairPinStick,
                            { backgroundColor: char.hairPinColor },
                          ]}
                        />
                      </View>
                    )}
                  </Animated.View>

                  {/* Upper Torso */}
                  <View
                    style={[
                      styles.characterTorso,
                      { backgroundColor: char.shirtColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.torsoCollarTrim,
                        { backgroundColor: char.shirtPiping },
                      ]}
                    />

                    {/* Karbi Field Vest for Pranab */}
                    {char.hasVest && (
                      <View style={styles.fieldVestOverlay}>
                        <View style={styles.vestLapelLeft} />
                        <View style={styles.vestLapelRight} />
                      </View>
                    )}

                    {/* Assamese Phulam Gamosa for Elder Bhaben */}
                    {char.hasGamosa && (
                      <View style={styles.phulamGamosaOverlay}>
                        <View style={styles.gamosaStoleBody} />
                        <View style={styles.gamosaGosPhulBorder} />
                      </View>
                    )}

                    {/* Mekhela Chador Zari Drape for Dipali */}
                    {char.hasSari && (
                      <View style={styles.mekhelaDrapeOverlay}>
                        <View style={styles.mekhelaZariBorder} />
                      </View>
                    )}

                    {/* Left Articulated Arm */}
                    <Animated.View
                      style={[
                        styles.armLeft,
                        {
                          backgroundColor: char.shirtColor,
                          transform: [{ rotate: armSweep }],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.handCupped,
                          { backgroundColor: char.skinTone },
                        ]}
                      />
                    </Animated.View>

                    {/* Right Articulated Arm */}
                    <Animated.View
                      style={[
                        styles.armRight,
                        {
                          backgroundColor: char.shirtColor,
                          transform: [{ rotate: armSweep }],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.handCupped,
                          { backgroundColor: char.skinTone },
                        ]}
                      />
                    </Animated.View>
                  </View>

                  {/* Lower Garments & Center Seam */}
                  <View
                    style={[
                      styles.characterLowerWrap,
                      { backgroundColor: char.trouserColor },
                    ]}
                  >
                    <View style={styles.trouserSeam} />
                  </View>

                  {/* Feet touching ground */}
                  <View style={styles.feetRow}>
                    <View
                      style={[
                        styles.footSandal,
                        { backgroundColor: char.skinTone },
                      ]}
                    />
                    <View
                      style={[
                        styles.footSandal,
                        { backgroundColor: char.skinTone },
                      ]}
                    />
                  </View>
                </Animated.View>

                {/* Floating Translucent Name Tag */}
                <View
                  style={[
                    styles.floatingNameTagAnchor,
                    (isHolding || isSelectedInRecall) && styles.floatingTagActive,
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.frostedTagPill,
                      {
                        borderColor: isSelectedInRecall
                          ? '#FDE047'
                          : isHolding
                          ? char.badgeColor
                          : 'rgba(255, 255, 255, 0.45)',
                      },
                      (isHolding || isSelectedInRecall) && {
                        backgroundColor: 'rgba(15, 23, 42, 0.88)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tagNumCircle,
                        { backgroundColor: char.badgeColor },
                      ]}
                    >
                      <Text style={styles.tagNumText}>{char.id}</Text>
                    </View>

                    <Text
                      style={[
                        styles.tagNameText,
                        isSelectedInRecall && { color: '#FDE047', fontWeight: 'bold' },
                      ]}
                      numberOfLines={1}
                    >
                      {char.name}
                    </Text>

                    {isHolding && (
                      <Ionicons
                        name="ellipse"
                        size={8}
                        color="#22C55E"
                        style={{ marginLeft: 4 }}
                      />
                    )}

                    {isSelectedInRecall && (
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#FDE047"
                        style={{ marginLeft: 3 }}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ========================================================
            4. THE 3D CLOTH DHOP BALL (BALL ONLY)
            ======================================================== */}
        {isBallVisible && (
          <Animated.View
            style={[
              styles.dhopBallEntity,
              {
                opacity: ballOpacityAnim,
                left: '50%',
                top: 0,
                transform: [
                  { translateX: ballPosAnim.x },
                  {
                    translateY: Animated.add(ballPosAnim.y, flightHeight),
                  },
                  { scale: ballScale },
                  { rotate: ballRotation },
                ],
              },
            ]}
            pointerEvents="none"
          >
            {/* Spherical Woven Cloth Dhop Ball */}
            <View style={styles.clothBallSphere}>
              <View style={styles.ballQuadrantTopLeft} />
              <View style={styles.ballQuadrantBottomRight} />
              <View style={styles.ballSeamHorizontal} />
              <View style={styles.ballSeamVertical} />
              <View style={styles.ballStitchDot1} />
              <View style={styles.ballStitchDot2} />
              <View style={styles.ballStitchDot3} />
              <View style={styles.ballStitchDot4} />
              <View style={styles.ballSpecularHighlight} />
            </View>

            {/* Dynamic Ground Cast Shadow */}
            <Animated.View
              style={[
                styles.ballGroundShadow,
                {
                  transform: [
                    { translateY: Animated.multiply(flightHeight, -1) },
                    { scale: ballShadowScale },
                  ],
                  opacity: ballShadowOpacity,
                },
              ]}
            />

            {/* Catch Pulse */}
            <Animated.View
              style={[
                styles.catchImpactRing,
                {
                  opacity: catchPulseAnim,
                  transform: [
                    {
                      scale: catchPulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.6],
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

export default DhopkhelNativeStageView;

const styles = StyleSheet.create({
  stageContainer: {
    width: '100%',
    height: 330,
    borderRadius: 24,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },

  /* -------------------------------------------------------------
     1. Upper Sky & Horizon Layer (34% height)
  ------------------------------------------------------------- */
  skyLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#86D7EE', // Soft daylight sky
    overflow: 'hidden',
  },
  sunGlow: {
    position: 'absolute',
    top: -18,
    right: 32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF08A',
    opacity: 0.6,
  },
  mistPuffLarge: {
    position: 'absolute',
    width: 90,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  mistPuffSmall: {
    position: 'absolute',
    width: 55,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  ridgeFar: {
    position: 'absolute',
    top: 36,
    left: -40,
    right: -40,
    height: 70,
    backgroundColor: '#438A5E',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 200,
    opacity: 0.85,
  },
  ridgeNear: {
    position: 'absolute',
    top: 58,
    left: -20,
    right: -20,
    height: 65,
    backgroundColor: '#33734D',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 140,
  },
  ruralStiltGranary: {
    position: 'absolute',
    top: 54,
    left: '52%',
    width: 24,
    height: 20,
    opacity: 0.65,
  },
  thatchedRoof: {
    width: 24,
    height: 10,
    backgroundColor: '#78350F',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  stiltPosts: {
    width: 16,
    height: 10,
    alignSelf: 'center',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#451A03',
  },

  /* Split-Timber Field Fence */
  ruralTimberFence: {
    position: 'absolute',
    top: 86,
    left: 10,
    right: 10,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    opacity: 0.8,
  },
  timberPost: {
    width: 5,
    height: 20,
    backgroundColor: '#78350F',
    borderRadius: 1.5,
  },
  timberPostCap: {
    width: 6.5,
    height: 2.5,
    backgroundColor: '#451A03',
    borderRadius: 1,
    alignSelf: 'center',
  },
  timberRailTop: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#92400E',
  },
  timberRailBottom: {
    position: 'absolute',
    top: 13,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#92400E',
  },

  /* Trees */
  treeGroveLeft: {
    position: 'absolute',
    top: 28,
    left: 16,
    width: 36,
    height: 60,
  },
  treeGroveRight: {
    position: 'absolute',
    top: 28,
    right: 16,
    width: 36,
    height: 60,
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 0,
    left: 15,
    width: 5,
    height: 40,
    backgroundColor: '#5C381D',
    borderRadius: 2,
  },
  treeCanopyA: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E532B',
    opacity: 0.9,
  },
  treeCanopyB: {
    position: 'absolute',
    top: 12,
    left: 2,
    width: 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2D6A4F',
  },

  /* -------------------------------------------------------------
     2. Perspective Ground Plane (Lower 66%)
  ------------------------------------------------------------- */
  groundSurfacePlane: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2D5A27', // Lush wild meadow grass
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: '#386629',
  },
  lateritePitchGround: {
    position: 'absolute',
    top: 16,
    bottom: 12,
    left: 16,
    right: 16,
    borderRadius: 90,
    backgroundColor: '#8B4513', // Warm Assamese laterite earth
    borderWidth: 3,
    borderColor: '#5C2E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pitchChalkBoundary: {
    width: '92%',
    height: '84%',
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gheeDividerLine: {
    position: 'absolute',
    top: '48%',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  centerPitchSpot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  /* -------------------------------------------------------------
     3. Players & Ground Contacts
  ------------------------------------------------------------- */
  playerEntityAnchor: {
    position: 'absolute',
    width: 72,
    height: 98,
    alignItems: 'center',
  },
  playerTouchTarget: {
    width: 72,
    height: 98,
    alignItems: 'center',
    position: 'relative',
  },
  playerGroundShadow: {
    position: 'absolute',
    bottom: 2,
    width: 44,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
  },
  playerGroundShadowHolding: {
    width: 50,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  characterBodyMesh: {
    alignItems: 'center',
    position: 'relative',
  },

  /* Head & Face */
  characterHeadContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 5,
  },
  hairMeshBase: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 18,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  hairBunShape: {
    top: 2,
    width: 27,
    height: 20,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  faceSkinMesh: {
    position: 'absolute',
    bottom: 2,
    width: 22,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginTop: 2,
  },
  eyeDotLeft: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1E293B',
  },
  eyeDotRight: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1E293B',
  },
  smileNose: {
    width: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 2,
  },
  hairBunTop: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  hairPinStick: {
    width: 18,
    height: 2,
    borderRadius: 1,
    marginTop: 3,
  },

  /* Torso */
  characterTorso: {
    width: 32,
    height: 36,
    borderRadius: 8,
    marginTop: -2,
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
  },
  torsoCollarTrim: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  fieldVestOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vestLapelLeft: {
    width: 7,
    height: '100%',
    backgroundColor: '#B45309',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 6,
  },
  vestLapelRight: {
    width: 7,
    height: '100%',
    backgroundColor: '#B45309',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 6,
  },
  phulamGamosaOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gamosaStoleBody: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 9,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  gamosaGosPhulBorder: {
    position: 'absolute',
    top: 28,
    left: 4,
    width: 9,
    height: 6,
    backgroundColor: '#B91C1C',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  mekhelaDrapeOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mekhelaZariBorder: {
    position: 'absolute',
    top: 6,
    left: -4,
    width: 42,
    height: 4,
    backgroundColor: '#FDE047',
    transform: [{ rotate: '25deg' }],
  },

  /* Arms & Cupped Hands */
  armLeft: {
    position: 'absolute',
    top: 6,
    left: -9,
    width: 9,
    height: 24,
    borderRadius: 4.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  armRight: {
    position: 'absolute',
    top: 6,
    right: -9,
    width: 9,
    height: 24,
    borderRadius: 4.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  handCupped: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: -2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },

  /* Lower Garments */
  characterLowerWrap: {
    width: 28,
    height: 26,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  trouserSeam: {
    width: 1.5,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  feetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 22,
    marginTop: 1,
  },
  footSandal: {
    width: 8,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 0.5,
    borderColor: '#451A03',
  },

  /* Floating Name Tag */
  floatingNameTagAnchor: {
    position: 'absolute',
    top: -36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  floatingTagActive: {
    transform: [{ scale: 1.06 }],
  },
  frostedTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // 25% opacity frosted glass
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  tagNumCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  tagNumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagNameText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* -------------------------------------------------------------
     4. Woven Cloth Dhop Ball
  ------------------------------------------------------------- */
  dhopBallEntity: {
    position: 'absolute',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 35,
  },
  clothBallSphere: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#9A3412',
    position: 'relative',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  ballQuadrantTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 16,
    height: 16,
    backgroundColor: '#DC2626',
    opacity: 0.85,
  },
  ballQuadrantBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    backgroundColor: '#1E3A8A',
    opacity: 0.85,
  },
  ballSeamHorizontal: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#78350F',
  },
  ballSeamVertical: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#78350F',
  },
  ballStitchDot1: {
    position: 'absolute',
    top: 5,
    left: 6,
    width: 3,
    height: 2,
    backgroundColor: '#FEF08A',
    borderRadius: 1,
  },
  ballStitchDot2: {
    position: 'absolute',
    top: 6,
    right: 5,
    width: 2,
    height: 3,
    backgroundColor: '#78350F',
    borderRadius: 1,
  },
  ballStitchDot3: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    width: 3,
    height: 2,
    backgroundColor: '#FEF08A',
    borderRadius: 1,
  },
  ballStitchDot4: {
    position: 'absolute',
    bottom: 6,
    left: 5,
    width: 2,
    height: 3,
    backgroundColor: '#78350F',
    borderRadius: 1,
  },
  ballSpecularHighlight: {
    position: 'absolute',
    top: 2,
    left: 3,
    width: 11,
    height: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ rotate: '-35deg' }],
  },
  ballGroundShadow: {
    position: 'absolute',
    bottom: -6,
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  catchImpactRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FEF08A',
  },
});

