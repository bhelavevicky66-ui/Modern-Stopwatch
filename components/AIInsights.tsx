
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Loader2, X } from 'lucide-react';

interface AIInsightsProps {
  isDarkMode: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ isDarkMode }) => {
  const [insight, setInsight] = useState<{ title: string; tip: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Give me a short, unique productivity tip or focus exercise for someone using a timer or stopwatch right now.',
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tip: { type: Type.STRING }
            },
            required: ['title', 'tip']
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setInsight(data);
    } catch (error) {
      console.error('Failed to fetch AI insight', error);
      setInsight({
        title: "Focus Hack",
        tip: "Try the 50/10 rule: 50 minutes of deep work followed by a 10-minute movement break."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className={`mt-6 w-full max-w-md rounded-3xl p-6 transition-all border ${
      isDarkMode ? 'bg-purple-900/10 border-purple-500/20 text-white' : 'bg-purple-50 border-purple-100 text-purple-900'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-sm">Flow Intelligence</h3>
        </div>
        <button 
          onClick={fetchInsight}
          disabled={loading}
          className="p-1 hover:bg-purple-500/10 rounded-full disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 opacity-0" />}
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-2/3 bg-purple-500/20 rounded"></div>
          <div className="h-3 w-full bg-purple-500/10 rounded"></div>
          <div className="h-3 w-4/5 bg-purple-500/10 rounded"></div>
        </div>
      ) : (
        <div className="space-y-1">
          <h4 className="font-extrabold text-lg">{insight?.title}</h4>
          <p className="text-sm opacity-80 leading-relaxed font-medium">
            {insight?.tip}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
