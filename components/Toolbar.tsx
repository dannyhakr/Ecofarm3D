
import React from 'react';
import { useGameStore, FarmLevel, ToolType } from '../store';
import { 
  Pickaxe, Sprout, Scissors, Hammer, 
  ShoppingBasket, Wheat, Milk, Brush, 
  HelpCircle, Eye, EyeOff, Bird
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { level, selectedTool, selectTool, showGuide, toggleGuide, inventory } = useGameStore();

  const toolsByLevel = {
    [FarmLevel.CROPS]: [
      { id: 'hoe', icon: <Pickaxe />, label: 'Hoe', color: 'bg-amber-600', hint: 'Tills soil' },
      { id: 'seed', icon: <Sprout />, label: `Seed (${inventory.seeds})`, color: 'bg-green-600', hint: 'Plants corn' },
      { id: 'sickle', icon: <Scissors />, label: 'Sickle', color: 'bg-zinc-500', hint: 'Harvests crop' },
    ],
    [FarmLevel.POULTRY]: [
      { id: 'hammer', icon: <Hammer />, label: 'Hammer', color: 'bg-red-700', hint: 'Builds coop' },
      { id: 'chicken_item', icon: <Bird />, label: `Chicken (${inventory.chickens})`, color: 'bg-yellow-600', hint: 'Place chicken', pulse: inventory.chickens > 0 },
      { id: 'basket', icon: <ShoppingBasket />, label: 'Basket', color: 'bg-orange-500', hint: 'Collects eggs' },
    ],
    [FarmLevel.DAIRY]: [
      { id: 'bucket', icon: <Milk />, label: 'Bucket', color: 'bg-blue-400', hint: 'Milks cows' },
      { id: 'brush', icon: <Brush />, label: 'Brush', color: 'bg-amber-800', hint: 'Grooms cows' },
      { id: 'feed', icon: <Wheat />, label: 'Feed', color: 'bg-yellow-500', hint: 'Feeds herd' },
    ],
    [FarmLevel.MARKET_TYCOON]: []
  };

  const currentTools = (toolsByLevel[level as keyof typeof toolsByLevel] || []) as any[];

  if (level === FarmLevel.MARKET_TYCOON) return null;

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
      {/* Dynamic Tooltip Panel */}
      {showGuide && (
        <div className="bg-black/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20 w-80 pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-green-400" />
              Level Guide
            </h3>
            <span className="text-[10px] text-white/40 font-bold uppercase">Tips Active</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {currentTools.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                <div className={`p-2 rounded-lg text-white ${t.color}`}>{React.cloneElement(t.icon, { size: 16 })}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white uppercase">{t.label}</p>
                  <p className="text-[10px] text-gray-400 italic">{t.hint}</p>
                </div>
                {selectedTool === t.id && (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actual Toolbar */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-3xl p-2 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
        <button 
          onClick={toggleGuide}
          className={`p-4 rounded-full transition-all duration-500 ${showGuide ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
        >
          {showGuide ? <Eye size={24} /> : <EyeOff size={24} />}
        </button>
        
        <div className="w-[1px] h-10 bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pr-2">
          {currentTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => selectTool(tool.id as ToolType)}
              className={`relative group flex flex-col items-center p-4 rounded-[1.5rem] transition-all duration-500 ${
                selectedTool === tool.id 
                  ? `${tool.color} scale-110 shadow-2xl text-white` 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
              } ${tool.pulse ? 'animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.5)]' : ''}`}
            >
              {React.cloneElement(tool.icon, { size: 28 })}
              <span className={`absolute -top-12 bg-black/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-xl uppercase border border-white/10`}>
                {tool.label}
              </span>
              {selectedTool === tool.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
              )}
              {tool.pulse && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
