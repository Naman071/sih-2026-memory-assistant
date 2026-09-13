/**
 * SUH TAH LAM - BambooGroup3D
 *
 * Coordinates the dual-pole bamboo assembly:
 * - Left pole and Right pole moving in opposite synchronization
 * - Physical slide between OPEN (wide channel) and CLOSE (clapped together)
 * - Deterministic interpolation driven by parent animation values
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import BambooPole3D from './BambooPole3D';

export default function BambooGroup3D({
  leftPoleAnimX, // Animated.Value for left pole
  rightPoleAnimX, // Animated.Value for right pole
  impactAnim, // Optional Animated.Value for clack impact flash
  length = 210,
  thickness = 13,
}) {
  return (
    <View style={styles.groupContainer} pointerEvents="none">
      {/* Left Bamboo Pole */}
      <BambooPole3D
        offsetX={leftPoleAnimX}
        length={length}
        thickness={thickness}
        isLeftPole={true}
      />

      {/* Right Bamboo Pole */}
      <BambooPole3D
        offsetX={rightPoleAnimX}
        length={length}
        thickness={thickness}
        isLeftPole={false}
      />

      {/* Subtle Impact Flash Glow when Poles Clash */}
      {impactAnim && (
        <Animated.View
          style={[
            styles.impactGlow,
            {
              opacity: impactAnim,
              transform: [
                {
                  scaleY: impactAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1.4],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  impactGlow: {
    position: 'absolute',
    width: 28,
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 210, 0.45)',
    zIndex: 5,
  },
});

