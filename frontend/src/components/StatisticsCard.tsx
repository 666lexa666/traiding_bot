import React from 'react';
import { Statistics } from '../types/trading';

interface StatisticsCardProps {
  stats: Statistics;
  period: string;
}

export function StatisticsCard({ stats, period }: StatisticsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Статистика за {period}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTrades}</div>
          <div className="text-sm text-gray-500">Всего сделок</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.successfulTrades}</div>
          <div className="text-sm text-gray-500">Успешных</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failedTrades}</div>
          <div className="text-sm text-gray-500">Неудачных</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
          <div className="text-sm text-gray-500">Конверсия</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-center">
          <div className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Общая доходность</div>
        </div>
      </div>
    </div>
  );
}