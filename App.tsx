
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls, Stars, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore, FarmLevel } from './store';
import { HUD } from './components/HUD';
import { Toolbar } from './components/Toolbar';
import { SceneManager } from './components/SceneManager';
import { AdvisorAI } from './components/AdvisorAI';
import { LevelUpModal } from './components/LevelUpModal';

const App: React.FC = () => {
  const { level } = useGameStore();
  const [showIntro, setShowIntro] = useState(true);

  // Background Ambient Sound Logic
  useEffect(() => {
    if (!showIntro) {
      const ambient = new Audio('https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3');
      ambient.loop = true;
      ambient.volume = 0.05;
      ambient.play().catch(() => console.log("User interaction required for audio"));
      return () => ambient.pause();
    }
  }, [showIntro]);

  return (
    <div className="w-full h-screen bg-sky-100 overflow-hidden relative">
      <Canvas 
        shadows 
        orthographic 
        camera={{ 
          position: [50, 50, 50], 
          zoom: 40,
          near: 0.1,
          far: 2000 
        }}
      >
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="forest" />
          
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[20, 40, 20]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />

          <SceneManager level={level} />
          
          <ContactShadows resolution={1024} scale={150} blur={2} opacity={0.3} far={50} color="#1a2e05" />
          <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2.1} 
            enablePan={true}
            minZoom={10}
            maxZoom={100}
          />
        </Suspense>
      </Canvas>

      <HUD />
      <Toolbar />
      <LevelUpModal />

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl text-center transform scale-100 animate-in zoom-in duration-300">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-4xl">🐄</span>
            </div>
            <h1 className="text-5xl font-black text-green-800 mb-4 tracking-tight">EcoFarm 3D</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Experience ultra-realistic farming. Build your legacy from seeds to dairy empire in a high-fidelity 3D environment.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:shadow-green-200 active:scale-95 text-xl"
            >
              Start Farming
            </button>
          </div>
        </div>
      )}

      <AdvisorAI />
    </div>
  );
};

export default App;
