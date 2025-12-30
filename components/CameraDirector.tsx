
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { FarmLevel } from '../store';

const POSITIONS = {
  [FarmLevel.CROPS]: new Vector3(50, 50, 50),
  [FarmLevel.POULTRY]: new Vector3(80, 50, 20),
  [FarmLevel.DAIRY]: new Vector3(40, 50, 40), // More overhead and centered
  [FarmLevel.MARKET_TYCOON]: new Vector3(50, 50, 80),
};

const TARGETS = {
  [FarmLevel.CROPS]: new Vector3(0, 0, 0),
  [FarmLevel.POULTRY]: new Vector3(25, 0, -20),
  [FarmLevel.DAIRY]: new Vector3(-20, 0, -10), // Adjusted target for dairy zone
  [FarmLevel.MARKET_TYCOON]: new Vector3(0, 0, 40),
};

const ZOOM_LEVELS = {
  [FarmLevel.CROPS]: 40,
  [FarmLevel.POULTRY]: 35,
  [FarmLevel.DAIRY]: 28, // Zoomed out more to fit the large pasture
  [FarmLevel.MARKET_TYCOON]: 30,
};

export const CameraDirector: React.FC<{ level: FarmLevel }> = ({ level }) => {
  const { camera, controls } = useThree() as any;

  useFrame((state, delta) => {
    if (!camera) return;
    const targetPos = POSITIONS[level];
    const targetLookAt = TARGETS[level];
    const targetZoom = ZOOM_LEVELS[level];

    camera.position.lerp(targetPos, delta * 2);
    camera.zoom = MathUtils.lerp(camera.zoom, targetZoom, delta * 2);
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.lerp(targetLookAt, delta * 2);
      controls.update();
    }
  });

  return null;
};
