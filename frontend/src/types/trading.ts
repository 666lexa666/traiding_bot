export interface Signal {
  id: string;
  pair: string;
  timeframe: string;
  prediction: 'BUY' | 'SELL';
  stopLoss: number;
  takeProfit: number;
  openTime: Date;
  closeTime?: Date;
  status: 'active' | 'success' | 'failed';
  profitLoss?: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'signal';
  content: string;
  timestamp: Date;
  signal?: Signal;
}

export interface TradeSettings {
  pair: string;
  timeframe: string;
}

export interface Statistics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  successRate: number;
  totalProfit: number;
}