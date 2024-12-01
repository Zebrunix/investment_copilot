export interface CryptoData {
  symbol: string;
  name: string;
  category: string;
  price: number;
  volume: number;
  marketCap: number;
  supply: number;
}

export interface CryptoIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  volatilityIndex: number;
  networkHealth: number;
}

export interface CryptoOpportunity {
  symbol: string;
  name: string;
  category: string;
  currentPrice: number;
  dailyVolatility: number;
  weeklyChange: number;
  monthlyUpside: number;
  volume24h: number;
  marketCap: number;
  confidence: number;
  technicalScore: number;
  networkScore: number;
  marketScore: number;
  indicators: CryptoIndicators;
  reasons: string[];
  risks: string[];
}