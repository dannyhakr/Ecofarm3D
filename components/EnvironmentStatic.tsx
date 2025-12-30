
import React from 'react';
import { useTexture } from '@react-three/drei';

export const EnvironmentStatic: React.FC = () => {
  return (
    <group>
      {/* Main Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#365314" />
      </mesh>

      {/* The Big Red Barn (Static background) */}
      <group position={[-30, 0, -25]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[15, 10, 10]} />
          <meshStandardMaterial color="#991b1b" />
        </mesh>
        <mesh position={[0, 11, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[11, 6, 4]} />
          <meshStandardMaterial color="#450a0a" />
        </mesh>
      </group>

      {/* Decorative Trees */}
      <Tree position={[-40, 0, -40]} />
      <Tree position={[40, 0, -45]} />
      <Tree position={[-45, 0, 30]} />
      <Tree position={[45, 0, 35]} scale={1.2}/>

      {/* Boundary Fences */}
      <Fence position={[0, 0, 80]} rotation={[0, 0, 0]} length={160} />
      <Fence position={[0, 0, -80]} rotation={[0, 0, 0]} length={160} />
      <Fence position={[80, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={160} />
      <Fence position={[-80, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={160} />
    </group>
  );
};

const Tree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 2, 0]} castShadow>
      <cylinderGeometry args={[0.5, 0.7, 4]} />
      <meshStandardMaterial color="#4a3728" />
    </mesh>
    <mesh position={[0, 5, 0]} castShadow>
      <sphereGeometry args={[2.5, 16, 16]} />
      <meshStandardMaterial color="#14532d" />
    </mesh>
  </group>
);

const Fence: React.FC<{ position: [number, number, number], rotation: [number, number, number], length: number }> = ({ position, rotation, length }) => (
  <group position={position} rotation={rotation}>
    {Array.from({ length: Math.floor(length / 4) }).map((_, i) => (
      <mesh key={i} position={[(i - length / 8) * 4, 1, 0]} castShadow>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    ))}
    <mesh position={[0, 1.5, 0]} castShadow>
      <boxGeometry args={[length, 0.2, 0.1]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
  </group>
);
