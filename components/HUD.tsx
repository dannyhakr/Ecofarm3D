
import React from 'react';
import { useGameStore, FarmLevel } from '../store';
import { Wallet, TrendingUp, Sprout, Bird, Beef, ShoppingCart, Zap, Wheat } from 'lucide-react';

export const HUD: React.FC = () => {
  const { money, level, inventory, sellAll, lastSaleAmount, setShowLevelUpModal } = useGameStore();

  const getLevelName = (lvl: FarmLevel) => {
    switch (lvl) {
      case FarmLevel.CROPS: return "Crop Master";
      case FarmLevel.POULTRY: return "Poultry Rancher";
      case FarmLevel.DAIRY: return "Dairy Tycoon";
      case FarmLevel.MARKET_TYCOON: return "Agriculture King";
    }
  };

  const getUpgradeCost = () => {
    if (level === FarmLevel.CROPS) return 300;
    if (level === FarmLevel.POULTRY) return 1000;
    if (level === FarmLevel.DAIRY) return 2500;
    return 0;
  };

  const canUpgrade = () => {
    const cost = getUpgradeCost();
    return money >= cost && lastSaleAmount > 0;
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border-b-4 border-green-600 flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</p>
              <p className="text-2xl font-black text-green-700">${money.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border-b-4 border-blue-600 flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</p>
              <p className="text-xl font-black text-blue-700">{getLevelName(level)}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Button Area */}
        {level < FarmLevel.MARKET_TYCOON && (
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <button 
              onClick={() => setShowLevelUpModal(true)}
              disabled={!canUpgrade()}
              className={`flex flex-col items-center gap-1 px-8 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl relative ${
                canUpgrade() 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:scale-105 active:scale-95 animate-bounce' 
                : 'bg-white/40 text-gray-500 cursor-not-allowed border border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                 {canUpgrade() ? 'NEW LEVEL UNLOCKED!' : `NEXT LEVEL COST: $${getUpgradeCost()}`}
                 <Zap className={`w-6 h-6 ${canUpgrade() ? 'fill-white' : ''}`} />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar: Inventory and Actions */}
      <div className="flex justify-between items-end">
        <div className="bg-white/95 backdrop-blur p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 flex gap-8 pointer-events-auto">
          <InventoryItem icon={<Sprout />} count={inventory.crops} label="Yield" color="text-green-600" />
          <InventoryItem icon={<Bird />} count={inventory.eggs} label="Eggs" color="text-yellow-600" />
          <InventoryItem icon={<Beef />} count={inventory.milk} label="Milk" color="text-blue-600" />
          <InventoryItem icon={<Wheat />} count={inventory.cowFood} label="Feed" color="text-orange-600" />
        </div>

        <button 
          onClick={sellAll}
          className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-8 rounded-[3rem] font-black text-2xl shadow-2xl transform transition hover:-translate-y-2 active:translate-y-0 pointer-events-auto flex items-center gap-5 border-b-8 border-orange-800 group"
        >
          <ShoppingCart className="w-10 h-10 group-hover:rotate-12 transition-transform" />
          LOAD LORRY & SELL
        </button>
      </div>
    </div>
  );
};

const InventoryItem: React.FC<{ icon: React.ReactNode, count: number, label: string, color: string }> = ({ icon, count, label, color }) => (
  <div className="flex flex-col items-center">
    <div className={`p-4 rounded-3xl bg-gray-50 mb-2 ${color} shadow-inner`}>
      {React.cloneElement(icon as React.ReactElement, { size: 32 })}
    </div>
    <p className="text-3xl font-black text-gray-800">{count}</p>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
  </div>
);
