/**
 * DHOP KHEL MEMORY - Dual-Engine 3D Stage View Router
 * 
 * - WebGL (Web): Full Three.js 3D viewport with volumetric rigged characters,
 *   authentic laterite Assam field, dynamic parabolic cloth ball physics,
 *   soft shadow mapping, and real-time gaze & arm kinematics (matching Ubilakapi quality).
 * - Native (iOS / Android): High-definition native perspective stage view with
 *   smooth React Native Animated kinematics, deep laterite pitch, and grounded characters.
 * - Zero bamboo anywhere (handwoven cloth Dhop ball only).
 * - Strict audio policy: Zero movement sounds; dedicated correct/wrong sounds on answer.
 */

import React, { forwardRef } from 'react';
import { Platform } from 'react-native';
import { DhopkhelThreeSceneView } from './DhopkhelThreeSceneView';
import { DhopkhelNativeStageView } from './DhopkhelNativeStageView';

export const DhopkhelStageView = forwardRef(function DhopkhelStageView(props, ref) {
  if (Platform.OS === 'web') {
    return <DhopkhelThreeSceneView ref={ref} {...props} />;
  }
  return <DhopkhelNativeStageView ref={ref} {...props} />;
});

export { DhopkhelThreeSceneView, DhopkhelNativeStageView };
export default DhopkhelStageView;
