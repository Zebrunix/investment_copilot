import { StockAnalysis } from '../types/stock';
import { getStockNews, generateNewsInsight } from './newsService';

export interface NasdaqOpportunity {
  symbol: string;
  companyName: string;
  currentPrice: number;
  weeklyChange: number;
  monthlyUpside: number;
  marketCap: number;
  sector: string;
  confidence: number;
  technicalScore: number;
  growthScore: number;
  innovationScore: number;
  reasons: string[];
  risks: string[];
}

export interface NasdaqProjection {
  allocations: { [key: string]: number };
  projectedGains: { [key: string]: number };
  totalProjectedGain: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  diversificationScore: number;
}

export async function analyzeNasdaqOpportunities(): Promise<NasdaqOpportunity[]> {
  const opportunities = await Promise.all(
    NASDAQ_COMPANIES.map(async company => {
      const basePrice = 50 + Math.random() * 500;
      const weeklyChange = (Math.random() - 0.5) * 15;
      const confidence = 55 + Math.random() * 35;
      const monthlyUpside = Number((2 + Math.random() * 4).toFixed(2));
      const technicalScore = Math.round(60 + Math.random() * 40);
      const growthScore = Math.round(50 + Math.random() * 50);
      const innovationScore = Math.round(40 + Math.random() * 60);

      const newsData = await getStockNews(company.symbol);
      const newsInsight = generateNewsInsight(newsData);

      return {
        symbol: company.symbol,
        companyName: company.name,
        currentPrice: basePrice,
        weeklyChange,
        monthlyUpside,
        marketCap: Math.random() * 2000 + 100,
        sector: company.sector,
        confidence,
        technicalScore,
        growthScore,
        innovationScore,
        reasons: [
          ...generateTechReasons(technicalScore, growthScore, innovationScore),
          newsInsight?.insight
        ].filter(Boolean),
        risks: generateTechRisks(company.sector)
      };
    })
  );

  return opportunities
    .sort((a, b) => {
      const scoreA = (a.confidence * 0.4) + (a.growthScore * 0.3) + (a.innovationScore * 0.3);
      const scoreB = (b.confidence * 0.4) + (b.growthScore * 0.3) + (b.innovationScore * 0.3);
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

export function calculateNasdaqProjection(
  opportunities: NasdaqOpportunity[],
  totalAmount: number
): NasdaqProjection {
  const allocations: { [key: string]: number } = {};
  const projectedGains: { [key: string]: number } = {};

  const totalScore = opportunities.reduce((sum, opp) => {
    return sum + (opp.confidence * 0.4 + opp.growthScore * 0.3 + opp.innovationScore * 0.3);
  }, 0);

  opportunities.forEach(opp => {
    const compositeScore = opp.confidence * 0.4 + opp.growthScore * 0.3 + opp.innovationScore * 0.3;
    const allocation = (totalAmount * compositeScore) / totalScore;
    allocations[opp.symbol] = allocation;

    const projectedGain = allocation * (opp.monthlyUpside / 100);
    projectedGains[opp.symbol] = projectedGain;
  });

  const totalProjectedGain = Object.values(projectedGains).reduce((sum, gain) => sum + gain, 0);

  const categories = opportunities.map(opp => opp.sector);
  const uniqueCategories = new Set(categories);
  const diversificationScore = (uniqueCategories.size / opportunities.length) * 100;

  const riskLevel = calculateRiskLevel(opportunities);

  return {
    allocations,
    projectedGains,
    totalProjectedGain,
    riskLevel,
    diversificationScore
  };
}

function generateTechReasons(technical: number, growth: number, innovation: number): string[] {
  const reasons = [];

  if (technical > 75) {
    reasons.push("Excellente dynamique technique à court terme");
  }
  if (growth > 70) {
    reasons.push("Forte croissance des revenus attendue");
  }
  if (innovation > 80) {
    reasons.push("Position dominante dans l'innovation technologique");
  }

  if (Math.random() > 0.5) {
    reasons.push("Pipeline prometteur de nouveaux produits");
  }
  if (Math.random() > 0.6) {
    reasons.push("Expansion significative de la part de marché");
  }
  if (Math.random() > 0.7) {
    reasons.push("Investissements importants en R&D");
  }

  return reasons;
}

function generateTechRisks(sector: string): string[] {
  const risks = ["Volatilité typique du secteur technologique"];
  
  switch (sector) {
    case 'Software':
      risks.push("Concurrence intense dans le développement logiciel");
      break;
    case 'Semiconductors':
      risks.push("Dépendance aux cycles des semi-conducteurs");
      break;
    case 'Cloud Computing':
      risks.push("Enjeux de sécurité et de confidentialité des données");
      break;
    default:
      risks.push("Évolution rapide des technologies");
  }

  return risks;
}

function calculateRiskLevel(opportunities: NasdaqOpportunity[]): 'Low' | 'Medium' | 'High' {
  const avgVolatility = opportunities.reduce((sum, opp) => sum + Math.abs(opp.weeklyChange), 0) / opportunities.length;
  
  if (avgVolatility > 10) return 'High';
  if (avgVolatility > 5) return 'Medium';
  return 'Low';
}

// Liste des entreprises du NASDAQ
export const NASDAQ_COMPANIES = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Electronics' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet Services' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Social Media' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Software' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Digital Entertainment' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Semiconductors' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Networking' }
] as const;