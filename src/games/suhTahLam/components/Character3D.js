import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function Character3D({
  role = 'dancer',
  positionX = 0,
  positionY = 0,
  actionState = 'idle',
  isAltered = false,
}) {
  const step = useRef(new Animated.Value(0)).current;
  const armMotion = useRef(new Animated.Value(0)).current;
  const isDancer = role === 'dancer';
  const isLeftHolder = role === 'holder_left';
  const skin = isDancer ? '#B97855' : '#A9674D';
  const clothing = isDancer ? '#3F536B' : '#536B61';

  useEffect(() => {
    if (actionState.startsWith('step')) {
      const stepAnimation = Animated.parallel([
        Animated.sequence([
          Animated.timing(step, { toValue: -4, duration: 180, useNativeDriver: true }),
          Animated.timing(step, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(armMotion, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(armMotion, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
      ]);
      stepAnimation.start();
      return () => stepAnimation.stop();
    }

    if (actionState === 'push_pull') {
      const holderAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(armMotion, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.timing(armMotion, { toValue: -1, duration: 520, useNativeDriver: true }),
        ])
      );
      holderAnimation.start();
      return () => holderAnimation.stop();
    }
  }, [actionState]);

  const leftArmRotation = armMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: isLeftHolder ? ['-22deg', '-8deg', '8deg'] : ['-14deg', '0deg', '14deg'],
  });
  const rightArmRotation = armMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: isLeftHolder ? ['8deg', '-8deg', '-22deg'] : ['14deg', '0deg', '-14deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.anchor, { transform: [{ translateX: positionX }, { translateY: positionY }, { translateY: step }] }]}
    >
      <View style={[styles.person, isDancer ? styles.dancerPerson : styles.holderPerson]}>
        {/* Top-down human silhouette: head, shoulders, torso, arms and legs. */}
        <View style={[styles.head, { backgroundColor: skin }]} />
        <View style={[styles.torso, { backgroundColor: clothing }]} />
        <Animated.View style={[styles.arm, styles.leftArm, { backgroundColor: skin, transform: [{ rotate: leftArmRotation }] }]} />
        <Animated.View style={[styles.arm, styles.rightArm, { backgroundColor: skin, transform: [{ rotate: rightArmRotation }] }]} />
        <Animated.View style={[styles.leg, styles.leftLeg, { backgroundColor: skin }]} />
        <Animated.View style={[styles.leg, styles.rightLeg, { backgroundColor: skin }]} />
        <View style={[styles.foot, styles.leftFoot, { backgroundColor: clothing }]} />
        <View style={[styles.foot, styles.rightFoot, { backgroundColor: clothing }]} />
      </View>
      {isAltered && <View style={styles.alteredMarker} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: 42,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  person: {
    width: 42,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dancerPerson: {
    transform: [{ scale: 0.82 }],
  },
  holderPerson: {
    transform: [{ scale: 0.72 }],
  },
  head: {
    position: 'absolute',
    top: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#352421',
  },
  torso: {
    position: 'absolute',
    top: 14,
    width: 13,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#B8C3BE',
    borderWidth: 2,
  },
  arm: {
    position: 'absolute',
    top: 17,
    width: 3,
    height: 18,
    borderRadius: 2,
    transformOrigin: 'top center',
  },
  leftArm: {
    left: 9,
  },
  rightArm: {
    right: 9,
  },
  leg: {
    position: 'absolute',
    top: 34,
    width: 4,
    height: 17,
    borderRadius: 2,
  },
  leftLeg: {
    left: 15,
    transform: [{ rotate: '-6deg' }],
  },
  rightLeg: {
    right: 15,
    transform: [{ rotate: '6deg' }],
  },
  foot: {
    position: 'absolute',
    top: 50,
    width: 8,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#B8C3BE',
  },
  leftFoot: {
    left: 11,
  },
  rightFoot: {
    right: 11,
  },
  alteredMarker: {
    position: 'absolute',
    top: -4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
});
