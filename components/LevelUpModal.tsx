
import React from 'react';
import { useGameStore, FarmLevel } from '../store';
import { Trophy, ChevronRight, X, ArrowRightCircle } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { level, nextLevel, showLevelUpModal, setShowLevelUpModal, money } = useGameStore();

  if (!showLevelUpModal) return null;

  const getLevelName = (lvl: FarmLevel) => {
    switch (lvl) {
      case FarmLevel.CROPS: return "Crop Field";
      case FarmLevel.POULTRY: return "Poultry Ranch";
      case FarmLevel.DAIRY: return "Dairy Farm";
      case FarmLevel.MARKET_TYCOON: return "Agriculture Empire";
      default: return "";
    }
  };

  const getNextLevelName = (lvl: FarmLevel) => getLevelName(lvl + 1);

  const upgradeCosts: Record<number, number> = { 1: 300, 2: 1000, 3: 2500 };
  const cost = upgradeCosts[level] || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative transform animate-in zoom-in-95 duration-300">
        
        {/* Header Decoration */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-24 flex items-center justify-center relative">
          <button 
            onClick={() => setShowLevelUpModal(false)}
            className="absolute top-4 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <div className="bg-white p-4 rounded-full shadow-lg -mb-12 border-4 border-orange-500">
            <Trophy className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="px-10 pb-10 pt-16 text-center">
          <h2 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-2">Milestone Reached!</h2>
          <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
            Level Up to <br/><span className="text-green-600">{getNextLevelName(level)}</span>
          </h1>
          
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Your harvest was successful and your coffers are full. Are you ready to expand your farming empire?
          </p>

          <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 flex justify-between items-center">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Current Balance</p>
              <p className="text-2xl font-black text-green-700">${money.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Upgrade Cost</p>
              <p className="text-2xl font-black text-orange-600">${cost.toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={nextLevel}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-6 rounded-2xl transition-all shadow-[0_10px_20px_rgba(22,101,52,0.3)] hover:shadow-green-200 active:scale-95 text-xl flex items-center justify-center gap-3 group"
          >
            PROCEED TO NEXT FARM
            <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => setShowLevelUpModal(false)}
            className="mt-6 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm uppercase tracking-widest"
          >
            Stay in current level
          </button>
        </div>
      </div>
    </div>
  );
};
