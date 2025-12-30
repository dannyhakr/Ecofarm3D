
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useGameStore } from '../store';
import { Bot, X, Sparkles } from 'lucide-react';

export const AdvisorAI: React.FC = () => {
  const { money, level, inventory } = useGameStore();
  const [advice, setAdvice] = useState<string>("Click me for expert farming tips!");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    setIsOpen(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `As a farming expert, give a short, encouraging 2-sentence tip for a player with $${money} at level ${level}. They have ${inventory.crops} crops, ${inventory.eggs} eggs, and ${inventory.milk} milk in their inventory.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Keep tilling that soil, farmer!");
    } catch (error) {
      console.error(error);
      setAdvice("Soil's looking rich today! Keep up the hard work.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-40">
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-4 max-w-xs border-2 border-green-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <Sparkles size={16} />
              <span>Agri-Bot AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <p className="text-gray-700 text-sm italic">
            {loading ? "Thinking..." : advice}
          </p>
        </div>
      )}
      
      <button
        onClick={getAdvice}
        className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-green-700 transition-all hover:scale-110 active:scale-95 group"
      >
        <Bot size={32} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
