/**
 * SUH TAH LAM - BambooGroup3D
 *
 * Coordinates the dual-pole bamboo assembly:
 * - Left pole and Right pole moving in opposite synchronization
 * - Physical slide between OPEN (wide channel) and CLOSE (clapped together)
 * - Deterministic interpolation driven by parent animation values
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BambooPole3D from './BambooPole3D';

export default function BambooGroup3D({
  leftPoleAnimX, // Animated.Value for left pole
  rightPoleAnimX, // Animated.Value for right pole
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
});

