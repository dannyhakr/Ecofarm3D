
import React from 'react';
import { FarmLevel } from '../store';
import { CropField } from './levels/CropField';
import { PoultryFarm } from './levels/PoultryFarm';
import { DairyFarm } from './levels/DairyFarm';
import { EnvironmentStatic } from './EnvironmentStatic';
import { CameraDirector } from './CameraDirector';
import { Lorry } from './levels/Lorry';
// Added missing import for Text component from @react-three/drei
import { Text } from '@react-three/drei';

interface SceneManagerProps {
  level: FarmLevel;
}

export const SceneManager: React.FC<SceneManagerProps> = ({ level }) => {
  return (
    <group>
      <CameraDirector level={level} />
      <EnvironmentStatic />
      
      <Lorry />

      {/* Main Crop Zone - Central focus */}
      <group position={[0, 0, 0]}>
        <CropField />
      </group>
      
      {/* Poultry Zone - To the right and back */}
      {level >= FarmLevel.POULTRY && (
        <group position={[25, 0, -20]}>
          <PoultryFarm />
        </group>
      )}

      {/* Dairy Zone - To the left and back */}
      {level >= FarmLevel.DAIRY && (
        <group position={[-25, 0, -20]}>
          <DairyFarm />
        </group>
      )}

      {/* Market/Selling Zone */}
      {level >= FarmLevel.MARKET_TYCOON && (
        <group position={[0, 0, 40]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[25, 15]} />
              <meshStandardMaterial color="#333" />
           </mesh>
           <mesh position={[0, 3, 0]}>
             <boxGeometry args={[10, 6, 6]} />
             <meshStandardMaterial color="#8b4513" />
           </mesh>
           <mesh position={[0, 6.5, 3]}>
             <boxGeometry args={[12, 1, 5]} />
             <meshStandardMaterial color="#dc2626" />
           </mesh>
           <Text position={[0, 8, 3.1]} fontSize={1} color="white" font="Inter">MARKET</Text>
        </group>
      )}
    </group>
  );
};
