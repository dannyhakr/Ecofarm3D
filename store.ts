
import { create } from 'zustand';

export enum FarmLevel {
  CROPS = 1,
  POULTRY = 2,
  DAIRY = 3,
  MARKET_TYCOON = 4
}

export type ToolType = 'hoe' | 'seed' | 'sickle' | 'hammer' | 'basket' | 'feed' | 'bucket' | 'brush' | 'chicken_item' | null;

export interface EggData {
  id: string;
  position: [number, number, number];
}

export interface ChickenData {
  id: string;
  lastLayTime: number;
  position: [number, number, number];
  isNesting: boolean;
}

export interface CowData {
  id: string;
  status: 'grazing' | 'hungry' | 'eating' | 'ready';
  lastActionTime: number;
  position: [number, number, number];
  milkYield: number;
}

export interface GameState {
  money: number;
  level: FarmLevel;
  isSelling: boolean;
  lastSaleAmount: number;
  selectedTool: ToolType;
  showGuide: boolean;
  showLevelUpModal: boolean;
  inventory: {
    seeds: number;
    maize: number;
    tomato: number;
    wheat: number;
    eggs: number;
    milk: number;
    chickens: number;
    cowFood: number;
  };
  farmStatus: {
    tilledPlots: boolean[];
    cropsPlanted: { type: 'maize' | 'tomato' | 'wheat', time: number | null }[];
    placedChickens: ChickenData[];
    eggsInScene: EggData[];
    cows: CowData[];
    coopBuilt: boolean;
  };
  addMoney: (amount: number) => void;
  nextLevel: () => void;
  selectTool: (tool: ToolType) => void;
  toggleGuide: () => void;
  setShowLevelUpModal: (show: boolean) => void;
  tillPlot: (index: number) => void;
  plantSeed: (index: number) => void;
  harvestCrop: (index: number) => void;
  sellAll: () => void;
  buildCoop: () => void;
  buyChicken: () => void;
  placeChicken: (position: [number, number, number]) => void;
  spawnEgg: (position: [number, number, number]) => void;
  collectEgg: (id: string) => void;
  buyCow: () => void;
  buyFood: () => void;
  feedCow: (id: string) => void;
  setCowReady: (id: string) => void;
  setCowHungry: (id: string) => void;
  collectMilk: (id: string) => void;
}

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
};

