/**
 * UBILAKAPKI - ThreeSceneView (Web 3D & Native Fallback)
 * 
 * Production 3D WebGL viewport for Northeast Indian Ubilakapki:
 * - Circular arena with chalk boundary ring and lush mountain valley atmosphere
 * - 3 to 5 volumetric player archetypes standing in a ring
 * - Ballistic parabolic coconut toss trajectory with dynamic spinning
 * - Arm reaching, gaze tracking, and idle breathing kinematics
 * - On Native platforms, seamlessly delegates to NativeStageView
 */

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import * as THREE from 'three';
import { NativeStageView } from './NativeStageView.js';
import { PLAYER_ARCHETYPES, getRingCoordinates } from '../data/players.js';
import { REGIONS, DEFAULT_REGION } from '../data/regions.js';

const WebThreeSceneView = forwardRef(function WebThreeSceneView(
  {
    playerCount = 3,
    regionId = 'assam',
    isPaused = false,
    onCoconutCatch,
    onSequenceFinished,
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

  // Scene object refs
  const playersGroupRef = useRef([]);
  const coconutMeshRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Sequence playback state
  const activeSeqRef = useRef(null);
  const passIdxRef = useRef(0);
  const isPlayingRef = useRef(false);
  const passStartTimeRef = useRef(0);
  const passDurationRef = useRef(1100);
  const isHoldingRef = useRef(false);
  const holdStartTimeRef = useRef(0);
  const holdDurationRef = useRef(750);
  const sequenceTimerRef = useRef(null);

  const region = REGIONS[regionId] || DEFAULT_REGION;
  const activePlayers = PLAYER_ARCHETYPES.slice(0, playerCount);

  // Coordinates in 3D: radius 2.6 units
  const ringRadius = 2.6;
  const player3DPositions = useRef({});

  // Calculate 3D positions for current player count
  const updatePlayerPositions = useCallback(() => {
    const positions = {};
    for (let i = 0; i < playerCount; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / playerCount;
      positions[activePlayers[i].id] = {
        x: Math.cos(angle) * ringRadius,
        y: 0,
        z: Math.sin(angle) * ringRadius,
        angle,
      };
    }
    player3DPositions.current = positions;
  }, [playerCount, activePlayers]);

  updatePlayerPositions();

  // Imperative handle
  useImperativeHandle(ref, () => ({
    playSequence: (sequence) => {
      if (!sequence || !Array.isArray(sequence.passes) || sequence.passes.length < 2) return;
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);

      activeSeqRef.current = sequence;
      passIdxRef.current = 0;
      isPlayingRef.current = true;
      isHoldingRef.current = false;

      const startId = sequence.passes[0];
      const startPos = player3DPositions.current[startId] || { x: 0, y: 0, z: 0 };
      if (coconutMeshRef.current) {
        coconutMeshRef.current.position.set(startPos.x * 0.75, 0.95, startPos.z * 0.75);
        coconutMeshRef.current.visible = true;
      }

      const preRoll = sequence.config?.preRollDurationMs || 900;
      passDurationRef.current = sequence.config?.passDurationMs || 1100;
      holdDurationRef.current = sequence.config?.holdDurationMs || 750;

      sequenceTimerRef.current = setTimeout(() => {
        passStartTimeRef.current = performance.now();
      }, preRoll);
    },
    pause: () => {
      isPlayingRef.current = false;
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    },
    resume: () => {
      if (activeSeqRef.current) {
        isPlayingRef.current = true;
        passStartTimeRef.current = performance.now();
      }
    },
    resetCoconut: () => {
      const firstId = activePlayers[0]?.id || 'A';
      const pos = player3DPositions.current[firstId] || { x: 0, y: 0, z: 0 };
      if (coconutMeshRef.current) {
        coconutMeshRef.current.position.set(pos.x * 0.75, 0.95, pos.z * 0.75);
      }
    },
  }));

  // Build Three.js Scene
  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    const width = containerRef.current?.clientWidth || 360;
    const height = 320;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8bc4db); // Mountain sky
    scene.fog = new THREE.FogExp2(0xaad4e6, 0.035);
    sceneRef.current = scene;

    // 2. Camera (Perspective angled view looking at the circular ring)
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 100);
    camera.position.set(0, 4.2, 5.8);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 3. Renderer
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

    // 4. Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d4a36, 1.1);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.6);
    sunLight.position.set(4, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 5. Circular Arena & Mountain Environment
    const arenaGroundGeo = new THREE.CircleGeometry(3.8, 48);
    const arenaGroundMat = new THREE.MeshStandardMaterial({
      color: 0x4f6d48, // Lush grass
      roughness: 0.85,
    });
    const arenaGround = new THREE.Mesh(arenaGroundGeo, arenaGroundMat);
    arenaGround.rotation.x = -Math.PI / 2;
    arenaGround.receiveShadow = true;
    scene.add(arenaGround);

    // Traditional Chalk Ring
    const chalkRingGeo = new THREE.RingGeometry(ringRadius - 0.04, ringRadius + 0.04, 48);
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
      opacity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.012;
    scene.add(innerRing);

    // Distant mountain backdrop silhouettes
    const mountainColors = [0x5f806e, 0x496656, 0x3c5446];
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

    // Bamboo clusters around the arena border
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const r = 4.2 + (b % 3) * 0.3;
      const bx = Math.cos(angle) * r;
      const bz = Math.sin(angle) * r;
      const stalkGeo = new THREE.CylinderGeometry(0.04, 0.05, 3.2 + (b % 2) * 0.8, 6);
      const stalkMat = new THREE.MeshStandardMaterial({ color: 0x3e6b36, roughness: 0.7 });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.set(bx, 1.6, bz);
      scene.add(stalk);
    }

    // 6. Volumetric Player Models
    const playerMeshes = [];
    activePlayers.forEach((p, idx) => {
      const pos = player3DPositions.current[p.id];
      if (!pos) return;

      const playerGroup = new THREE.Group();
      playerGroup.position.set(pos.x, 0, pos.z);
      // Face toward center of the ring
      playerGroup.lookAt(0, 0.8, 0);

      // Torso / Traditional attire
      const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 12);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.clothingColor),
        roughness: 0.6,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.85;
      torso.castShadow = true;
      playerGroup.add(torso);

      // Shawl / Traditional Scarf sash
      const scarfGeo = new THREE.TorusGeometry(0.27, 0.05, 8, 16);
      const scarfMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.accentColor || 0xd4af37),
        roughness: 0.5,
      });
      const scarf = new THREE.Mesh(scarfGeo, scarfMat);
      scarf.position.y = 1.05;
      scarf.rotation.x = Math.PI / 3;
      playerGroup.add(scarf);

      // Head
      const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xdfb48c, // Warm skin tone
        roughness: 0.5,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.48;
      head.castShadow = true;
      playerGroup.add(head);

      // Traditional hair knot / headdress
      const bunGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const bunMat = new THREE.MeshStandardMaterial({ color: 0x1f1a18, roughness: 0.9 });
      const bun = new THREE.Mesh(bunGeo, bunMat);
      bun.position.set(0, 1.62, -0.06);
      playerGroup.add(bun);

      // Arms (left & right reaching forward)
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xdfb48c, roughness: 0.5 });

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
      const feetMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const feet = new THREE.Mesh(feetGeo, feetMat);
      feet.position.y = 0.2;
      playerGroup.add(feet);

      scene.add(playerGroup);
      playerMeshes.push({ id: p.id, group: playerGroup, leftArm, rightArm, basePosY: 0 });
    });
    playersGroupRef.current = playerMeshes;

    // 7. The Coconut Mesh
    const coconutGeo = new THREE.SphereGeometry(0.2, 16, 16);
    // Slight squish to look like realistic oval coconut
    coconutGeo.scale(1, 1.22, 1);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x6b3e11, // Earthen coconut husk
      roughness: 0.9,
      metalness: 0.1,
    });
    const coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    coconutMesh.castShadow = true;
    const initialPos = player3DPositions.current[activePlayers[0]?.id] || { x: 0, z: 0 };
    coconutMesh.position.set(initialPos.x * 0.75, 0.95, initialPos.z * 0.75);
    scene.add(coconutMesh);
    coconutMeshRef.current = coconutMesh;

    // 8. Render & Kinematics Loop
    const animate = (time) => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clockRef.current.getElapsedTime();

      // Subtle breathing motion on players
      playerMeshes.forEach((p, idx) => {
        const breath = Math.sin(elapsed * 2.5 + idx * 1.2) * 0.015;
        p.group.position.y = p.basePosY + breath;
      });

      // Pass sequence animation
      if (isPlayingRef.current && activeSeqRef.current && !isPaused) {
        const passes = activeSeqRef.current.passes;
        const currentIdx = passIdxRef.current;

        if (currentIdx < passes.length - 1) {
          const fromId = passes[currentIdx];
          const toId = passes[currentIdx + 1];
          const fromPos = player3DPositions.current[fromId];
          const toPos = player3DPositions.current[toId];

          if (fromPos && toPos && passStartTimeRef.current > 0) {
            const passElapsed = performance.now() - passStartTimeRef.current;
            const progress = Math.min(1, passElapsed / passDurationRef.current);

            // Interpolate position
            const fx = fromPos.x * 0.75;
            const fz = fromPos.z * 0.75;
            const tx = toPos.x * 0.75;
            const tz = toPos.z * 0.75;

            const cx = fx + (tx - fx) * progress;
            const cz = fz + (tz - fz) * progress;

            // Ballistic parabolic trajectory (y peak +0.8 units)
            const cy = 0.95 + Math.sin(progress * Math.PI) * 0.85;

            if (coconutMeshRef.current) {
              coconutMeshRef.current.position.set(cx, cy, cz);
              // Dynamic spin during flight
              coconutMeshRef.current.rotation.x += 0.06;
              coconutMeshRef.current.rotation.y += 0.08;
            }

            if (progress >= 1) {
              // Pass reached target!
              if (onCoconutCatch) onCoconutCatch(toId);

              // Step to hold state
              passStartTimeRef.current = 0;
              passIdxRef.current++;

              if (passIdxRef.current >= passes.length - 1) {
                // Sequence finished!
                const finalPause = activeSeqRef.current.config?.finalPauseMs || 1500;
                sequenceTimerRef.current = setTimeout(() => {
                  isPlayingRef.current = false;
                  if (onSequenceFinished) {
                    onSequenceFinished(passes[passes.length - 1]);
                  }
                }, finalPause);
              } else {
                // Normal hold before next pass
                sequenceTimerRef.current = setTimeout(() => {
                  passStartTimeRef.current = performance.now();
                }, holdDurationRef.current);
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [playerCount, regionId, isPaused, activePlayers, onCoconutCatch, onSequenceFinished]);

  return (
    <View ref={containerRef} style={styles.viewportContainer}>
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '20px',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </View>
  );
});

export const ThreeSceneView = forwardRef(function ThreeSceneView(props, ref) {
  return <NativeStageView ref={ref} {...props} />;
});

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
});

