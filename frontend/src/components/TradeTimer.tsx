import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TradeTimerProps {
  openTime: Date;
  timeframe: string;
}

export function TradeTimer({ openTime, timeframe }: TradeTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const getTimeframeMinutes = (tf: string): number => {
      const timeframeMap: { [key: string]: number } = {
        '5m': 5,
        '15m': 15,
        '30m': 30,
        '45m': 45,
        '1h': 60,
        '2h': 120
      };
      return timeframeMap[tf] || 60;
    };

    const totalMinutes = getTimeframeMinutes(timeframe);
    const endTime = new Date(openTime.getTime() + totalMinutes * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      const elapsed = now.getTime() - openTime.getTime();
      const totalTime = totalMinutes * 60 * 1000;
      
      setTimeLeft(remaining);
      setProgress((elapsed / totalTime) * 100);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [openTime, timeframe]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-blue-500" />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}