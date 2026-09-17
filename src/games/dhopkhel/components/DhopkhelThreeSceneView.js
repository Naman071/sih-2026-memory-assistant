/**
 * DHOP KHEL MEMORY - Clean Cognitive Game 3D Viewport
 * 
 * Clean, calm, dignified implementation following the exact proven Ubilakapi architecture:
 * - Peaceful circular playing arena with crisp white chalk boundary ring
 * - Elevated 44-degree perspective camera providing an unobstructed, top-down view
 * - 3 Beautiful stylized volumetric Northeast Indian characters standing evenly on the ring:
 *     * Player 1 — Bhaben (১. ভবেন): Ivory Eri silk kurta with traditional red Gamosa sash
 *     * Player 2 — Dipali (২. দীপালী): Terracotta-red Mekhela with golden Muga silk Chador sash
 *     * Player 3 — Pranab (৩. প্ৰণৱ): Karbi ochre-amber vest with ivory sand under-kurta sash
 * - Smooth ballistic parabolic cloth Dhop ball trajectory with dynamic spin
 * - Calm idle breathing and arm reaching kinematics (zero visual clutter, zero uncanny details)
 * - Clear senior-friendly floating identity badges and recall pedestals
 */

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import * as THREE from 'three';

const RING_RADIUS = 2.6;

// 3 Culturally grounded Northeast Indian characters (Clean Ubilakapi archetypes)
const DHOP_CHARACTERS = [
  {
    id: 1,
    name: 'Bhaben',
    badgeNumber: '1',
    clothingColor: 0xf4ebd9, // Ivory Assamese Eri silk
    accentColor: 0xdc2626,   // Red Phulam Gamosa sash
    skinTone: 0xd4a373,      // Warm skin tone
    hairColor: 0x475569,     // Dignified silver-grey hair
    trousersColor: 0x262626, // Charcoal trousers
    badgeBg: '#059669',
    badgeBorder: '#34D399',
  },
  {
    id: 2,
    name: 'Dipali',
    badgeNumber: '2',
    clothingColor: 0x9a3412, // Madder terracotta-red Mekhela
    accentColor: 0xd4af37,   // Golden Muga silk Chador sash
    skinTone: 0xe0a96d,      // Golden olive skin
    hairColor: 0x0f172a,     // Dark lustrous hair bun
    trousersColor: 0x7c2d12, // Earth wrap skirt
    badgeBg: '#2563EB',
    badgeBorder: '#60A5FA',
  },
  {
    id: 3,
    name: 'Pranab',
    badgeNumber: '3',
    clothingColor: 0xd97706, // Karbi ochre-amber vest
    accentColor: 0xfef3c7,   // Sand raw cotton sash
    skinTone: 0xc68b59,      // Weathered field skin
    hairColor: 0x334155,     // Salt-and-pepper cropped hair
    trousersColor: 0x334155, // Slate work trousers
    badgeBg: '#D97706',
    badgeBorder: '#FBBF24',
  },
];

// Equilateral triangle layout: Player 1 (top-center), Player 2 (bottom-left), Player 3 (bottom-right)
const getPlayerAngle = (index) => {
  return -Math.PI / 2 + (index * 2 * Math.PI) / 3;
};

