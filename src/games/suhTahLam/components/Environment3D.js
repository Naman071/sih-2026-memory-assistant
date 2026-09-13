/**
 * SUH TAH LAM - Environment3D
 *
 * Renders the cultural courtyard ground plane:
 * - Natural earth and textured courtyard stones
 * - Two wooden base runner logs upon which the bamboo poles slide
 * - Subtle inlaid wood coordinate markers (positions 1 through 9)
 * - Soft daylight lighting and natural drop shadows
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Environment3D({ isDarkMode = false, showGridHints = false }) {
  return (
    <View style={styles.groundPlane}>
      {/* Courtyard Stone Base */}
      <View style={[styles.stoneFloor, isDarkMode && styles.stoneFloorDark]}>
        {/* Subtle stone flagstone pavers */}
        <View style={styles.stoneBorder} />
        
        {/* 3x3 subtle ground inlays for spatial orientation */}
        <View style={styles.gridInlayContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
            <View key={`pos_${pos}`} style={styles.gridCell}>
              <View
                style={[
                  styles.gridMarkerDot,
                  pos === 5 && styles.gridCenterMarker,
                  showGridHints && styles.gridMarkerActive,
                ]}
              />
            </View>
          ))}
        </View>

        {/* Transverse Wooden Base Runner Logs (Cross-beams under bamboo poles) */}
        {/* Top transverse runner log */}
        <View style={[styles.baseRunnerLog, { top: 46 }]}>
          <View style={styles.woodGrainStripe} />
          <View style={styles.woodEndCapLeft} />
          <View style={styles.woodEndCapRight} />
        </View>

        {/* Bottom transverse runner log */}
        <View style={[styles.baseRunnerLog, { bottom: 46 }]}>
          <View style={styles.woodGrainStripe} />
          <View style={styles.woodEndCapLeft} />
          <View style={styles.woodEndCapRight} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groundPlane: {
    position: 'absolute',
    width: 320,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoneFloor: {
    width: 310,
    height: 230,
    borderRadius: 24,
    backgroundColor: '#9A7B56',
    borderWidth: 3,
    borderColor: '#7C5E3B',
    overflow: 'hidden',
  },
  stoneFloorDark: {
    backgroundColor: '#57412A',
    borderColor: '#3D2D1B',
  },
  stoneBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
  },
  gridInlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 18,
  },
  gridCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  gridCenterMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 220, 150, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridMarkerActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#FCD34D',
    transform: [{ scale: 1.3 }],
  },
  baseRunnerLog: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5D4037',
    borderWidth: 1,
    borderColor: '#3E2723',
  },
  woodGrainStripe: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 3,
    height: 2,
    backgroundColor: '#795548',
    borderRadius: 1,
  },
  woodEndCapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#4E342E',
  },
  woodEndCapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#4E342E',
  },
});

