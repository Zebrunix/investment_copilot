import { getCryptoData } from './cryptoApi';
import { CryptoOpportunity } from '../types/crypto';

export async function analyzeCryptoOpportunities(): Promise<CryptoOpportunity[]> {
  try {
    const cryptoData = await getCryptoData();
    if (!Array.isArray(cryptoData)) {
      throw new Error('Les données reçues ne sont pas au format attendu');
    }
    
    return cryptoData.map(crypto => {
      const technicalScore = calculateTechnicalScore(crypto.technicalIndicators);
      const networkScore = calculateNetworkScore(crypto.volume24h, crypto.marketCap);
      const marketScore = calculateMarketScore(crypto.category, crypto.marketData);
      const confidence = calculateConfidenceScore(technicalScore, networkScore, marketScore);
      const monthlyUpside = calculateMonthlyUpside(crypto.category, crypto.technicalIndicators);

      return {
        symbol: crypto.symbol,
        name: crypto.name,
        category: crypto.category,
        currentPrice: crypto.currentPrice,
        dailyVolatility: crypto.technicalIndicators.volatility,
        weeklyChange: crypto.priceChange24h,
        monthlyUpside,
        volume24h: crypto.volume24h,
        marketCap: crypto.marketCap,
        confidence,
        technicalScore,
        networkScore,
        marketScore,
        indicators: {
          rsi: crypto.technicalIndicators.rsi,
          macd: {
            value: 0,
            signal: 0,
            histogram: 0
          },
          volatilityIndex: crypto.technicalIndicators.volatility,
          networkHealth: networkScore
        },
        reasons: generateCryptoReasons(technicalScore, networkScore, marketScore, crypto),
        risks: generateCryptoRisks(crypto.category, crypto.technicalIndicators)
      };
    }).sort((a, b) => {
      const scoreA = (a.confidence * 0.4) + (a.networkScore * 0.3) + (a.marketScore * 0.3);
      const scoreB = (b.confidence * 0.4) + (b.networkScore * 0.3) + (b.marketScore * 0.3);
      return scoreB - scoreA;
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse des cryptomonnaies:', error);
    throw error;
  }
}

export interface CryptoProjection {
  allocations: { [key: string]: number };
  projectedGains: { [key: string]: number };
  totalProjectedGain: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  diversificationScore: number;
}

export function calculateCryptoProjection(
  opportunities: CryptoOpportunity[],
  totalAmount: number
): CryptoProjection {
  const allocations: { [key: string]: number } = {};
  const projectedGains: { [key: string]: number } = {};

  // Calcul du score total pour la pondération
  const totalScore = opportunities.reduce((sum, opp) => {
    return sum + (opp.confidence * 0.4 + opp.networkScore * 0.3 + opp.marketScore * 0.3);
  }, 0);

  // Allocation des fonds basée sur les scores
  opportunities.forEach(opp => {
    const compositeScore = opp.confidence * 0.4 + opp.networkScore * 0.3 + opp.marketScore * 0.3;
    const allocation = (totalAmount * compositeScore) / totalScore;
    allocations[opp.symbol] = allocation;

    // Calcul des gains projetés basé sur le monthlyUpside
    const projectedGain = allocation * (opp.monthlyUpside / 100);
    projectedGains[opp.symbol] = projectedGain;
  });

  const totalProjectedGain = Object.values(projectedGains).reduce((sum, gain) => sum + gain, 0);

  // Calcul du score de diversification
  const categories = opportunities.map(opp => opp.category);
  const uniqueCategories = new Set(categories);
  const diversificationScore = (uniqueCategories.size / opportunities.length) * 100;

  // Évaluation du niveau de risque
  const riskLevel = calculateRiskLevel(opportunities);

  return {
    allocations,
    projectedGains,
    totalProjectedGain,
    riskLevel,
    diversificationScore
  };
}

function calculateTechnicalScore(indicators: any): number {
  let score = 50; // Score de base

  // RSI
  if (indicators.rsi < 30) score += 20;
  else if (indicators.rsi > 70) score -= 20;

  // Volatilité
  if (indicators.volatility < 30) score += 15;
  else if (indicators.volatility > 60) score -= 15;

  // Tendance
  if (indicators.trend === 'bullish') score += 15;
  else if (indicators.trend === 'bearish') score -= 15;

  return Math.max(0, Math.min(100, score));
}

function calculateNetworkScore(volume24h: number, marketCap: number): number {
  const volumeToMarketCap = volume24h / marketCap;
  let score = 50;

  if (volumeToMarketCap > 0.2) score += 25;
  else if (volumeToMarketCap > 0.1) score += 15;
  else if (volumeToMarketCap < 0.01) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function calculateMarketScore(category: string, marketData: any): number {
  let score = 50;

  // Score basé sur la catégorie
  const categoryScores: { [key: string]: number } = {
    'Store of Value': 20,
    'Smart Contracts': 15,
    'Layer 1': 10,
    'Layer 2': 5
  };

  score += categoryScores[category] || 0;

  // Score basé sur le ratio circulation/max supply
  const supplyRatio = marketData.circulatingSupply / marketData.maxSupply;
  if (supplyRatio < 0.5) score += 15;
  else if (supplyRatio < 0.7) score += 10;
  else if (supplyRatio < 0.9) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateConfidenceScore(technical: number, network: number, market: number): number {
  return Math.round((technical * 0.4 + network * 0.3 + market * 0.3));
}

function calculateMonthlyUpside(category: string, indicators: any): number {
  let baseUpside = 2 + Math.random() * 3; // Base entre 2% et 5%

  if (indicators.trend === 'bullish') baseUpside *= 1.5;
  if (indicators.rsi < 30) baseUpside *= 1.3;
  if (category === 'Layer 1' || category === 'Smart Contracts') baseUpside *= 1.2;

  return Math.round(baseUpside * 10) / 10; // Arrondir à 1 décimale
}

function generateCryptoReasons(technical: number, network: number, market: number, crypto: any): string[] {
  const reasons = [];

  if (technical > 70) {
    reasons.push("Excellents indicateurs techniques");
  }
  if (network > 70) {
    reasons.push("Fort volume d'échanges et liquidité importante");
  }
  if (market > 70) {
    reasons.push("Position dominante dans sa catégorie");
  }
  if (crypto.technicalIndicators.trend === 'bullish') {
    reasons.push("Tendance haussière confirmée");
  }
  if (crypto.technicalIndicators.rsi < 30) {
    reasons.push("Niveau de prix attractif (RSI en zone de survente)");
  }

  return reasons;
}

function generateCryptoRisks(category: string, indicators: any): string[] {
  const risks = ["Volatilité inhérente aux cryptomonnaies"];

  if (indicators.volatility > 50) {
    risks.push("Volatilité particulièrement élevée");
  }

  switch (category) {
    case 'Smart Contracts':
      risks.push("Risques liés aux smart contracts et à la sécurité");
      break;
    case 'Layer 1':
      risks.push("Forte concurrence entre blockchains");
      break;
    case 'Layer 2':
      risks.push("Dépendance à la blockchain principale");
      break;
    case 'Exchange Token':
      risks.push("Dépendance à la performance de l'exchange");
      break;
  }

  return risks;
}

function calculateRiskLevel(opportunities: CryptoOpportunity[]): 'Low' | 'Medium' | 'High' {
  const avgVolatility = opportunities.reduce((sum, opp) => sum + opp.dailyVolatility, 0) / opportunities.length;
  
  if (avgVolatility > 50) return 'High';
  if (avgVolatility > 30) return 'Medium';
  return 'Low';
}