
import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, CowData } from '../../store';
import { Text, Float, RoundedBox, Html } from '@react-three/drei';
import { Group, Vector3, MathUtils } from 'three';

const MOO_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1012/1012-preview.mp3';
const MILK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2552/2552-preview.mp3';

export const DairyFarm: React.FC = () => {
  const { farmStatus, inventory, buyCow, buyFood, feedCow, collectMilk, setCowReady, setCowHungry, selectedTool } = useGameStore();
  const { cows } = farmStatus;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuyCow = (e: any) => {
    e.stopPropagation();
    if (useGameStore.getState().money < 500) {
      setErrorMsg("NEED $500 TO PURCHASE!");
      setTimeout(() => setErrorMsg(null), 1500);
      return;
    }
    buyCow();
  };

  const handleBuyFood = (e: any) => {
    e.stopPropagation();
    if (useGameStore.getState().money < 30) {
      setErrorMsg("NEED $30 FOR FEED!");
      setTimeout(() => setErrorMsg(null), 1500);
      return;
    }
    buyFood();
  };

  return (
    <group>
      {/* Pasture Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2d4a0b" roughness={1} />
      </mesh>

      {/* Decorative Fence */}
      <group position={[0, 0.8, 0]}>
        <Fence length={40} position={[20, 0, 0]} rotation={[0, Math.PI/2, 0]} />
        <Fence length={40} position={[-20, 0, 0]} rotation={[0, Math.PI/2, 0]} />
        <Fence length={40} position={[0, 0, 20]} rotation={[0, 0, 0]} />
        <Fence length={40} position={[0, 0, -20]} rotation={[0, 0, 0]} />
      </group>

      {/* Main Barn Structure */}
      <group position={[-15, 0, -15]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[12, 10, 10]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        <mesh position={[0, 11, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[10, 5, 4]} />
          <meshStandardMaterial color="#450a0a" />
        </mesh>
      </group>

      {/* Feeding Trough - Central location for cows to eat */}
      <group position={[-8, 0, 8]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[8, 0.8, 3]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[7.5, 0.1, 2.5]} />
          <meshStandardMaterial color="#271b12" />
        </mesh>
        {/* Hay inside trough */}
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[7, 0.2, 2.2]} />
          <meshStandardMaterial color="#ca8a04" roughness={1} />
        </mesh>
        <Text position={[0, 2.5, 0]} fontSize={0.8} color="#fbbf24" outlineWidth={0.08} outlineColor="black">
          FEEDING TROUGH
        </Text>
      </group>

      {/* Food Purchase Area */}
      <group position={[14, 0, 14]} onClick={handleBuyFood}>
        <HayStack position={[0, 0, 0]} />
        <Text position={[0, 4.5, 0]} fontSize={0.8} color="#fbbf24" outlineWidth={0.1} outlineColor="black">
           FEED STORE ($30)
        </Text>
      </group>

      {/* Cow Purchase Area */}
      <group position={[16, 0, -10]} onClick={handleBuyCow}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[4, 2, 2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <Text position={[0, 3.5, 0]} fontSize={1} color="#4ade80" outlineWidth={0.12} outlineColor="black">
           BUY COW ($500)
        </Text>
      </group>

      {/* Active Cows */}
      {cows.map((cow) => (
        <Cow 
          key={cow.id} 
          data={cow} 
          onFeed={() => feedCow(cow.id)} 
          onMilk={() => collectMilk(cow.id)}
          onReady={() => setCowReady(cow.id)}
          onHungry={() => setCowHungry(cow.id)}
          tool={selectedTool}
        />
      ))}

      {errorMsg && (
        <Float speed={5} floatIntensity={2}>
           <Text position={[0, 15, 0]} fontSize={1.2} color="#ef4444" outlineWidth={0.1} outlineColor="black">
             {errorMsg}
           </Text>
        </Float>
      )}
    </group>
  );
};

const Fence: React.FC<{ length: number, position: [number, number, number], rotation: [number, number, number] }> = ({ length, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <boxGeometry args={[length, 0.2, 0.2]} />
      <meshStandardMaterial color="#4a3728" />
    </mesh>
    <mesh position={[0, -0.6, 0]} castShadow>
      <boxGeometry args={[length, 0.2, 0.2]} />
      <meshStandardMaterial color="#4a3728" />
    </mesh>
    {Array.from({ length: Math.floor(length / 2) }).map((_, i) => (
      <mesh key={i} position={[(i - length / 4) * 2, -0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    ))}
  </group>
);

const HayStack: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[2, 1, 2]} />
      <meshStandardMaterial color="#ca8a04" />
    </mesh>
    <mesh position={[0.5, 1.3, 0]} rotation={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.8, 0.8, 1.8]} />
      <meshStandardMaterial color="#eab308" />
    </mesh>
    <mesh position={[-0.2, 2, 0.3]} castShadow>
      <boxGeometry args={[1.5, 0.7, 1.5]} />
      <meshStandardMaterial color="#ca8a04" />
    </mesh>
  </group>
);

const Cow: React.FC<{ 
  data: CowData, 
  onFeed: () => void, 
  onMilk: () => void, 
  onReady: () => void, 
  onHungry: () => void,
  tool: string | null 
}> = ({ data, onFeed, onMilk, onReady, onHungry, tool }) => {
  const ref = useRef<Group>(null);
  const neckRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const [targetPos, setTargetPos] = useState(new Vector3(...data.position));
  const [isMoowing, setIsMoowing] = useState(false);
  const [errorLocal, setErrorLocal] = useState(false);
  const [hoveringUdder, setHoveringUdder] = useState(false);
  const [hoveringBody, setHoveringBody] = useState(false);
  const [harvestFlash, setHarvestFlash] = useState<number | null>(null);

  const TROUGH_POS = new Vector3(-8, 1.2, 7.5); // Slightly in front of trough to "face it"

  const playMoo = () => {
    const audio = new Audio(MOO_SOUND);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    setIsMoowing(true);
    setTimeout(() => setIsMoowing(false), 2000);
  };

  const playMilkSound = () => {
    const audio = new Audio(MILK_SOUND);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const mooInterval = setInterval(() => {
      if (Math.random() > 0.8) playMoo();
    }, 20000);

    if (data.status === 'eating') {
      // Once the cow reaches the trough, it starts eating for 10 seconds
      const timer = setTimeout(() => onReady(), 10000);
      return () => { clearTimeout(timer); clearInterval(mooInterval); };
    } else if (data.status === 'grazing') {
      const timer = setTimeout(() => onHungry(), 20000);
      return () => { clearTimeout(timer); clearInterval(mooInterval); };
    }
    return () => clearInterval(mooInterval);
  }, [data.status]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const isEating = data.status === 'eating';
    const isReady = data.status === 'ready';
    const isStationary = isEating || isReady;
    
    // If eating, the target is specifically the trough area
    const currentTarget = isEating ? TROUGH_POS : targetPos;

    // Movement logic
    const distToTarget = ref.current.position.distanceTo(currentTarget);
    if (distToTarget > 0.8) {
      const direction = new Vector3().subVectors(currentTarget, ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(delta * 2.5));
      const lookTarget = new Vector3().copy(currentTarget);
      lookTarget.y = ref.current.position.y;
      ref.current.lookAt(lookTarget);
    } else if (isEating) {
      // Specifically face the trough when at it (trough is at Z=8, cow at Z=7.5)
      const troughCenter = new Vector3(-8, 1.2, 8);
      ref.current.lookAt(troughCenter);
    } else if (!isStationary && Math.random() > 0.99) {
       setTargetPos(new Vector3((Math.random() - 0.5) * 30, 1.2, (Math.random() - 0.5) * 30));
    }

    // Animation: breathing
    ref.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;

    // Tail swishing
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }

    // Neck / Head behavior
    if (neckRef.current) {
      let dipTarget = 0;
      if (isMoowing) dipTarget = -0.4;
      else if (isEating) dipTarget = 0.9; // Lower head to trough
      else dipTarget = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      neckRef.current.rotation.x = MathUtils.lerp(neckRef.current.rotation.x, dipTarget, delta * 3);
    }
  });

  const handleBodyClick = (e: any) => {
    e.stopPropagation();
    if (data.status === 'hungry') {
      if (tool === 'feed') {
        onFeed();
      } else {
        setErrorLocal(true);
        setTimeout(() => setErrorLocal(false), 1000);
      }
    } else {
      playMoo();
    }
  };

  const handleUdderClick = (e: any) => {
    e.stopPropagation();
    if (data.status === 'ready') {
      if (tool === 'bucket') {
        playMilkSound();
        setHarvestFlash(data.milkYield);
        onMilk();
        setTimeout(() => setHarvestFlash(null), 2500);
      } else {
        setErrorLocal(true);
        setTimeout(() => setErrorLocal(false), 1200);
      }
    }
  };

  const udderBaseScale = data.status === 'ready' ? 1.8 + (data.milkYield / 20) : 1.3;

  return (
    <group ref={ref} position={data.position}>
      {/* Cow Body Structure */}
      <group 
        onClick={handleBodyClick}
        onPointerEnter={() => setHoveringBody(true)}
        onPointerLeave={() => setHoveringBody(false)}
      >
        {/* Main Torso */}
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[4, 2.6, 2.2]} />
          <meshStandardMaterial color="white" roughness={0.7} />
        </mesh>

        {/* Holstein Spots */}
        <mesh position={[0.8, 1.5, 1.11]}><planeGeometry args={[1.8, 1.6]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-1.4, 0.4, 1.11]}><planeGeometry args={[2.2, 1.4]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[1.2, 0.2, -1.11]}><planeGeometry args={[1.5, 2.4]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-0.8, 2.1, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[2.5, 2]} /><meshStandardMaterial color="#111" /></mesh>
        
        {/* Legs */}
        <Leg position={[1.4, -0.8, 0.7]} />
        <Leg position={[-1.4, -0.8, 0.7]} />
        <Leg position={[1.4, -0.8, -0.7]} />
        <Leg position={[-1.4, -0.8, -0.7]} />

        {/* Tail */}
        <group position={[-2, 1.5, 0]} ref={tailRef}>
           <mesh position={[0, -1, 0]}>
             <cylinderGeometry args={[0.08, 0.05, 2]} />
             <meshStandardMaterial color="#ddd" />
           </mesh>
           <mesh position={[0, -2, 0]}>
             <sphereGeometry args={[0.15]} />
             <meshStandardMaterial color="#111" />
           </mesh>
        </group>

        {/* Neck & Head */}
        <group position={[2, 1.2, 0]} ref={neckRef}>
          <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[1.5, 1.3, 1.2]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
          <group position={[1.5, 0.6, 0]} ref={headRef}>
             {/* Skull */}
             <mesh castShadow>
               <boxGeometry args={[1.4, 2, 1.5]} />
               <meshStandardMaterial color="white" />
             </mesh>
             {/* Eyes */}
             <mesh position={[0.6, 0.6, 0.5]}><sphereGeometry args={[0.15]} /><meshStandardMaterial color="#000" /></mesh>
             <mesh position={[0.6, 0.6, -0.5]}><sphereGeometry args={[0.15]} /><meshStandardMaterial color="#000" /></mesh>
             {/* Ears */}
             <mesh position={[-0.2, 0.8, 0.9]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.2, 0.4, 0.6]} /><meshStandardMaterial color="#ffc0cb" /></mesh>
             <mesh position={[-0.2, 0.8, -0.9]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.2, 0.4, 0.6]} /><meshStandardMaterial color="#ffc0cb" /></mesh>
             {/* Snout & Mouth */}
             <group position={[0.8, -0.3, 0]}>
               <mesh><boxGeometry args={[0.6, 1.2, 1.2]} /><meshStandardMaterial color="#ffc0cb" /></mesh>
               {/* Mouth detail */}
               <mesh position={[0.31, -0.3, 0]}><boxGeometry args={[0.1, 0.2, 0.8]} /><meshStandardMaterial color="#a1626a" /></mesh>
             </group>
          </group>
        </group>

        {/* Feeding Prompt */}
        {data.status === 'hungry' && (
          <Html position={[0, 3.5, 0]} center>
            <div className={`whitespace-nowrap px-5 py-3 rounded-full border-4 border-white text-lg font-black uppercase transition-all duration-300 pointer-events-none shadow-2xl ${
              hoveringBody ? 'bg-orange-600 text-white scale-125' : 'bg-black/80 text-white/90 scale-100'
            }`}>
              {tool === 'feed' ? 'Go to Trough! 🥣' : 'Equip Feed 🥣'}
            </div>
          </Html>
        )}
      </group>

      {/* Udder Area */}
      <group 
        position={[-0.5, -0.2, 0]} 
        onClick={handleUdderClick}
        onPointerEnter={() => setHoveringUdder(true)}
        onPointerLeave={() => setHoveringUdder(false)}
      >
        <mesh scale={udderBaseScale} castShadow>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#ffb6c1" roughness={0.4} />
        </mesh>
        {/* Teats */}
        <group position={[0, -0.5, 0]} scale={udderBaseScale}>
          <mesh position={[0.2, -0.2, 0.2]}><cylinderGeometry args={[0.06, 0.06, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[-0.2, -0.2, 0.2]}><cylinderGeometry args={[0.06, 0.06, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[0.2, -0.2, -0.2]}><cylinderGeometry args={[0.06, 0.06, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[-0.2, -0.2, -0.2]}><cylinderGeometry args={[0.06, 0.06, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
        </group>

        {/* Milking HUD */}
        {data.status === 'ready' && (
          <Html position={[0, -2.5, 0]} center>
            <div className={`whitespace-nowrap px-6 py-4 rounded-3xl border-4 border-white text-sm font-black uppercase transition-all duration-300 pointer-events-none shadow-2xl flex flex-col items-center gap-1 ${
              hoveringUdder ? 'bg-blue-600 text-white scale-125' : 'bg-black/80 text-white/90 scale-100'
            }`}>
              <span>{tool === 'bucket' ? 'START MILKING 🥛' : 'NEED BUCKET 🥛'}</span>
              <span className="text-[10px] text-blue-200">YIELD: {data.milkYield} LITRES</span>
            </div>
          </Html>
        )}
      </group>

      {/* Feedback FX */}
      <group position={[0, 8, 0]}>
        {harvestFlash !== null && (
          <Float speed={12} floatIntensity={5}>
            <Text fontSize={2.5} color="#60a5fa" outlineWidth={0.2} outlineColor="white">+{harvestFlash}L MILK COLLECTED!</Text>
          </Float>
        )}
        {isMoowing && !harvestFlash && (
          <Text fontSize={1.5} color="white" outlineWidth={0.15} outlineColor="black" position={[0, 2, 0]}>MOOOO!</Text>
        )}
        {errorLocal && (
          <Text fontSize={1} color="#ef4444" outlineWidth={0.1} outlineColor="black">WRONG TOOL</Text>
        )}
      </group>
    </group>
  );
};

const Leg: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh castShadow position={[0, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 2.2]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
    <mesh position={[0, -1.1, 0]}>
      <cylinderGeometry args={[0.25, 0.28, 0.3]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);
