
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, ChickenData, EggData } from '../../store';
import { Text, Float, Html } from '@react-three/drei';
import { Group, Vector3, MathUtils } from 'three';

export const PoultryFarm: React.FC = () => {
  const { farmStatus, inventory, buildCoop, buyChicken, placeChicken, collectEgg, spawnEgg, selectedTool, showGuide } = useGameStore();
  const { coopBuilt, placedChickens, eggsInScene } = farmStatus;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInteraction = (e: any) => {
    e.stopPropagation();
    
    if (!coopBuilt) {
      if (selectedTool !== 'hammer') {
        setErrorMsg("USE HAMMER!");
        setTimeout(() => setErrorMsg(null), 1500);
        return;
      }
      buildCoop();
    } else if (selectedTool === 'chicken_item') {
      if (inventory.chickens > 0) {
        const worldPoint = e.point;
        // The poultry farm is placed at [25, 0, -20] in SceneManager
        const localX = worldPoint.x - 25;
        const localZ = worldPoint.z + 20;
        
        // Prevent placing inside the coop structure
        if (Math.abs(localX) < 4 && Math.abs(localZ) < 4) return;

        placeChicken([localX, 0.7, localZ]);
        
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } else {
        setErrorMsg("BUY CHICKENS FIRST!");
        setTimeout(() => setErrorMsg(null), 1500);
      }
    }
  };

  return (
    <group>
      {/* Interactive Ground Patch */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.05, 0]} 
        onClick={handleInteraction}
        receiveShadow
      >
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial 
          color={selectedTool === 'chicken_item' && inventory.chickens > 0 ? "#4ade80" : "#3a5a15"} 
          roughness={1} 
          opacity={selectedTool === 'chicken_item' ? 0.8 : 1}
          transparent={selectedTool === 'chicken_item'}
        />
      </mesh>

      {/* Fence Visual */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[11, 0, 0]}><boxGeometry args={[0.2, 1.5, 22]} /><meshStandardMaterial color="#5d4037" /></mesh>
        <mesh position={[-11, 0, 0]}><boxGeometry args={[0.2, 1.5, 22]} /><meshStandardMaterial color="#5d4037" /></mesh>
        <mesh position={[0, 0, 11]}><boxGeometry args={[22, 1.5, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
        <mesh position={[0, 0, -11]}><boxGeometry args={[22, 1.5, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
      </group>

      {!coopBuilt ? (
        <group onClick={handleInteraction}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[8, 4, 8]} />
            <meshStandardMaterial color="#92400e" opacity={0.3} transparent />
          </mesh>
          <Text position={[0, 5, 0]} fontSize={0.7} color="white" outlineWidth={0.06} outlineColor="black">
            {errorMsg || (showGuide ? "Construct Realistic Coop ($200)" : "Hammer Required")}
          </Text>
        </group>
      ) : (
        <group>
          <CoopModel onClick={handleInteraction} />
          
          {selectedTool === 'chicken_item' && inventory.chickens > 0 && (
            <Float speed={4} rotationIntensity={0.5}>
              <Text position={[0, 8.5, 0]} fontSize={0.6} color="#fff" outlineWidth={0.06} outlineColor="black">
                CLICK GROUND TO PLACE CHICKEN
              </Text>
            </Float>
          )}

          {/* LARGE 3D STRAW NEST (EGG HEAP) - Moved to visible left side */}
          <group position={[-8, 0.1, 3]}>
            {/* The base mound of straw */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
               <circleGeometry args={[3.5, 32]} />
               <meshStandardMaterial color="#ca8a04" roughness={1} />
            </mesh>
            {/* 3D Straw layers using torus and rings to create a "heap" look */}
            <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <torusGeometry args={[3.2, 0.5, 12, 24]} />
               <meshStandardMaterial color="#a16207" />
            </mesh>
            <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <torusGeometry args={[2.5, 0.45, 12, 24]} />
               <meshStandardMaterial color="#854d0e" />
            </mesh>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <ringGeometry args={[0, 3, 8]} />
               <meshStandardMaterial color="#ca8a04" roughness={1} />
            </mesh>

            <Text position={[0, 4.5, 0]} fontSize={1} color="#fbbf24" outlineWidth={0.1} outlineColor="black">
              EGG COLLECTION HEAP
            </Text>
            
            {/* The actual eggs stacked in the heap */}
            <group position={[0, 0.5, 0]}>
               {eggsInScene.map((egg, index) => (
                 <Egg 
                   key={egg.id} 
                   id={egg.id} 
                   index={index}
                   position={egg.position} 
                   onCollect={collectEgg} 
                   tool={selectedTool}
                 />
               ))}
            </group>
          </group>

          {/* Roaming Chickens */}
          {placedChickens.map((chicken) => (
            <Chicken 
              key={chicken.id} 
              data={chicken} 
              onLayEgg={spawnEgg}
            />
          ))}

          {/* Improved Shop UI */}
          <group position={[0, 12, -8]} onClick={(e) => { e.stopPropagation(); buyChicken(); }}>
            <Float speed={2} floatIntensity={0.5}>
              <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[10, 3]} />
                <meshStandardMaterial color="#1e293b" opacity={0.9} transparent />
              </mesh>
              <Text fontSize={0.8} color="#fbbf24" outlineWidth={0.05} outlineColor="black" position={[0, 0.5, 0.1]}>
                PURCHASE CHICKEN ($50)
              </Text>
              <Text position={[0, -0.6, 0.1]} fontSize={0.5} color="white">
                STOCKED: {inventory.chickens}
              </Text>
            </Float>
          </group>
        </group>
      )}
    </group>
  );
};

const CoopModel: React.FC<{ onClick: (e: any) => void }> = ({ onClick }) => (
  <group onClick={onClick}>
    <mesh position={[0, 2.5, 0]} castShadow>
      <boxGeometry args={[7, 5, 7]} />
      <meshStandardMaterial color="#991b1b" roughness={0.8} />
    </mesh>
    <mesh position={[0, 6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[6.5, 3, 4]} />
      <meshStandardMaterial color="#450a0a" />
    </mesh>
    <mesh position={[4, 1.5, 0]} castShadow>
      <boxGeometry args={[1.5, 2, 5]} />
      <meshStandardMaterial color="#7f1d1d" />
    </mesh>
    <mesh position={[4, 2.7, 0]} rotation={[0, 0, 0.4]}>
      <planeGeometry args={[2, 5.5]} />
      <meshStandardMaterial color="#450a0a" side={2} />
    </mesh>
    {/* Coop Ramp */}
    <mesh position={[0, 0.5, 4.5]} rotation={[-0.4, 0, 0]} castShadow>
      <boxGeometry args={[2, 0.2, 5]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0, 1.5, 3.51]}>
      <planeGeometry args={[1.5, 2.5]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  </group>
);

const Chicken: React.FC<{ data: ChickenData, onLayEgg: (pos: [number, number, number]) => void }> = ({ data, onLayEgg }) => {
  const ref = useRef<Group>(null);
  const [targetPos, setTargetPos] = useState(new Vector3(...data.position));
  const [layStatus, setLayStatus] = useState<'roaming' | 'nesting' | 'laying'>('roaming');
  
  // Timer logic for laying cycle - STIMULATED PRODUCTION
  useEffect(() => {
    let cycleTimeout: any;
    
    const cycle = () => {
      // 1. Roaming Phase - Shortened for faster production
      setLayStatus('roaming');
      cycleTimeout = setTimeout(() => {
        // 2. Heading to the Heap
        setLayStatus('nesting');
        // Targeted near the new egg heap area [-8, 0.1, 3]
        setTargetPos(new Vector3(-8 + (Math.random() - 0.5) * 2.5, 0.7, 3 + (Math.random() - 0.5) * 2.5));
        
        cycleTimeout = setTimeout(() => {
          // 3. Laying phase at the heap - Shortened
          setLayStatus('laying');
          
          cycleTimeout = setTimeout(() => {
            // STIMULATED: Laying 1 to 3 eggs at once!
            const eggCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < eggCount; i++) {
                // Egg coordinates relative to the heap center [-8, 0.1, 3]
                onLayEgg([(Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5]);
            }
            
            // Return to random roaming - Short duration
            setTargetPos(new Vector3((Math.random() - 0.5) * 16, 0.7, (Math.random() - 0.5) * 16));
            cycle(); 
          }, 2000); // Laying takes 2s
        }, 3000); // Nesting takes 3s
      }, 5000 + Math.random() * 5000); // Roam for 5-10s
    };

    cycle();
    return () => clearTimeout(cycleTimeout);
  }, [onLayEgg]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const speed = layStatus === 'nesting' ? 5 : 2.5;
    
    if (ref.current.position.distanceTo(targetPos) > 0.5) {
      const direction = new Vector3().subVectors(targetPos, ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(delta * speed));
      const lookTarget = new Vector3().copy(targetPos);
      lookTarget.y = ref.current.position.y;
      ref.current.lookAt(lookTarget);
    } else if (layStatus === 'roaming') {
      if (Math.random() > 0.98) {
        setTargetPos(new Vector3((Math.random() - 0.5) * 16, 0.7, (Math.random() - 0.5) * 16));
      }
    }

    // Bounce logic - more energetic for productive chickens
    if (layStatus !== 'laying') {
      ref.current.position.y = 0.7 + Math.max(0, Math.sin(state.clock.elapsedTime * 15) * 0.25);
    } else {
      ref.current.position.y = 0.7 + Math.sin(state.clock.elapsedTime * 35) * 0.1;
    }
  });

  return (
    <group ref={ref} position={data.position}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.5, 0.9, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#fcfcfc" />
      </mesh>
      <mesh position={[0.8, 0.9, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.4]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0.5, 1.3, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.5]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {layStatus === 'laying' && (
        <Float speed={15} floatIntensity={2}>
           <Text position={[0, 2, 0]} fontSize={0.45} color="#facc15" outlineWidth={0.06} outlineColor="black">STIMULATED LAYING!</Text>
        </Float>
      )}
      {layStatus === 'nesting' && (
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#4ade80" outlineWidth={0.03} outlineColor="black">Ready to lay!</Text>
      )}
    </group>
  );
};

const Egg: React.FC<{ 
  id: string, 
  index: number,
  position: [number, number, number], 
  onCollect: (id: string) => void, 
  tool: string | null 
}> = ({ id, index, position, onCollect, tool }) => {
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (tool !== 'basket') {
      setError(true);
      setTimeout(() => setError(false), 1200);
      return;
    }
    onCollect(id);
  };

  // Improved stacking: create a mound by basing height on index
  const stackHeight = (index % 6) * 0.15 + Math.random() * 0.05;

  return (
    <group 
      position={[position[0], position[1] + stackHeight, position[2]]} 
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh castShadow scale={[0.9, 1.2, 0.9]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#fbefd8" : "#ffffff"} 
          roughness={0.1} 
          emissive={hovered && tool === 'basket' ? "#4ade80" : "#000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className={`px-3 py-1.5 rounded-xl border-2 border-white text-[11px] font-black uppercase transition-all duration-300 pointer-events-none shadow-xl ${
            tool === 'basket' ? 'bg-orange-600 text-white scale-110' : 'bg-red-600/90 text-white scale-90'
          }`}>
            {tool === 'basket' ? 'Collect Egg 🧺' : 'Need Basket 🧺'}
          </div>
        </Html>
      )}

      {error && (
        <Float speed={15} floatIntensity={3}>
           <Text position={[0, 2, 0]} fontSize={0.5} color="#ef4444" outlineWidth={0.06} outlineColor="black">USE BASKET!</Text>
        </Float>
      )}
    </group>
  );
};
