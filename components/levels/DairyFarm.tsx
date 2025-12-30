
import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, CowData } from '../../store';
import { Text, Float, RoundedBox, Html } from '@react-three/drei';
import { Group, Vector3, MathUtils } from 'three';

const MOO_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1012/1012-preview.mp3';
const MILK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2552/2552-preview.mp3'; // Splash/liquid sound

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

      {/* Feeding Trough */}
      <group position={[-8, 0, 8]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[8, 0.8, 3]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[7.5, 0.1, 2.5]} />
          <meshStandardMaterial color="#271b12" />
        </mesh>
        <mesh position={[0, 0.85, 0]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[7, 0.2, 2.2]} />
          <meshStandardMaterial color="#ca8a04" roughness={1} />
        </mesh>
        <Text position={[0, 2.5, 0]} fontSize={0.8} color="#fbbf24" outlineWidth={0.08} outlineColor="black">
          TROUGH
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
  const [targetPos, setTargetPos] = useState(new Vector3(...data.position));
  const [isMoowing, setIsMoowing] = useState(false);
  const [errorLocal, setErrorLocal] = useState(false);
  const [hoveringUdder, setHoveringUdder] = useState(false);
  const [hoveringBody, setHoveringBody] = useState(false);
  const [harvestFlash, setHarvestFlash] = useState<number | null>(null);

  const playMoo = () => {
    const audio = new Audio(MOO_SOUND);
    audio.volume = 0.3;
    audio.play().catch(() => {});
    setIsMoowing(true);
    setTimeout(() => setIsMoowing(false), 1500);
  };

  const playMilkSound = () => {
    const audio = new Audio(MILK_SOUND);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const mooInterval = setInterval(() => {
      if (Math.random() > 0.8) playMoo();
    }, 12000);

    if (data.status === 'eating') {
      const timer = setTimeout(() => onReady(), 8000);
      return () => { clearTimeout(timer); clearInterval(mooInterval); };
    } else if (data.status === 'grazing') {
      const timer = setTimeout(() => onHungry(), 15000);
      return () => { clearTimeout(timer); clearInterval(mooInterval); };
    }
    return () => clearInterval(mooInterval);
  }, [data.status]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const isStationary = data.status === 'eating' || data.status === 'ready';
    const currentTarget = data.status === 'eating' ? new Vector3(-8, 1.2, 8) : targetPos;

    if (!isStationary && ref.current.position.distanceTo(currentTarget) > 1.2) {
      const direction = new Vector3().subVectors(currentTarget, ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(delta * 2.2));
      const lookTarget = new Vector3().copy(currentTarget);
      lookTarget.y = ref.current.position.y;
      ref.current.lookAt(lookTarget);
    } else if (!isStationary && Math.random() > 0.99) {
       setTargetPos(new Vector3((Math.random() - 0.5) * 32, 1.2, (Math.random() - 0.5) * 32));
    }

    ref.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2.5) * 0.05;

    if (neckRef.current) {
      let dipTarget = 0;
      if (isMoowing) dipTarget = -0.4;
      else if (data.status === 'grazing' || data.status === 'eating') dipTarget = 0.7;
      neckRef.current.rotation.x = MathUtils.lerp(neckRef.current.rotation.x, dipTarget, delta * 3);
    }
  });

  const handleBodyClick = (e: any) => {
    e.stopPropagation();
    playMoo();
    if (data.status === 'hungry') {
      if (tool === 'feed') onFeed();
      else setErrorLocal(true);
    }
    if (errorLocal) setTimeout(() => setErrorLocal(false), 1000);
  };

  const handleUdderClick = (e: any) => {
    e.stopPropagation();
    if (data.status === 'ready') {
      if (tool === 'bucket') {
        playMilkSound();
        setHarvestFlash(data.milkYield);
        onMilk();
        setTimeout(() => setHarvestFlash(null), 2000);
      } else {
        setErrorLocal(true);
        setTimeout(() => setErrorLocal(false), 1000);
      }
    }
  };

  // Udder scale based on milk production amount
  const udderBaseScale = data.status === 'ready' ? 1.6 + (data.milkYield / 30) : 1.2;

  return (
    <group ref={ref} position={data.position}>
      {/* Cow Body - Improved Realistic Proportions */}
      <group 
        onClick={handleBodyClick}
        onPointerEnter={() => setHoveringBody(true)}
        onPointerLeave={() => setHoveringBody(false)}
      >
        <mesh castShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[3.8, 2.4, 2]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Holstein Markings */}
        <mesh position={[0.5, 1.2, 1.01]}><planeGeometry args={[1.5, 1.5]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[-1.2, 0.2, 1.01]}><planeGeometry args={[1.8, 1.2]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[1, 0, -1.01]}><planeGeometry args={[1.2, 2.2]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[-0.5, 1.8, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[2, 1.8]} /><meshStandardMaterial color="#050505" /></mesh>
        
        {/* Legs */}
        <mesh position={[1.4, -1, 0.7]} castShadow><cylinderGeometry args={[0.22, 0.22, 2]} /><meshStandardMaterial color="#eee" /></mesh>
        <mesh position={[-1.4, -1, 0.7]} castShadow><cylinderGeometry args={[0.22, 0.22, 2]} /><meshStandardMaterial color="#eee" /></mesh>
        <mesh position={[1.4, -1, -0.7]} castShadow><cylinderGeometry args={[0.22, 0.22, 2]} /><meshStandardMaterial color="#eee" /></mesh>
        <mesh position={[-1.4, -1, -0.7]} castShadow><cylinderGeometry args={[0.22, 0.22, 2]} /><meshStandardMaterial color="#eee" /></mesh>

        {/* Neck & Head */}
        <group position={[1.9, 0.8, 0]} ref={neckRef}>
          <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[1.4, 1.2, 1.1]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <group position={[1.4, 0.8, 0]}>
             <mesh castShadow>
               <boxGeometry args={[1.2, 1.8, 1.4]} />
               <meshStandardMaterial color="white" />
             </mesh>
             <mesh position={[0.4, 0.5, 0]}><boxGeometry args={[0.5, 1, 1.41]} /><meshStandardMaterial color="#111" /></mesh>
             <mesh position={[0, 1, 0.4]} rotation={[0.4, 0, 0.3]}><coneGeometry args={[0.12, 0.8]} /><meshStandardMaterial color="#efefd0" /></mesh>
             <mesh position={[0, 1, -0.4]} rotation={[-0.4, 0, 0.3]}><coneGeometry args={[0.12, 0.8]} /><meshStandardMaterial color="#efefd0" /></mesh>
             <mesh position={[0.7, -0.2, 0]}><boxGeometry args={[0.5, 1, 1.1]} /><meshStandardMaterial color="#ffc0cb" /></mesh>
          </group>
        </group>

        {/* Feeding Tooltip */}
        {data.status === 'hungry' && (
          <Html position={[0, 2.5, 0]} center>
            <div className={`whitespace-nowrap px-4 py-2 rounded-2xl border-2 border-white text-[12px] font-black uppercase transition-all duration-300 pointer-events-none shadow-2xl ${
              hoveringBody ? 'bg-orange-600 text-white scale-110' : 'bg-black/70 text-white/80 scale-95'
            }`}>
              {tool === 'feed' ? 'Click to Feed 🥣' : 'Equip Feed 🥣'}
            </div>
          </Html>
        )}
      </group>

      {/* Realistic Udder */}
      <group 
        position={[-0.4, -0.4, 0]} 
        onClick={handleUdderClick}
        onPointerEnter={() => setHoveringUdder(true)}
        onPointerLeave={() => setHoveringUdder(false)}
      >
        <mesh scale={udderBaseScale}>
          <sphereGeometry args={[0.65, 16, 16]} />
          <meshStandardMaterial color="#ffb6c1" roughness={0.5} />
        </mesh>
        {/* Teats */}
        <group position={[0, -0.5, 0]}>
          <mesh position={[0.3, 0, 0.3]}><cylinderGeometry args={[0.08, 0.08, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[-0.3, 0, 0.3]}><cylinderGeometry args={[0.08, 0.08, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[0.3, 0, -0.3]}><cylinderGeometry args={[0.08, 0.08, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
          <mesh position={[-0.3, 0, -0.3]}><cylinderGeometry args={[0.08, 0.08, 0.4]} /><meshStandardMaterial color="#ff99aa" /></mesh>
        </group>

        {/* Milking Tooltip - Indicating produced amount */}
        {data.status === 'ready' && (
          <Html position={[0, -1, 0]} center>
            <div className={`whitespace-nowrap px-4 py-3 rounded-2xl border-2 border-white text-[12px] font-black uppercase transition-all duration-300 pointer-events-none shadow-2xl flex flex-col items-center gap-1 ${
              hoveringUdder ? 'bg-blue-600 text-white scale-110' : 'bg-black/70 text-white/80 scale-95'
            }`}>
              <span>{tool === 'bucket' ? 'Click to Milk 🥛' : 'Equip Bucket 🥛'}</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Yield: {data.milkYield}L</span>
            </div>
          </Html>
        )}
      </group>

      {/* General Indicators & Feedback */}
      <group position={[0, 6.5, 0]}>
        {harvestFlash !== null && (
          <Float speed={10} floatIntensity={4}>
            <Text fontSize={1.5} color="#60a5fa" outlineWidth={0.15} outlineColor="white">+{harvestFlash}L MILK!</Text>
          </Float>
        )}
        {isMoowing && !harvestFlash && (
          <Float speed={8} floatIntensity={1.5}>
             <Text fontSize={1.2} color="white" outlineWidth={0.15} outlineColor="black" position={[0, 1.5, 0]}>MOOO!</Text>
          </Float>
        )}
        {errorLocal && (
          <Text fontSize={0.8} color="#ef4444" outlineWidth={0.08} outlineColor="black">USE CORRECT TOOL</Text>
        )}
        {data.status === 'hungry' && !hoveringBody && (
          <Float speed={4} floatIntensity={1.2}>
            <Text fontSize={1} color="white" outlineWidth={0.12} outlineColor="black">🥣 HUNGRY!</Text>
          </Float>
        )}
        {data.status === 'ready' && !hoveringUdder && !harvestFlash && (
          <Float speed={5} floatIntensity={2}>
            <Text fontSize={1.2} color="#60a5fa" outlineWidth={0.15} outlineColor="white">🥛 {data.milkYield}L READY</Text>
          </Float>
        )}
      </group>
    </group>
  );
};