export const DhopkhelThreeSceneView = forwardRef(function DhopkhelThreeSceneView(
  {
    isRecallMode = false,
    selectedPlayerId = null,
    onSelectPlayer,
    isCorrect = null,
    contrast = 'normal',
    isDarkMode = false,
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Three.js instances
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Scene objects
  const playerMeshesRef = useRef({});
  const player3DPositions = useRef({});
  const dhopMeshRef = useRef(null);
  const dhopShadowRef = useRef(null);
  const pedestalMeshesRef = useRef({});

  // Kinematic state
  const currentHolderRef = useRef(1);
  const flightStateRef = useRef({
    isActive: false,
    fromId: 1,
    toId: 2,
    fromPos: { x: 0, z: 0 },
    toPos: { x: 0, z: 0 },
    startTime: 0,
    duration: 850,
    onComplete: null,
  });
  const reactionStateRef = useRef({
    active: false,
    playerId: null,
    type: 'celebrate',
    startTime: 0,
    duration: 1400,
  });

  const [activeSelection, setActiveSelection] = useState(selectedPlayerId);

  useEffect(() => {
    setActiveSelection(selectedPlayerId);
  }, [selectedPlayerId]);

  // Compute clean circular 3D coordinates for all 3 players
  DHOP_CHARACTERS.forEach((char, idx) => {
    const angle = getPlayerAngle(idx);
    player3DPositions.current[char.id] = {
      x: Math.cos(angle) * RING_RADIUS,
      y: 0,
      z: Math.sin(angle) * RING_RADIUS,
      angle,
    };
  });

  // Imperative handle matching DhopkhelGame.js
  useImperativeHandle(ref, () => ({
    setHolder: (holderId) => {
      const id = Number(holderId) || 1;
      currentHolderRef.current = id;
      flightStateRef.current.isActive = false;

      const pos = player3DPositions.current[id] || { x: 0, z: -RING_RADIUS };
      const holdX = pos.x * 0.75;
      const holdZ = pos.z * 0.75;

      if (dhopMeshRef.current) {
        dhopMeshRef.current.position.set(holdX, 0.95, holdZ);
        dhopMeshRef.current.visible = true;
      }
      if (dhopShadowRef.current) {
        dhopShadowRef.current.position.set(holdX, 0.015, holdZ);
        dhopShadowRef.current.scale.set(1, 1, 1);
        dhopShadowRef.current.visible = true;
      }
    },

    passDhop: (fromId, toId, durationMs, onDone) => {
      const fId = Number(fromId) || 1;
      const tId = Number(toId) || 2;
      const fromPos = player3DPositions.current[fId] || { x: 0, z: 0 };
      const toPos = player3DPositions.current[tId] || { x: 0, z: 0 };

      flightStateRef.current = {
        isActive: true,
        fromId: fId,
        toId: tId,
        fromPos: { x: fromPos.x * 0.75, z: fromPos.z * 0.75 },
        toPos: { x: toPos.x * 0.75, z: toPos.z * 0.75 },
        startTime: performance.now(),
        duration: Math.max(durationMs || 850, 350),
        onComplete: onDone || null,
      };

      currentHolderRef.current = tId;
      if (dhopMeshRef.current) dhopMeshRef.current.visible = true;
      if (dhopShadowRef.current) dhopShadowRef.current.visible = true;
    },

    hideBall: (durationMs) => {
      flightStateRef.current.isActive = false;
      if (dhopMeshRef.current) dhopMeshRef.current.visible = false;
      if (dhopShadowRef.current) dhopShadowRef.current.visible = false;
    },

    showReaction: (playerId, type) => {
      reactionStateRef.current = {
        active: true,
        playerId: Number(playerId),
        type: type || 'celebrate',
        startTime: performance.now(),
        duration: 1400,
      };
    },

    reset: () => {
      flightStateRef.current.isActive = false;
      reactionStateRef.current.active = false;
      currentHolderRef.current = 1;
      const pos = player3DPositions.current[1] || { x: 0, z: -RING_RADIUS };
      const holdX = pos.x * 0.75;
      const holdZ = pos.z * 0.75;
      if (dhopMeshRef.current) {
        dhopMeshRef.current.position.set(holdX, 0.95, holdZ);
        dhopMeshRef.current.visible = true;
      }
      if (dhopShadowRef.current) {
        dhopShadowRef.current.position.set(holdX, 0.015, holdZ);
        dhopShadowRef.current.visible = true;
      }
    },
  }));

  // Build Clean Ubilakapi-Style 3D Scene
  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    const width = containerRef.current?.clientWidth || 360;
    const height = 320;

    // 1. Scene & Calm Mountain Atmosphere (Identical to Ubilakapi)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x0e1b15 : 0x8bc4db);
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x13261e : 0xaad4e6, 0.035);
    sceneRef.current = scene;

    // 2. Camera: Elevated 44-degree perspective camera looking down at the ring
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 100);
    camera.position.set(0, 4.2, 5.8);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }

    // 4. Lights: Soft natural lighting
    const hemiLight = new THREE.HemisphereLight(
      isDarkMode ? 0x22362b : 0xffffff,
      isDarkMode ? 0x101a14 : 0x3d4a36,
      1.15
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.6);
    sunLight.position.set(4, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 5. Circular Arena (Clean green ground with subtle red laterite center)
    const arenaGroundGeo = new THREE.CircleGeometry(3.8, 48);
    const arenaGroundMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x192d21 : 0x4f6d48, // Lush grass
      roughness: 0.85,
    });
    const arenaGround = new THREE.Mesh(arenaGroundGeo, arenaGroundMat);
    arenaGround.rotation.x = -Math.PI / 2;
    arenaGround.receiveShadow = true;
    scene.add(arenaGround);

    // Traditional White Chalk Ring
    const chalkRingGeo = new THREE.RingGeometry(RING_RADIUS - 0.04, RING_RADIUS + 0.04, 48);
    const chalkRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const chalkRing = new THREE.Mesh(chalkRingGeo, chalkRingMat);
    chalkRing.rotation.x = -Math.PI / 2;
    chalkRing.position.y = 0.01;
    scene.add(chalkRing);

    // Inner ring decorative earthen pattern
    const innerRingGeo = new THREE.RingGeometry(0.7, 0.76, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xe5c392,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.012;
    scene.add(innerRing);

    // Distant mountain backdrop silhouettes (Clean Ubilakapi cones)
    const mountainColors = isDarkMode
      ? [0x14281f, 0x183025, 0x0f1e17]
      : [0x5f806e, 0x496656, 0x3c5446];
    for (let m = 0; m < 5; m++) {
      const coneGeo = new THREE.ConeGeometry(3.5 + m * 0.8, 4 + m * 0.6, 5);
      const coneMat = new THREE.MeshStandardMaterial({
        color: mountainColors[m % mountainColors.length],
        roughness: 0.9,
      });
      const mountain = new THREE.Mesh(coneGeo, coneMat);
      mountain.position.set(-6 + m * 3.2, 1.2, -6 - (m % 2) * 2);
      scene.add(mountain);
    }

    // 6. Volumetric Player Models (Clean, dignified, styled exactly as Ubilakapi)
    const playerMeshes = {};
    const pedestalMeshes = {};

    DHOP_CHARACTERS.forEach((char) => {
      const pos = player3DPositions.current[char.id];
      if (!pos) return;

      const playerGroup = new THREE.Group();
      playerGroup.position.set(pos.x, 0, pos.z);
      // Face inward toward center of the arena
      playerGroup.lookAt(0, 0.8, 0);

      // Contact Ground Shadow
      const shadowGeo = new THREE.CircleGeometry(0.44, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.36,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.01;
      playerGroup.add(shadow);

      // Recall Mode Pedestal Ring
      const pedestalGeo = new THREE.RingGeometry(0.48, 0.58, 24);
      const pedestalMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.rotation.x = -Math.PI / 2;
      pedestal.position.y = 0.015;
      playerGroup.add(pedestal);
      pedestalMeshes[char.id] = pedestal;

      // Torso / Traditional attire (Cylinder)
      const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 12);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(char.clothingColor),
        roughness: 0.6,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.85;
      torso.castShadow = true;
      playerGroup.add(torso);

      // Shawl / Traditional Scarf sash (Torus)
      const sashGeo = new THREE.TorusGeometry(0.27, 0.05, 8, 16);
      const sashMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(char.accentColor),
        roughness: 0.5,
      });
      const sash = new THREE.Mesh(sashGeo, sashMat);
      sash.position.y = 1.05;
      sash.rotation.x = Math.PI / 3;
      playerGroup.add(sash);

      // Head (Clean sphere)
      const headGeo = new THREE.SphereGeometry(0.18, 14, 14);
      const headMat = new THREE.MeshStandardMaterial({
        color: char.skinTone,
        roughness: 0.5,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.48;
      head.castShadow = true;
      playerGroup.add(head);

      // Hair bun / headdress
      const bunGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const bunMat = new THREE.MeshStandardMaterial({ color: char.hairColor, roughness: 0.9 });
      const bun = new THREE.Mesh(bunGeo, bunMat);
      bun.position.set(0, 1.62, -0.06);
      playerGroup.add(bun);

      // Arms (left & right reaching forward with cupped hands)
      const armMat = new THREE.MeshStandardMaterial({ color: char.skinTone, roughness: 0.5 });
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8);

      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.3, 0.82, 0.2);
      leftArm.rotation.x = Math.PI / 4;
      playerGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.3, 0.82, 0.2);
      rightArm.rotation.x = Math.PI / 4;
      playerGroup.add(rightArm);

      // Feet / base
      const feetGeo = new THREE.BoxGeometry(0.36, 0.35, 0.24);
      const feetMat = new THREE.MeshStandardMaterial({ color: char.trousersColor });
      const feet = new THREE.Mesh(feetGeo, feetMat);
      feet.position.y = 0.2;
      playerGroup.add(feet);

      scene.add(playerGroup);

      playerMeshes[char.id] = {
        id: char.id,
        group: playerGroup,
        head,
        leftArm,
        rightArm,
        torso,
        basePosY: 0,
      };
    });

    playerMeshesRef.current = playerMeshes;
    pedestalMeshesRef.current = pedestalMeshes;

    // 7. Authentic Red Cloth Dhop Ball
    const dhopGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const dhopMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson red cloth
      roughness: 0.85,
      metalness: 0.05,
    });
    const dhopMesh = new THREE.Mesh(dhopGeo, dhopMat);
    dhopMesh.castShadow = true;

    // Off-white cross-quarter stitching
    const seamMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const seamH = new THREE.Mesh(new THREE.TorusGeometry(0.202, 0.009, 6, 24), seamMat);
    dhopMesh.add(seamH);
    const seamV = new THREE.Mesh(new THREE.TorusGeometry(0.202, 0.009, 6, 24), seamMat);
    seamV.rotation.y = Math.PI / 2;
    dhopMesh.add(seamV);

    const initialPos = player3DPositions.current[1] || { x: 0, z: -RING_RADIUS };
    dhopMesh.position.set(initialPos.x * 0.75, 0.95, initialPos.z * 0.75);
    scene.add(dhopMesh);
    dhopMeshRef.current = dhopMesh;

    // Ball Dynamic Ground Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.19, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const dhopShadow = new THREE.Mesh(shadowGeo, shadowMat);
    dhopShadow.rotation.x = -Math.PI / 2;
    dhopShadow.position.set(initialPos.x * 0.75, 0.015, initialPos.z * 0.75);
    scene.add(dhopShadow);
    dhopShadowRef.current = dhopShadow;

    // 8. Render & Kinematics Loop (Exact Ubilakapi Kinematics)
    const animate = () => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clockRef.current.getElapsedTime();
      const now = performance.now();

      // Subtle natural breathing motion on players
      Object.values(playerMeshes).forEach((p, idx) => {
        const breath = Math.sin(elapsed * 2.5 + idx * 1.2) * 0.015;
        p.group.position.y = p.basePosY + breath;
      });

      // Pass sequence animation (Ballistic Parabolic Arc)
      const flight = flightStateRef.current;
      if (flight.isActive) {
        const passElapsed = now - flight.startTime;
        const progress = Math.min(1, passElapsed / flight.duration);

        // Interpolate position across circular ring
        const cx = flight.fromPos.x + (flight.toPos.x - flight.fromPos.x) * progress;
        const cz = flight.fromPos.z + (flight.toPos.z - flight.fromPos.z) * progress;

        // Ballistic parabolic trajectory (Ubilakapi y peak +0.85 units)
        const cy = 0.95 + Math.sin(progress * Math.PI) * 0.85;

        dhopMesh.position.set(cx, cy, cz);
        dhopMesh.rotation.x += 0.07;
        dhopMesh.rotation.y += 0.09;

        // Dynamic ground shadow
        dhopShadow.position.set(cx, 0.015, cz);
        const shadowScale = Math.max(0.65, 1.4 - Math.sin(progress * Math.PI) * 0.45);
        dhopShadow.scale.set(shadowScale, shadowScale, shadowScale);
        dhopShadow.material.opacity = Math.max(0.18, 0.45 - Math.sin(progress * Math.PI) * 0.22);

        // Arm reach kinematics
        const passer = playerMeshes[flight.fromId];
        const receiver = playerMeshes[flight.toId];

        if (passer) {
          const passArm = Math.sin(Math.min(progress * 2, 1) * Math.PI) * 0.4;
          passer.leftArm.rotation.x = Math.PI / 4 + passArm;
          passer.rightArm.rotation.x = Math.PI / 4 + passArm;
        }

        if (receiver) {
          const recvArm = Math.sin(Math.max((progress - 0.25) / 0.75, 0) * Math.PI) * 0.5;
          receiver.leftArm.rotation.x = Math.PI / 4 + recvArm;
          receiver.rightArm.rotation.x = Math.PI / 4 + recvArm;
        }

        if (progress >= 1) {
          flight.isActive = false;
          dhopMesh.position.set(flight.toPos.x, 0.95, flight.toPos.z);
          dhopShadow.position.set(flight.toPos.x, 0.015, flight.toPos.z);
          dhopShadow.scale.set(1, 1, 1);
          dhopShadow.material.opacity = 0.45;

          if (passer) {
            passer.leftArm.rotation.x = Math.PI / 4;
            passer.rightArm.rotation.x = Math.PI / 4;
          }
          if (receiver) {
            receiver.leftArm.rotation.x = Math.PI / 4;
            receiver.rightArm.rotation.x = Math.PI / 4;
          }

          if (flight.onComplete) {
            flight.onComplete();
          }
        }
      } else {
        // Stationary: held in active player's hands
        const holderId = currentHolderRef.current;
        const pos = player3DPositions.current[holderId];
        if (pos && dhopMesh.visible) {
          const breath = Math.sin(elapsed * 2.5 + holderId * 1.2) * 0.015;
          dhopMesh.position.set(pos.x * 0.75, 0.95 + breath, pos.z * 0.75);
          dhopShadow.position.set(pos.x * 0.75, 0.015, pos.z * 0.75);
        }
      }

      // Reaction animation
      const reaction = reactionStateRef.current;
      if (reaction.active && reaction.playerId) {
        const reacting = playerMeshes[reaction.playerId];
        if (reacting) {
          const rProgress = Math.min((now - reaction.startTime) / reaction.duration, 1.0);
          if (reaction.type === 'celebrate') {
            const hop = Math.sin(rProgress * Math.PI * 3) * 0.08;
            reacting.group.position.y = reacting.basePosY + Math.max(0, hop);
            reacting.leftArm.rotation.x = -Math.PI / 3;
            reacting.rightArm.rotation.x = -Math.PI / 3;
          } else {
            reacting.head.rotation.x = Math.sin(rProgress * Math.PI * 2) * 0.2;
          }

          if (rProgress >= 1.0) {
            reaction.active = false;
            reacting.group.position.y = reacting.basePosY;
            reacting.leftArm.rotation.x = Math.PI / 4;
            reacting.rightArm.rotation.x = Math.PI / 4;
            reacting.head.rotation.set(0, 0, 0);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isDarkMode]);

  // Pedestals in Recall Mode
  useEffect(() => {
    DHOP_CHARACTERS.forEach((char) => {
      const pedestal = pedestalMeshesRef.current[char.id];
      if (pedestal && pedestal.material) {
        if (isRecallMode) {
          const isSelected = activeSelection === char.id;
          pedestal.material.opacity = isSelected ? 0.95 : 0.45;
          pedestal.material.color.setHex(isSelected ? 0x22c55e : 0xf59e0b);
          pedestal.scale.set(isSelected ? 1.15 : 1.0, isSelected ? 1.15 : 1.0, 1.0);
        } else {
          pedestal.material.opacity = 0;
        }
      }
    });
  }, [isRecallMode, activeSelection]);

  const handlePlayerClick = (playerId) => {
    if (!isRecallMode) return;
    setActiveSelection(playerId);
    if (onSelectPlayer) {
      onSelectPlayer(playerId);
    }
  };

  return (
    <View ref={containerRef} style={styles.viewportContainer}>
      {/* 3D Canvas matching Ubilakapi shell */}
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '20px',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* Floating High-Contrast Identity Badges */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {DHOP_CHARACTERS.map((char) => {
          const isSelected = isRecallMode && activeSelection === char.id;
          // Exact projected 2D coordinates for the 3 players on the circular ring:
          // Player 1 (top-center): 50% left, 18% top
          // Player 2 (bottom-left): 22% left, 66% top
          // Player 3 (bottom-right): 78% left, 66% top
          const posStyle =
            char.id === 1
              ? { left: '50%', top: '18%', transform: [{ translateX: -50 }] }
              : char.id === 2
              ? { left: '22%', top: '66%', transform: [{ translateX: -50 }] }
              : { left: '78%', top: '66%', transform: [{ translateX: -50 }] };

          return (
            <View
              key={`badge-${char.id}`}
              style={[
                styles.badgeAnchor,
                posStyle,
                isRecallMode && styles.badgeAnchorInteractive,
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                activeOpacity={isRecallMode ? 0.75 : 1.0}
                onPress={() => handlePlayerClick(char.id)}
                disabled={!isRecallMode}
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isSelected
                      ? '#064E3B'
                      : isDarkMode
                      ? 'rgba(15, 30, 23, 0.90)'
                      : 'rgba(255, 255, 255, 0.92)',
                    borderColor: isSelected
                      ? '#10B981'
                      : contrast === 'high'
                      ? '#000000'
                      : char.badgeBg,
                    borderWidth: isSelected ? 3 : 2,
                  },
                ]}
                accessibilityRole={isRecallMode ? 'button' : 'text'}
                accessibilityLabel={`${char.name}, Player ${char.id}`}
              >
                <View style={[styles.badgeNumberCircle, { backgroundColor: char.badgeBg }]}>
                  <Text style={styles.badgeNumberText}>{char.badgeNumber}</Text>
                </View>
                <Text
                  style={[
                    styles.badgeNameText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDarkMode
                        ? '#F1F5F9'
                        : '#1E293B',
                    },
                  ]}
                >
                  {char.name}
                </Text>
                {isSelected && (
                  <View style={styles.selectedCheck}>
                    <Text style={styles.selectedCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
});

export default DhopkhelThreeSceneView;

const styles = StyleSheet.create({
  viewportContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#8BC4DB',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2D4E35',
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  badgeAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  badgeAnchorInteractive: {
    cursor: 'pointer',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
  badgeNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  badgeNameText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  selectedCheck: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
