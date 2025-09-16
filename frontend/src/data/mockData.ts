import { Signal, ChatMessage } from '../types/trading';

export const CURRENCY_PAIRS = [
  'BTC/USDT',
  'ETH/USDT', 
  'BNB/USDT',
  'ADA/USDT',
  'XRP/USDT',
  'SOL/USDT',
  'DOT/USDT',
  'MATIC/USDT'
];

export const TIMEFRAMES = [
  { label: '5м', value: '5m' },
  { label: '15м', value: '15m' },
  { label: '30м', value: '30m' },
  { label: '45м', value: '45m' },
  { label: '1ч', value: '1h' },
  { label: '2ч', value: '2h' }
];

export const mockActiveSignals: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    timeframe: '1h',
    prediction: 'BUY',
    stopLoss: 2.5,
    takeProfit: 5.0,
    openTime: new Date(Date.now() - 25 * 60 * 1000),
    status: 'active'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    timeframe: '30m',
    prediction: 'SELL',
    stopLoss: 3.0,
    takeProfit: 4.5,
    openTime: new Date(Date.now() - 10 * 60 * 1000),
    status: 'active'
  }
];

export const mockHistorySignals: Signal[] = [
  {
    id: '3',
    pair: 'BTC/USDT',
    timeframe: '1h',
    prediction: 'BUY',
    stopLoss: 2.0,
    takeProfit: 4.0,
    openTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    closeTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'success',
    profitLoss: 3.2
  },
  {
    id: '4',
    pair: 'ETH/USDT',
    timeframe: '15m',
    prediction: 'SELL',
    stopLoss: 2.5,
    takeProfit: 3.5,
    openTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    closeTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    status: 'failed',
    profitLoss: -2.1
  },
  {
    id: '5',
    pair: 'ADA/USDT',
    timeframe: '45m',
    prediction: 'BUY',
    stopLoss: 3.0,
    takeProfit: 6.0,
    openTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    closeTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'success',
    profitLoss: 5.8
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'bot',
    content: 'Добро пожаловать в трейдинг-бот! Я готов анализировать рынок и давать сигналы.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: '2',
    type: 'user',
    content: 'Какие сейчас тренды на рынке?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000)
  },
  {
    id: '3',
    type: 'bot',
    content: 'Анализирую текущие тренды... BTC показывает восходящую динамику, ETH консолидируется в диапазоне.',
    timestamp: new Date(Date.now() - 7 * 60 * 1000)
  }
];