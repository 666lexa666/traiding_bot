import React, { useState, useEffect } from 'react';
import { TrendingUp, Settings, Plus, Activity, Clock, DollarSign, Target, X, CheckCircle } from 'lucide-react';

interface Signal {
  id: string;
  pair: string;
  timeframe: string;
  type: 'BUY' | 'SELL';
  entry: number;
  target: number;
  stopLoss: number;
  timestamp: Date;
  status: 'ACTIVE' | 'CLOSED' | 'HIT_TARGET' | 'HIT_STOP';
  profit?: number;
}

const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 
  'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'BTC/USD', 'ETH/USD', 'XRP/USD'
];

const TIMEFRAMES = ['5m', '15m', '30m', '45m', '1h'];

function App() {
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [autoSelectPair, setAutoSelectPair] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [showNewSignalModal, setShowNewSignalModal] = useState(false);
  
  // Mock signals for demonstration
  useEffect(() => {
    const mockSignals: Signal[] = [
      {
        id: '1',
        pair: 'EUR/USD',
        timeframe: '15m',
        type: 'BUY',
        entry: 1.0850,
        target: 1.0920,
        stopLoss: 1.0800,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'ACTIVE'
      },
      {
        id: '2',
        pair: 'GBP/USD',
        timeframe: '30m',
        type: 'SELL',
        entry: 1.2650,
        target: 1.2580,
        stopLoss: 1.2700,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'HIT_TARGET',
        profit: 45.2
      },
      {
        id: '3',
        pair: 'BTC/USD',
        timeframe: '1h',
        type: 'BUY',
        entry: 43250,
        target: 44200,
        stopLoss: 42800,
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
        status: 'ACTIVE'
      }
    ];
    setSignals(mockSignals);
  }, []);

  const createNewSignal = () => {
    const newSignal: Signal = {
      id: Date.now().toString(),
      pair: autoSelectPair ? CURRENCY_PAIRS[Math.floor(Math.random() * CURRENCY_PAIRS.length)] : selectedPair,
      timeframe: selectedTimeframe,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entry: Math.random() * 2,
      target: Math.random() * 2.5,
      stopLoss: Math.random() * 1.5,
      timestamp: new Date(),
      status: 'ACTIVE'
    };
    
    setSignals(prev => [newSignal, ...prev]);
    setShowNewSignalModal(false);
  };

  const closeSignal = (id: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === id 
        ? { ...signal, status: 'CLOSED' as const }
        : signal
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSignalStatusColor = (status: Signal['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'HIT_TARGET': return 'text-green-600 bg-green-100';
      case 'HIT_STOP': return 'text-red-600 bg-red-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignalTypeColor = (type: Signal['type']) => {
    return type === 'BUY' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Signals</h1>
              <p className="text-slate-400 text-sm">Профессиональные торговые сигналы</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Controls Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Настройки сигналов</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Currency Pair Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Валютная пара</label>
              <select 
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                disabled={autoSelectPair}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {CURRENCY_PAIRS.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>

            {/* Timeframe Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Таймфрейм</label>
              <div className="flex gap-2">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      selectedTimeframe === tf 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Автовыбор</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSelectPair}
                  onChange={(e) => setAutoSelectPair(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-300">Автоматический выбор валютной пары</span>
              </label>
            </div>
          </div>

          {/* New Signal Button */}
          <button
            onClick={() => setShowNewSignalModal(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Новый сигнал
          </button>
        </div>

        {/* Active Signals */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Активные сигналы</h2>
            <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">
              {signals.filter(s => s.status === 'ACTIVE').length}
            </span>
          </div>

          <div className="space-y-4">
            {signals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет активных сигналов</p>
                <p className="text-sm">Создайте новый сигнал для начала торговли</p>
              </div>
            ) : (
              signals.map(signal => (
                <div
                  key={signal.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="font-semibold text-lg">{signal.pair}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalTypeColor(signal.type)}`}>
                        {signal.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalStatusColor(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatTime(signal.timestamp)}
                      </div>
                      {signal.status === 'ACTIVE' && (
                        <button
                          onClick={() => closeSignal(signal.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Таймфрейм:</span>
                      <div className="font-medium">{signal.timeframe}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Вход:</span>
                      <div className="font-medium">{signal.entry.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Цель:</span>
                      <div className="font-medium text-green-400">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {signal.target.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Стоп:</span>
                      <div className="font-medium text-red-400">{signal.stopLoss.toFixed(4)}</div>
                    </div>
                  </div>

                  {signal.profit && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Прибыль: +${signal.profit.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Signal Modal */}
      {showNewSignalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Создать новый сигнал</h3>
              <button
                onClick={() => setShowNewSignalModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-sm text-slate-400">Валютная пара:</span>
                <div className="font-medium">
                  {autoSelectPair ? 'Автоматический выбор' : selectedPair}
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-400">Таймфрейм:</span>
                <div className="font-medium">{selectedTimeframe}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createNewSignal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-medium transition-all"
              >
                Создать сигнал
              </button>
              <button
                onClick={() => setShowNewSignalModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;