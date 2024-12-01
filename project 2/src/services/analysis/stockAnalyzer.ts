import { StockAnalysis, StockData } from '../../types/stock';
import { analyzeTechnicalIndicators } from './technicalAnalysis';
import { analyzeSentiment } from './sentimentAnalysis';
import { Logger } from '../utils/logger';

export function analyzeStockData(
  stockData: StockData,
  historicalPrices: number[],
  newsData: any[]
): StockAnalysis {
  try {
    if (!stockData || !Array.isArray(historicalPrices) || historicalPrices.length === 0) {
      throw new Error('Invalid data for stock analysis');
    }

    const technicalIndicators = analyzeTechnicalIndicators(historicalPrices);
    const sentiment = analyzeSentiment(newsData);
    
    // Calculate composite confidence score
    const technicalScore = calculateTechnicalScore(technicalIndicators);
    const confidence = Math.round((technicalScore * 0.7) + (sentiment.score * 0.3));
    
    return {
      symbol: stockData.symbol,
      companyName: stockData.name || stockData.symbol,
      currentPrice: historicalPrices[historicalPrices.length - 1],
      confidence,
      recommendation: getRecommendation(confidence),
      indicators: {
        technical: {
          rsi: technicalIndicators.rsi,
          macd: technicalIndicators.macd,
          bollinger: technicalIndicators.bollinger
        }
      },
      reasons: [
        ...generateTechnicalReasons(technicalIndicators),
        ...sentiment.reasons
      ]
    };
  } catch (error) {
    Logger.error('Error in stock analysis:', error);
    throw error;
  }
}

function calculateTechnicalScore(indicators: ReturnType<typeof analyzeTechnicalIndicators>): number {
  let score = 50;

  // RSI Analysis
  if (indicators.rsi < 30) score += 20;
  else if (indicators.rsi > 70) score -= 20;

  // MACD Analysis
  if (indicators.macd.histogram > 0) score += 15;
  else score -= 15;

  // Bollinger Bands Analysis
  const currentPrice = indicators.bollinger.middle;
  if (currentPrice <= indicators.bollinger.lower) score += 15;
  else if (currentPrice >= indicators.bollinger.upper) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function getRecommendation(confidence: number): 'ACHETER' | 'VENDRE' | 'CONSERVER' {
  if (confidence >= 70) return 'ACHETER';
  if (confidence <= 30) return 'VENDRE';
  return 'CONSERVER';
}

function generateTechnicalReasons(indicators: ReturnType<typeof analyzeTechnicalIndicators>): string[] {
  const reasons: string[] = [];

  // RSI-based reasons
  if (indicators.rsi < 30) {
    reasons.push('RSI indique une condition de survente');
  } else if (indicators.rsi > 70) {
    reasons.push('RSI indique une condition de surachat');
  }

  // MACD-based reasons
  if (indicators.macd.histogram > 0) {
    reasons.push('MACD montre une dynamique haussière');
  } else {
    reasons.push('MACD montre une dynamique baissière');
  }

  // Bollinger Bands-based reasons
  const currentPrice = indicators.bollinger.middle;
  if (currentPrice <= indicators.bollinger.lower) {
    reasons.push('Prix proche de la bande inférieure de Bollinger');
  } else if (currentPrice >= indicators.bollinger.upper) {
    reasons.push('Prix proche de la bande supérieure de Bollinger');
  }

  return reasons;
}