export const useGameStore = create<GameState>((set, get) => ({
  money: 150,
  level: FarmLevel.CROPS,
  isSelling: false,
  lastSaleAmount: 0,
  selectedTool: 'hoe',
  showGuide: true,
  showLevelUpModal: false,
  inventory: {
    seeds: 20, 
    maize: 0,
    tomato: 0,
    wheat: 0,
    eggs: 0,
    milk: 0,
    chickens: 0,
    cowFood: 5,
  },
  farmStatus: {
    tilledPlots: Array(9).fill(false),
    cropsPlanted: Array(9).fill(null).map((_, i) => ({ 
      type: i % 3 === 0 ? 'maize' : (i % 3 === 1 ? 'tomato' : 'wheat'), 
      time: null 
    })),
    placedChickens: [],
    eggsInScene: [],
    cows: [],
    coopBuilt: false,
  },
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  setShowLevelUpModal: (show) => set({ showLevelUpModal: show }),
  nextLevel: () => {
    playSound('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    set((state) => {
      const nextLvl = state.level < 4 ? state.level + 1 : state.level;
      let nextTool: ToolType = state.selectedTool;
      if (nextLvl === FarmLevel.POULTRY) nextTool = 'hammer';
      if (nextLvl === FarmLevel.DAIRY) nextTool = 'feed';
      return { 
        level: nextLvl, 
        selectedTool: nextTool, 
        lastSaleAmount: 0,
        showLevelUpModal: false
      };
    });
  },
  selectTool: (tool) => {
    playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.2);
    set({ selectedTool: tool });
  },
  toggleGuide: () => set((state) => ({ showGuide: !state.showGuide })),
  tillPlot: (index) => {
    if (get().selectedTool !== 'hoe') return;
    playSound('https://assets.mixkit.co/active_storage/sfx/2142/2142-preview.mp3', 0.4);
    set((state) => {
      const tilled = [...state.farmStatus.tilledPlots];
      tilled[index] = true;
      return { farmStatus: { ...state.farmStatus, tilledPlots: tilled } };
    });
  },
  plantSeed: (index) => {
    if (get().selectedTool !== 'seed') return;
    if (get().inventory.seeds <= 0) return;
    playSound('https://assets.mixkit.co/active_storage/sfx/1101/1101-preview.mp3', 0.4);
    set((state) => {
      const planted = [...state.farmStatus.cropsPlanted];
      planted[index] = { ...planted[index], time: Date.now() };
      return { 
        inventory: { ...state.inventory, seeds: state.inventory.seeds - 1 },
        farmStatus: { ...state.farmStatus, cropsPlanted: planted } 
      };
    });
  },
  harvestCrop: (index) => {
    if (get().selectedTool !== 'sickle') return;
    playSound('https://assets.mixkit.co/active_storage/sfx/2144/2144-preview.mp3', 0.5);
    set((state) => {
      const crop = state.farmStatus.cropsPlanted[index];
      const planted = [...state.farmStatus.cropsPlanted];
      const tilled = [...state.farmStatus.tilledPlots];
      planted[index] = { ...planted[index], time: null };
      tilled[index] = false;

      const newInventory = { ...state.inventory };
      if (crop.type === 'maize') newInventory.maize += 1;
      else if (crop.type === 'tomato') newInventory.tomato += 1;
      else if (crop.type === 'wheat') newInventory.wheat += 1;

      return {
        inventory: newInventory,
        farmStatus: { ...state.farmStatus, cropsPlanted: planted, tilledPlots: tilled }
      };
    });
  },
  sellAll: () => {
    const state = get();
    // Earnings from all types of products
    const cropEarnings = (state.inventory.maize + state.inventory.tomato + state.inventory.wheat) * 15;
    const earnings = cropEarnings + state.inventory.eggs * 10 + state.inventory.milk * 25; 
    
    if (earnings === 0) return;
    set({ isSelling: true, lastSaleAmount: earnings });
    playSound('https://assets.mixkit.co/active_storage/sfx/2552/2552-preview.mp3');
    
    setTimeout(() => {
      set((curr) => {
        const newMoney = curr.money + earnings;
        const upgradeCosts: Record<number, number> = { 1: 300, 2: 1000, 3: 2500 };
        const cost = upgradeCosts[curr.level] || 0;
        const shouldShowModal = curr.level < FarmLevel.MARKET_TYCOON && newMoney >= cost;
        const seedsToReplenish = curr.inventory.seeds < 20 ? 20 : curr.inventory.seeds;

        return {
          money: newMoney,
          inventory: { 
            ...curr.inventory, 
            maize: 0, 
            tomato: 0, 
            wheat: 0, 
            eggs: 0, 
            milk: 0, 
            seeds: seedsToReplenish 
          },
          isSelling: false,
          showLevelUpModal: shouldShowModal
        };
      });
      playSound('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', 0.3);
    }, 4000);
  },
  buildCoop: () => {
    if (get().selectedTool !== 'hammer') return;
    if (get().money < 200) return;
    playSound('https://assets.mixkit.co/active_storage/sfx/2135/2135-preview.mp3');
    set((state) => ({
      money: state.money - 200,
      inventory: { ...state.inventory, chickens: state.inventory.chickens + 2 },
      farmStatus: { ...state.farmStatus, coopBuilt: true }
    }));
  },
  buyChicken: () => {
    if (get().money < 50) return;
    set((state) => ({
      money: state.money - 50,
      inventory: { ...state.inventory, chickens: state.inventory.chickens + 1 }
    }));
  },
  placeChicken: (position) => {
    if (get().inventory.chickens <= 0) return;
    const newChicken: ChickenData = {
      id: Math.random().toString(36).substr(2, 9),
      lastLayTime: Date.now(),
      position,
      isNesting: false
    };
    set((state) => ({
      inventory: { ...state.inventory, chickens: state.inventory.chickens - 1 },
      farmStatus: { ...state.farmStatus, placedChickens: [...state.farmStatus.placedChickens, newChicken] }
    }));
  },
  spawnEgg: (position) => {
    const newEgg: EggData = { id: Math.random().toString(36).substr(2, 9), position };
    set((state) => ({ farmStatus: { ...state.farmStatus, eggsInScene: [...state.farmStatus.eggsInScene, newEgg] } }));
  },
  collectEgg: (id) => {
    if (get().selectedTool !== 'basket') return;
    set((state) => ({
      inventory: { ...state.inventory, eggs: state.inventory.eggs + 1 },
      farmStatus: { ...state.farmStatus, eggsInScene: state.farmStatus.eggsInScene.filter(e => e.id !== id) }
    }));
  },
  buyCow: () => {
    if (get().money < 500) return;
    const newCow: CowData = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'grazing',
      lastActionTime: Date.now(),
      position: [(Math.random() - 0.5) * 20, 1.2, (Math.random() - 0.5) * 20],
      milkYield: 0,
    };
    set((state) => ({
      money: state.money - 500,
      farmStatus: { ...state.farmStatus, cows: [...state.farmStatus.cows, newCow] }
    }));
    playSound('https://assets.mixkit.co/active_storage/sfx/1101/1101-preview.mp3', 0.5);
  },
  buyFood: () => {
    if (get().money < 30) return;
    set((state) => ({
      money: state.money - 30,
      inventory: { ...state.inventory, cowFood: state.inventory.cowFood + 5 }
    }));
    playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.2);
  },
  feedCow: (id) => {
    if (get().selectedTool !== 'feed') return;
    if (get().inventory.cowFood <= 0) return;
    set((state) => ({
      inventory: { ...state.inventory, cowFood: state.inventory.cowFood - 1 },
      farmStatus: {
        ...state.farmStatus,
        cows: state.farmStatus.cows.map(c => c.id === id ? { ...c, status: 'eating', lastActionTime: Date.now() } : c)
      }
    }));
    playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.4);
  },
  setCowReady: (id) => {
    set((state) => ({
      farmStatus: {
        ...state.farmStatus,
        cows: state.farmStatus.cows.map(c => 
          c.id === id ? { ...c, status: 'ready', milkYield: Math.floor(Math.random() * 12) + 8 } : c
        )
      }
    }));
    playSound('https://assets.mixkit.co/active_storage/sfx/1012/1012-preview.mp3', 0.3);
  },
  setCowHungry: (id) => {
    set((state) => ({
      farmStatus: {
        ...state.farmStatus,
        cows: state.farmStatus.cows.map(c => c.id === id ? { ...c, status: 'hungry', milkYield: 0 } : c)
      }
    }));
  },
  collectMilk: (id) => {
    if (get().selectedTool !== 'bucket') return;
    const cow = get().farmStatus.cows.find(c => c.id === id);
    if (!cow || cow.status !== 'ready') return;
    
    set((state) => ({
      inventory: { ...state.inventory, milk: state.inventory.milk + cow.milkYield },
      farmStatus: {
        ...state.farmStatus,
        cows: state.farmStatus.cows.map(c => c.id === id ? { ...c, status: 'grazing', lastActionTime: Date.now(), milkYield: 0 } : c)
      }
    }));
    playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.5);
  },
}));
