import { CAC40_COMPANIES } from './stockService';

interface WeeklyOpportunity {
  symbol: string;
  companyName: string;
  currentPrice: number;
  weeklyChange: number;
  confidence: number;
  monthlyUpside: number;
  reasons: string[];
  risks: string[];
}

interface ProjectionResults {
  allocations: { [key: string]: number };
  projectedGains: { [key: string]: number };
  totalProjectedGain: number;
}

export function analyzeWeeklyOpportunities(): WeeklyOpportunity[] {
  return CAC40_COMPANIES
    .map(company => {
      const basePrice = 100 + Math.random() * 900;
      const weeklyChange = (Math.random() - 0.5) * 10;
      const confidence = 60 + Math.random() * 30;
      const monthlyUpside = 1 + Math.random() * 2;

      return {
        symbol: company.symbol,
        companyName: company.shortname,
        currentPrice: basePrice,
        weeklyChange,
        confidence,
        monthlyUpside,
        reasons: generateReasons(confidence, monthlyUpside),
        risks: generateRisks(company.sector)
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

export function calculateInvestmentProjection(
  opportunities: WeeklyOpportunity[],
  totalAmount: number
): ProjectionResults {
  const allocations: { [key: string]: number } = {};
  const projectedGains: { [key: string]: number } = {};
  let totalConfidence = opportunities.reduce((sum, opp) => sum + opp.confidence, 0);

  opportunities.forEach(opportunity => {
    const weight = opportunity.confidence / totalConfidence;
    const allocation = totalAmount * weight;
    allocations[opportunity.symbol] = allocation;

    const projectedGain = allocation * (opportunity.monthlyUpside / 100);
    projectedGains[opportunity.symbol] = projectedGain;
  });

  const totalProjectedGain = Object.values(projectedGains).reduce((sum, gain) => sum + gain, 0);

  return {
    allocations,
    projectedGains,
    totalProjectedGain
  };
}

function generateReasons(confidence: number, monthlyUpside: number): string[] {
  const reasons = [
    `Score de confiance élevé de ${confidence.toFixed(1)}%`,
    `Potentiel de hausse estimé à ${monthlyUpside.toFixed(1)}% sur 1 mois`,
  ];

  if (Math.random() > 0.5) {
    reasons.push("Momentum technique favorable");
  }
  if (Math.random() > 0.6) {
    reasons.push("Position dominante sur le marché");
  }
  if (Math.random() > 0.7) {
    reasons.push("Excellents fondamentaux");
  }

  return reasons;
}

function generateRisks(sector: string): string[] {
  const risks = ["Volatilité du marché actions"];
  
  switch (sector) {
    case 'Luxe':
      risks.push("Sensibilité aux cycles économiques");
      break;
    case 'Technologies':
      risks.push("Forte concurrence internationale");
      break;
    case 'Agroalimentaire':
      risks.push("Risques liés aux matières premières");
      break;
    default:
      risks.push("Risques sectoriels spécifiques");
  }

  return risks;
}