import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { SignalCard } from './SignalCard';
import { CURRENCY_PAIRS, TIMEFRAMES } from '../data/mockData';
import { TradeSettings, Signal } from '../types/trading';

export function SignalsTab() {
  const [settings, setSettings] = useState<TradeSettings>({
    pair: 'BTC/USDT',
    timeframe: '1h'
  });
  const [autoSearch, setAutoSearch] = useState(false);
  const [activeSignals, setActiveSignals] = useState<Signal[]>([]); // состояние для сигналов
  const [loading, setLoading] = useState(false);

  const handleGetSignal = async () => {
  try {
    // POST на сервер для создания сигнала
    const response = await fetch('https://traiding-bot-jyp4.onrender.com/signals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pair: settings.pair, timeframe: settings.timeframe })
});

    if (!response.ok) throw new Error('Ошибка при создании сигнала');

    // Получаем новый сигнал от сервера
    const newSignal = await response.json();

    // GET для получения всех активных сигналов с уже рассчитанными TP/SL
    const activeRes = await fetch('https://traiding-bot-jyp4.onrender.com/active');
    if (!activeRes.ok) throw new Error('Ошибка при получении активных сигналов');
    const activeSignals = await activeRes.json();

    setSignals(activeSignals); // обновляем стейт сигналов на фронте
  } catch (err: any) {
    console.error(err.message);
  }
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Active Signals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Активные сделки ({activeSignals.length})
        </h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activeSignals.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>

      {/* Trading Settings */}
      <div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Настройки сделки</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoSearch"
                checked={autoSearch}
                onChange={(e) => setAutoSearch(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="autoSearch" className="text-sm font-medium text-gray-700">
                Авто поиск лучших пар
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Валютная пара</label>
              <select
                value={settings.pair}
                onChange={(e) => setSettings(prev => ({ ...prev, pair: e.target.value }))}
                disabled={autoSearch}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  autoSearch ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
              >
                {CURRENCY_PAIRS.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              {autoSearch && <p className="text-xs text-gray-500 mt-1">Бот автоматически выберет лучшие валютные пары для анализа</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Таймфрейм</label>
              <select
                value={settings.timeframe}
                onChange={(e) => setSettings(prev => ({ ...prev, timeframe: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGetSignal}
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              {loading ? 'Загружается...' : 'Дать сигнал'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
