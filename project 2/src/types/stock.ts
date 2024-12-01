export interface StockData {
  symbol: string;
  name?: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}

export interface TimeSeries {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  currentPrice: number;
  confidence: number;
  recommendation: 'ACHETER' | 'VENDRE' | 'CONSERVER';
  indicators: {
    technical: TechnicalIndicators;
  };
  reasons: string[];
}