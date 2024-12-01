import { StockAnalysis } from '../types/stock';
import { analyzeStock } from './stockService';

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
}

export interface InvestmentRecommendation {
  symbol: string;
  amount: number;
  expectedReturn: number;
  confidence: number;
  reasoning: string[];
}

export async function analyzePortfolio(
  positions: PortfolioPosition[],
  investmentAmount: number
): Promise<InvestmentRecommendation[]> {
  const analyses: StockAnalysis[] = await Promise.all(
    positions.map(pos => analyzeStock(pos.symbol))
  );

  const recommendations: InvestmentRecommendation[] = [];
  let remainingAmount = investmentAmount;

  // Trier les analyses par score de confiance
  const sortedAnalyses = analyses
    .filter(analysis => analysis.recommendation === 'ACHETER')
    .sort((a, b) => b.confidence - a.confidence);

  for (const analysis of sortedAnalyses) {
    if (remainingAmount <= 0) break;

    const allocation = Math.min(
      remainingAmount,
      (investmentAmount * analysis.confidence) / 100
    );

    if (allocation > 0) {
      recommendations.push({
        symbol: analysis.symbol,
        amount: Math.floor(allocation),
        expectedReturn: analysis.confidence * 0.2, // 20% max return pondéré par le score de confiance
        confidence: analysis.confidence,
        reasoning: [
          `RSI de ${analysis.indicators.rsi.toFixed(2)} indique ${analysis.indicators.rsi < 30 ? 'une opportunité d\'achat' : 'une position neutre'}`,
          `MACD ${analysis.indicators.macd.MACD > 0 ? 'positif' : 'négatif'} suggère une tendance ${analysis.indicators.macd.MACD > 0 ? 'haussière' : 'baissière'}`,
        ]
      });
      remainingAmount -= allocation;
    }
  }

  return recommendations;
}