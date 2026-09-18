/**
 * DHOP KHEL MEMORY - Stage View Router
 * 
 * - High-definition native perspective stage view with smooth React Native Animated kinematics,
 *   deep laterite pitch, and grounded characters.
 * - Zero bamboo anywhere (handwoven cloth Dhop ball only).
 * - Strict audio policy: Zero movement sounds; dedicated correct/wrong sounds on answer.
 */

import React, { forwardRef } from 'react';
import { DhopkhelNativeStageView } from './DhopkhelNativeStageView';

export const DhopkhelStageView = forwardRef(function DhopkhelStageView(props, ref) {
  return <DhopkhelNativeStageView ref={ref} {...props} />;
});

export { DhopkhelNativeStageView };
export default DhopkhelStageView;
