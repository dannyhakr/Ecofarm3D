
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { Group, MathUtils } from 'three';

export const Lorry: React.FC = () => {
  const isSelling = useGameStore((state) => state.isSelling);
  const lorryRef = useRef<Group>(null);
  const wheelsRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!lorryRef.current) return;
    
    if (isSelling) {
      // Realistic driving speed
      lorryRef.current.position.z += delta * 30;
      if (wheelsRef.current) {
        wheelsRef.current.children.forEach(wheel => {
          wheel.rotation.x += delta * 20;
        });
      }
      // Physics-based vibration
      lorryRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 25) * 0.03;
    } else {
      // Smooth reset back to loading dock
      lorryRef.current.position.z = MathUtils.lerp(lorryRef.current.position.z, 20, delta * 3);
      lorryRef.current.position.x = 8;
      lorryRef.current.position.y = 1.2;
    }
  });

  return (
    <group ref={lorryRef}>
      {/* Tractor Unit */}
      <group position={[0, 0, 2]}>
        {/* Chassis */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[2.8, 0.8, 4.5]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Cab */}
        <mesh castShadow position={[0, 1.8, 1.2]}>
          <boxGeometry args={[2.6, 2, 2]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Hood */}
        <mesh castShadow position={[0, 1.3, 2.7]}>
          <boxGeometry args={[2.4, 1, 1.5]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* Windshield */}
        <mesh position={[0, 2.2, 2.22]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshPhysicalMaterial color="#93c5fd" transparent opacity={0.6} roughness={0} transmission={0.9} />
        </mesh>
        {/* Exhaust Stack */}
        <mesh position={[1.4, 2.5, 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
        </mesh>
        {/* Mirrors */}
        <mesh position={[1.5, 2.3, 1.8]}>
          <boxGeometry args={[0.1, 0.6, 0.3]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-1.5, 2.3, 1.8]}>
          <boxGeometry args={[0.1, 0.6, 0.3]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* Trailer Bed */}
      <group position={[0, 0, -3.5]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[2.8, 0.4, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Side Rails */}
        <mesh position={[1.35, 1, 0]}>
          <boxGeometry args={[0.1, 1.2, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[-1.35, 1, 0]}>
          <boxGeometry args={[0.1, 1.2, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Cargo Placeholder */}
        {isSelling && (
           <group position={[0, 1, 0]}>
              <mesh>
                <boxGeometry args={[2.2, 0.8, 7]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.8} />
              </mesh>
           </group>
        )}
      </group>

      {/* Wheels */}
      <group ref={wheelsRef}>
        <Wheel position={[1.4, -0.4, 3.5]} />
        <Wheel position={[-1.4, -0.4, 3.5]} />
        <Wheel position={[1.4, -0.4, 1.5]} />
        <Wheel position={[-1.4, -0.4, 1.5]} />
        <Wheel position={[1.4, -0.4, -4]} />
        <Wheel position={[-1.4, -0.4, -4]} />
        <Wheel position={[1.4, -0.4, -6.5]} />
        <Wheel position={[-1.4, -0.4, -6.5]} />
      </group>
    </group>
  );
};

const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
    <meshStandardMaterial color="#050505" roughness={1} />
  </mesh>
);
