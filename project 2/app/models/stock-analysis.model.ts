export interface StockData {
  symbol: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface AnalysisResult {
  symbol: string;
  confidenceScore: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  technicalIndicators: TechnicalIndicators;
  priceTarget: {
    short: number;
    long: number;
  };
  reasons: string[];
}