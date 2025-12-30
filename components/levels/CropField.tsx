
import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store';
import { Text, Float } from '@react-three/drei';

export const CropField: React.FC = () => {
  const { farmStatus, tillPlot, plantSeed, harvestCrop, selectedTool, showGuide } = useGameStore();
  const { tilledPlots, cropsPlanted } = farmStatus;
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const handleClick = (i: number, isTilled: boolean, plantedTime: number | null, isReady: boolean) => {
    let success = false;
    if (!isTilled && selectedTool === 'hoe') {
      tillPlot(i);
      success = true;
    } else if (isTilled && plantedTime === null && selectedTool === 'seed') {
      plantSeed(i);
      success = true;
    } else if (isReady && selectedTool === 'sickle') {
      harvestCrop(i);
      success = true;
    }

    if (!success) {
      setErrorIndex(i);
      setTimeout(() => setErrorIndex(null), 1000);
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {tilledPlots.map((isTilled, i) => {
        const x = (i % 3 - 1) * 5.5; // Increased spacing
        const z = (Math.floor(i / 3) - 1) * 5.5;
        const crop = cropsPlanted[i];
        const plantedTime = crop.time;
        const isReady = plantedTime && (Date.now() - plantedTime > 12000);

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tile Border/Frame for better visibility */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial color="#2d2d2d" opacity={0.2} transparent />
            </mesh>
            
            <mesh 
              receiveShadow 
              onClick={(e) => {
                e.stopPropagation();
                handleClick(i, isTilled, plantedTime, !!isReady);
              }}
              position={[0, 0.1, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[4.8, 4.8]} />
              <meshStandardMaterial 
                color={isTilled ? (plantedTime ? "#2d1b0d" : "#4a3121") : "#3a5a15"} 
                roughness={1}
                metalness={0.1}
              />
            </mesh>

            {errorIndex === i && (
              <Float speed={5} rotationIntensity={1.5}>
                <Text position={[0, 3.5, 0]} fontSize={0.4} color="#ef4444" outlineWidth={0.04} outlineColor="black">
                  WRONG TOOL
                </Text>
              </Float>
            )}

            {showGuide && (
              <group position={[0, 1.5, 0]}>
                {!isTilled && (
                  <Text fontSize={0.3} color="white" outlineWidth={0.02} outlineColor="black">
                    Use Hoe
                  </Text>
                )}
                {isTilled && plantedTime === null && (
                  <Text fontSize={0.3} color="#fbbf24" outlineWidth={0.02} outlineColor="black">
                    Sow {crop.type}
                  </Text>
                )}
              </group>
            )}

            {plantedTime && <CropVisual type={crop.type} timePlanted={plantedTime} isReady={!!isReady} />}
            
            {isReady && (
               <Float speed={2} floatIntensity={0.5}>
                  <Text position={[0, 4.5, 0]} fontSize={0.5} color="#facc15" outlineWidth={0.06} outlineColor="#451a03">
                    {crop.type.toUpperCase()} READY!
                  </Text>
               </Float>
            )}
          </group>
        );
      })}
    </group>
  );
};

const CropVisual: React.FC<{ type: 'maize' | 'tomato' | 'wheat', timePlanted: number, isReady: boolean }> = ({ type, timePlanted, isReady }) => {
  const [progress, setProgress] = useState(0.1);
  const randomOffsets = useMemo(() => Array.from({ length: 6 }, () => Math.random()), []);

  useEffect(() => {
    if (isReady) {
      setProgress(1);
      return;
    }
    const interval = setInterval(() => {
      const elapsed = Date.now() - timePlanted;
      const p = Math.min(elapsed / 12000, 1);
      setProgress(0.1 + p * 0.9);
    }, 200);
    return () => clearInterval(interval);
  }, [timePlanted, isReady]);

  const stemColor = progress < 0.8 ? "#166534" : (type === 'wheat' ? "#ca8a04" : "#14532d");

  if (type === 'maize') {
    return (
      <group scale={[1.2, 1.2, 1.2]} position={[0, 0, 0]}>
        <mesh position={[0, 1.5 * progress, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.12, 3 * progress]} />
          <meshStandardMaterial color={stemColor} />
        </mesh>
        {progress > 0.3 && (
          <group>
            {[1, 2, 3].map((i) => (
              <mesh key={i} position={[0, 0.8 * i * progress, 0]} rotation={[0.5, i * Math.PI * 0.6, 0]} scale={[1, 1, progress]}>
                <boxGeometry args={[0.15, 0.02, 2]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            ))}
          </group>
        )}
        {progress > 0.7 && (
          <group position={[0, 1.5 * progress, 0]}>
            <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0.4]}>
               <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
               <meshStandardMaterial color="#facc15" />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  if (type === 'tomato') {
    return (
      <group scale={[1.3, 1.3, 1.3]} position={[0, 0.5 * progress, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1 * progress, 12, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        {progress > 0.6 && (
           <group scale={[progress, progress, progress]}>
              <mesh position={[0.7, 0.8, 0.7]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color={progress > 0.9 ? "#ef4444" : "#4ade80"} />
              </mesh>
              <mesh position={[-0.7, 0.5, -0.6]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color={progress > 0.85 ? "#ef4444" : "#4ade80"} />
              </mesh>
           </group>
        )}
      </group>
    );
  }

  return (
    <group position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
      {Array.from({ length: 15 }).map((_, idx) => {
        const angle = (idx / 15) * Math.PI * 2;
        const radius = 0.6 * progress * randomOffsets[idx % 6];
        const height = (2 + randomOffsets[idx % 6] * 1.5) * progress;
        return (
          <group key={idx} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <mesh position={[0, height / 2, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.025, height]} />
              <meshStandardMaterial color={stemColor} />
            </mesh>
            {progress > 0.7 && (
              <mesh position={[0, height, 0]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.04, 0.5 * progress]} />
                <meshStandardMaterial color={progress > 0.9 ? "#eab308" : "#65a30d"} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
