import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { SignalCard } from './SignalCard';
import { StatisticsCard } from './StatisticsCard';
import { mockHistorySignals } from '../data/mockData';
import { Statistics } from '../types/trading';

export function HistoryTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('day');

  const periods = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' }
  ];

  const statistics: Statistics = useMemo(() => {
    const successfulTrades = mockHistorySignals.filter(s => s.status === 'success').length;
    const failedTrades = mockHistorySignals.filter(s => s.status === 'failed').length;
    const totalTrades = mockHistorySignals.length;
    const totalProfit = mockHistorySignals.reduce((sum, signal) => sum + (signal.profitLoss || 0), 0);
    
    return {
      totalTrades,
      successfulTrades,
      failedTrades,
      successRate: totalTrades > 0 ? Math.round((successfulTrades / totalTrades) * 100) : 0,
      totalProfit
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="flex gap-4 items-center mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2">
          {periods.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <StatisticsCard 
        stats={statistics} 
        period={periods.find(p => p.value === selectedPeriod)?.label || 'День'} 
      />

      {/* History List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          История сделок ({mockHistorySignals.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockHistorySignals.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
}