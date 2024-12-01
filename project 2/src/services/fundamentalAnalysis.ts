import { FundamentalData } from '../types/stock';

export function analyzeFundamentals(data: FundamentalData) {
  let score = 0;
  const reasons: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  // Analyse P/E Ratio
  if (data.peRatio > 0 && data.peRatio < 15) {
    score += 20;
    opportunities.push('P/E ratio attractif suggérant une possible sous-évaluation');
  } else if (data.peRatio > 30) {
    score -= 15;
    risks.push('P/E ratio élevé indiquant une possible surévaluation');
  }

  // Analyse ROE
  if (data.roe > 15) {
    score += 15;
    opportunities.push(`ROE solide de ${data.roe.toFixed(1)}% démontrant une bonne rentabilité`);
  } else if (data.roe < 5) {
    score -= 10;
    risks.push('Faible rentabilité des capitaux propres');
  }

  // Croissance des revenus
  if (data.revenueGrowth > 10) {
    score += 20;
    opportunities.push(`Forte croissance des revenus (${data.revenueGrowth.toFixed(1)}%)`);
  } else if (data.revenueGrowth < 0) {
    score -= 15;
    risks.push('Décroissance des revenus');
  }

  // Ratio Dette/Fonds Propres
  if (data.debtToEquity < 0.5) {
    score += 15;
    opportunities.push('Structure financière saine avec un faible endettement');
  } else if (data.debtToEquity > 2) {
    score -= 20;
    risks.push('Niveau d\'endettement élevé');
  }

  return {
    score,
    reasons,
    risks,
    opportunities
  };
}