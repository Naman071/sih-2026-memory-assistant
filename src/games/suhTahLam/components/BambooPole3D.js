/**
 * SUH TAH LAM - BambooPole3D
 *
 * Real 3D cylindrical bamboo pole component:
 * - Cylindrical cross-section with top specular highlight sheen
 * - Segmented internode rings / joints
 * - 3D end-caps
 * - Ground shadow
 * - Physical animation with acceleration & deceleration
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function BambooPole3D({
  offsetX = 0, // Animated value or number
  offsetY = 0,
  length = 220,
  thickness = 13,
  isLeftPole = true,
}) {
  const animatedStyle = {
    transform: [
      { translateX: offsetX },
      { translateY: offsetY },
    ],
  };

  return (
    <Animated.View style={[styles.poleContainer, { height: length, width: thickness }, animatedStyle]}>
      {/* 3D Drop Shadow on ground */}
      <View
        style={[
          styles.shadow,
          {
            height: length + 6,
            width: thickness + 4,
            left: isLeftPole ? -3 : 3,
          },
        ]}
      />

      {/* 3D Cylindrical Bamboo Body */}
      <View style={[styles.bambooCylinder, { height: length, width: thickness }]}>
        {/* Longitudinal specular light reflection */}
        <View style={styles.specularSheen} />

        {/* Segmented Bamboo Joints / Nodes */}
        <View style={[styles.jointRing, { top: '18%' }]} />
        <View style={[styles.jointRing, { top: '38%' }]} />
        <View style={[styles.jointRing, { top: '58%' }]} />
        <View style={[styles.jointRing, { top: '78%' }]} />

        {/* Top End Cap (Beveled bamboo cut) */}
        <View style={styles.endCapTop} />

        {/* Bottom End Cap */}
        <View style={styles.endCapBottom} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  poleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shadow: {
    position: 'absolute',
    top: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 1,
  },
  bambooCylinder: {
    position: 'absolute',
    borderRadius: 7,
    backgroundColor: '#3B8226',
    borderWidth: 1.5,
    borderColor: '#1D4D14',
    overflow: 'hidden',
    zIndex: 2,
  },
  specularSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 2,
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 1.5,
  },
  jointRing: {
    position: 'absolute',
    left: -1,
    right: -1,
    height: 3.5,
    backgroundColor: '#1A3F12',
    borderTopWidth: 1,
    borderTopColor: '#7ED65B',
    borderBottomWidth: 1,
    borderBottomColor: '#122D0C',
    borderRadius: 1,
  },
  endCapTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#27571A',
    borderBottomWidth: 1,
    borderBottomColor: '#122D0C',
  },
  endCapBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#27571A',
    borderTopWidth: 1,
    borderTopColor: '#4A9933',
  },
});
