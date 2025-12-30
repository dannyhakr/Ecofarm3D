
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { Group, MathUtils, Vector3 } from 'three';
import { Float, Text } from '@react-three/drei';

const ENGINE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1614/1614-preview.mp3';
const HORN_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1618/1618-preview.mp3';

export const Lorry: React.FC = () => {
  const isSelling = useGameStore((state) => state.isSelling);
  const lorryRef = useRef<Group>(null);
  const wheelsRef = useRef<Group>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasHonked, setHasHonked] = useState(false);

  useEffect(() => {
    // Initialize engine sound
    audioRef.current = new Audio(ENGINE_SOUND);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isSelling) {
      audioRef.current?.play().catch(() => console.log("Audio blocked by browser"));
      setHasHonked(false);
      
      // Honk when starting the journey
      const horn = new Audio(HORN_SOUND);
      horn.volume = 0.3;
      horn.play().catch(() => {});
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [isSelling]);

  useFrame((state, delta) => {
    if (!lorryRef.current) return;
    
    if (isSelling) {
      // Realistic driving speed - move towards the market (positive Z)
      lorryRef.current.position.z += delta * 35;
      
      // Random engine rumble
      lorryRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 30) * 0.04;
      lorryRef.current.position.x = 12 + Math.sin(state.clock.elapsedTime * 10) * 0.02;

      if (wheelsRef.current) {
        wheelsRef.current.children.forEach(wheel => {
          wheel.rotation.x += delta * 25;
        });
      }

      // Honk again halfway through
      if (!hasHonked && lorryRef.current.position.z > 50) {
        const horn = new Audio(HORN_SOUND);
        horn.volume = 0.2;
        horn.play().catch(() => {});
        setHasHonked(true);
      }
    } else {
      // Smooth reset back to loading dock (Z = 15 is where it waits)
      lorryRef.current.position.z = MathUtils.lerp(lorryRef.current.position.z, 15, delta * 3);
      lorryRef.current.position.x = 12; // Moved slightly further right to clear the crops
      lorryRef.current.position.y = MathUtils.lerp(lorryRef.current.position.y, 1.2, delta * 5);
      
      // Stop wheels
      if (wheelsRef.current) {
        wheelsRef.current.children.forEach(wheel => {
          wheel.rotation.x = MathUtils.lerp(wheel.rotation.x, 0, delta * 2);
        });
      }
    }
  });

  return (
    <group>
      {/* Road / Dirt track visual */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0.02, 50]}>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial color="#443322" roughness={1} />
      </mesh>

      <group ref={lorryRef}>
        {/* Tractor Unit */}
        <group position={[0, 0, 2]}>
          {/* Chassis */}
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[3, 0.8, 5]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Cab */}
          <mesh castShadow position={[0, 2.2, 1.2]}>
            <boxGeometry args={[2.8, 2.5, 2.2]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.1} metalness={0.6} />
          </mesh>
          {/* Roof spoiler */}
          <mesh position={[0, 3.6, 0.8]} rotation={[-0.4, 0, 0]}>
             <boxGeometry args={[2.6, 0.2, 1.5]} />
             <meshStandardMaterial color="#991b1b" />
          </mesh>
          {/* Hood */}
          <mesh castShadow position={[0, 1.5, 3]}>
            <boxGeometry args={[2.6, 1.4, 1.8]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          {/* Grille */}
          <mesh position={[0, 1.5, 3.91]}>
             <boxGeometry args={[2, 1, 0.1]} />
             <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Headlights */}
          <group position={[0, 1, 3.91]}>
             <mesh position={[1, 0, 0]}><circleGeometry args={[0.3, 16]} /><meshStandardMaterial color={isSelling ? "#fffde7" : "#555"} emissive={isSelling ? "#fffde7" : "#000"} emissiveIntensity={2} /></mesh>
             <mesh position={[-1, 0, 0]}><circleGeometry args={[0.3, 16]} /><meshStandardMaterial color={isSelling ? "#fffde7" : "#555"} emissive={isSelling ? "#fffde7" : "#000"} emissiveIntensity={2} /></mesh>
          </group>
          {/* Windshield */}
          <mesh position={[0, 2.5, 2.31]} rotation={[-0.1, 0, 0]}>
            <planeGeometry args={[2.4, 1.5]} />
            <meshPhysicalMaterial color="#93c5fd" transparent opacity={0.5} roughness={0} transmission={0.9} />
          </mesh>
          {/* Exhaust Stacks - Chrome */}
          <mesh position={[1.4, 2.8, 0.2]}>
            <cylinderGeometry args={[0.18, 0.18, 4]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
          </mesh>
          <mesh position={[-1.4, 2.8, 0.2]}>
            <cylinderGeometry args={[0.18, 0.18, 4]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
          </mesh>
        </group>

        {/* Trailer Bed */}
        <group position={[0, 0, -4.5]}>
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[3, 0.5, 9]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Side Boards */}
          <mesh position={[1.45, 1.2, 0]}>
            <boxGeometry args={[0.1, 1.6, 9]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[-1.45, 1.2, 0]}>
            <boxGeometry args={[0.1, 1.6, 9]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 1.2, -4.45]}>
             <boxGeometry args={[3, 1.6, 0.1]} />
             <meshStandardMaterial color="#222" />
          </mesh>

          {/* Cargo Visuals */}
          {isSelling && (
             <group position={[0, 1.2, 0]}>
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[2.6, 1.2, 8.2]} />
                  <meshStandardMaterial color="#f59e0b" roughness={1} />
                </mesh>
                <Float speed={5} floatIntensity={1}>
                   <Text position={[0, 2.5, 0]} fontSize={0.8} color="white" outlineWidth={0.08} outlineColor="#b45309">
                      DELIVERING HARVEST...
                   </Text>
                </Float>
             </group>
          )}
        </group>

        {/* Wheels with realistic rubber and rims */}
        <group ref={wheelsRef}>
          <Wheel position={[1.5, -0.4, 3.8]} />
          <Wheel position={[-1.5, -0.4, 3.8]} />
          <Wheel position={[1.5, -0.4, 1.2]} />
          <Wheel position={[-1.5, -0.4, 1.2]} />
          <Wheel position={[1.5, -0.4, -4]} />
          <Wheel position={[-1.5, -0.4, -4]} />
          <Wheel position={[1.5, -0.4, -7]} />
          <Wheel position={[-1.5, -0.4, -7]} />
        </group>
      </group>
    </group>
  );
};

const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position} rotation={[0, 0, Math.PI / 2]}>
    {/* Tire */}
    <mesh castShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.6, 24]} />
      <meshStandardMaterial color="#0a0a0a" roughness={1} />
    </mesh>
    {/* Hubcap/Rim */}
    <mesh position={[0, 0.31, 0]}>
       <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
       <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, -0.31, 0]}>
       <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
       <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);
