import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Signal } from '../types/trading';
import { TradeTimer } from './TradeTimer';

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isActive = signal.status === 'active';
  
  const getBorderColor = () => {
    if (signal.status === 'success') return 'border-green-500';
    if (signal.status === 'failed') return 'border-red-500';
    return 'border-blue-500';
  };

  const getPredictionColor = () => {
    return signal.prediction === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = () => {
    if (signal.status === 'success') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Успех
        </span>
      );
    }
    if (signal.status === 'failed') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ❌ Неудача
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        🔄 Активен
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${getBorderColor()} p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-800">{signal.pair}</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {signal.timeframe}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className={`flex items-center gap-1 ${getPredictionColor()}`}>
          {signal.prediction === 'BUY' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">{signal.prediction}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {signal.openTime.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="mb-3">
          <TradeTimer openTime={signal.openTime} timeframe={signal.timeframe} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-red-50 p-2 rounded">
          <div className="text-xs text-gray-600 mb-1">Стоп-лосс</div>
          <div className="text-sm font-medium text-red-600">-{signal.stopLoss}%</div>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <div className="text-xs text-gray-600 mb-1">Тейк-профит</div>
          <div className="text-sm font-medium text-green-600">+{signal.takeProfit}%</div>
        </div>
      </div>

      {signal.profitLoss !== undefined && (
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Результат:</span>
            <span className={`font-medium ${signal.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {signal.profitLoss >= 0 ? '+' : ''}{signal.profitLoss.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}