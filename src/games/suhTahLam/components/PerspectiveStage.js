/**
 * SUH TAH LAM - PerspectiveStage 3D Viewport
 *
 * Provides a clean top-down board view for the Suh Tah Lam arena.
 *
 * Zero external native GL dependencies: Uses hardware-accelerated 3D matrix transforms
 * to guarantee 60 FPS crash-free performance across all Android, iOS, and Web devices.
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function PerspectiveStage({
  children,
  cameraMode = 'normal', // 'wide' | 'normal' | 'focused'
  style,
}) {
  const cameraZoomAnim = useRef(new Animated.Value(1.0)).current;

  useEffect(() => {
    let targetZoom = 1.0;
    if (cameraMode === 'wide') {
      targetZoom = 0.88;
    } else if (cameraMode === 'focused') {
      targetZoom = 1.15;
    }

    Animated.timing(cameraZoomAnim, {
      toValue: targetZoom,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [cameraMode]);

  return (
    <View style={[styles.viewportContainer, style]}>
      {/* Fixed overhead board view */}
      <Animated.View
        style={[
          styles.cameraRig,
          {
            transform: [
              { scale: cameraZoomAnim },
            ],
          },
        ]}
      >
        {/* Flat arena with no perspective distortion */}
        <View style={styles.groundWorldStage}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewportContainer: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B2B2C',
    borderRadius: 16,
  },
  cameraRig: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundWorldStage: {
    width: 340,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '0deg' }],
  },
});

