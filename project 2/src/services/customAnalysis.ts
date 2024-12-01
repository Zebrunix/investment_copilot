import { analyzeFundamentals } from './fundamentalAnalysis';
import { analyzeSentiment } from './sentimentAnalysis';
import * as technicalIndicators from 'technicalindicators';

interface StockData {
  date: string;
  close: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface AnalysisResult {
  indicators: {
    technical: any;
    fundamental: any;
    sentiment: any;
  };
  recommendation: "ACHETER" | "VENDRE" | "CONSERVER";
  confidence: number;
  reasons: string[];
  risks: string[];
  opportunities: string[];
}

export function analyzeStockData(data: StockData[]): AnalysisResult {
  // Analyse technique
  const technicalAnalysis = analyzeTechnicalIndicators(data);
  
  // Simulation des données fondamentales et de sentiment pour l'exemple
  const fundamentalData = {
    peRatio: 15,
    psRatio: 2,
    roe: 12,
    revenueGrowth: 8,
    debtToEquity: 0.8,
    marketCap: 1000000000,
    sector: 'Technology',
    industry: 'Software'
  };

  const sentimentData = {
    newsArticles: [],
    socialMediaMentions: [],
    fearGreedIndex: 50,
    institutionalHoldings: []
  };

  // Analyse fondamentale
  const fundamentalAnalysis = analyzeFundamentals(fundamentalData);
  
  // Analyse du sentiment
  const sentimentAnalysis = analyzeSentiment(sentimentData);

  // Combinaison des scores avec pondération
  const weights = {
    technical: 0.4,
    fundamental: 0.35,
    sentiment: 0.25
  };

  const totalScore = (
    technicalAnalysis.score * weights.technical +
    fundamentalAnalysis.score * weights.fundamental +
    sentimentAnalysis.score * weights.sentiment
  );

  // Détermination de la recommandation finale
  let recommendation: "ACHETER" | "VENDRE" | "CONSERVER";
  if (totalScore > 60) {
    recommendation = "ACHETER";
  } else if (totalScore < 40) {
    recommendation = "VENDRE";
  } else {
    recommendation = "CONSERVER";
  }

  return {
    indicators: {
      technical: technicalAnalysis.indicators,
      fundamental: {
        peRatio: fundamentalData.peRatio,
        psRatio: fundamentalData.psRatio,
        roe: fundamentalData.roe,
        revenueGrowth: fundamentalData.revenueGrowth,
        debtToEquity: fundamentalData.debtToEquity,
        marketPosition: calculateMarketPosition(fundamentalData)
      },
      sentiment: {
        newsScore: 0,
        socialScore: 0,
        fearGreedIndex: sentimentData.fearGreedIndex,
        institutionalSentiment: 0,
        volumeAnalysis: analyzeVolume(data)
      }
    },
    recommendation,
    confidence: Math.round(Math.abs(totalScore)),
    reasons: [
      ...technicalAnalysis.reasons,
      ...fundamentalAnalysis.reasons,
      ...sentimentAnalysis.reasons
    ],
    risks: fundamentalAnalysis.risks,
    opportunities: fundamentalAnalysis.opportunities
  };
}

function analyzeTechnicalIndicators(data: StockData[]) {
  const prices = data.map(d => d.close);
  
  // Calcul RSI
  const rsi = technicalIndicators.RSI.calculate({
    values: prices,
    period: 14
  });

  // Calcul MACD
  const macd = technicalIndicators.MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  });

  // Calcul Bollinger Bands
  const bb = technicalIndicators.BollingerBands.calculate({
    values: prices,
    period: 20,
    stdDev: 2
  });

  const currentRSI = rsi[rsi.length - 1];
  const currentMACD = macd[macd.length - 1];
  const currentBB = bb[bb.length - 1];

  let score = 0;
  const reasons: string[] = [];

  // Analyse RSI
  if (currentRSI < 30) {
    score += 30;
    reasons.push('RSI indique une condition de survente');
  } else if (currentRSI > 70) {
    score -= 30;
    reasons.push('RSI indique une condition de surachat');
  }

  // Analyse MACD
  if (currentMACD.histogram > 0) {
    score += 20;
    reasons.push('MACD montre une dynamique haussière');
  } else {
    score -= 20;
    reasons.push('MACD montre une dynamique baissière');
  }

  return {
    score,
    reasons,
    indicators: {
      rsi: currentRSI,
      macd: {
        value: currentMACD.MACD,
        signal: currentMACD.signal,
        histogram: currentMACD.histogram
      },
      bollinger: currentBB
    }
  };
}

function calculateMarketPosition(data: any) {
  return {
    rank: 1,
    totalCompetitors: 10
  };
}

function analyzeVolume(data: StockData[]) {
  const volumes = data.map(d => d.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const lastVolume = volumes[volumes.length - 1];

  return {
    unusualVolume: lastVolume > avgVolume * 2,
    volumeRatio: lastVolume / avgVolume
  };
}