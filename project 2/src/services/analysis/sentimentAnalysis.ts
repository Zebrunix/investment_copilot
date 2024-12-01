import { NewsItem } from '../../types/stock';

export function analyzeSentiment(newsData: NewsItem[]): {
  score: number;
  reasons: string[];
} {
  if (!Array.isArray(newsData)) {
    return { score: 50, reasons: [] };
  }

  let score = 50;
  const reasons: string[] = [];

  // Analyze recent news sentiment
  const recentNews = newsData.slice(0, 5);
  
  for (const news of recentNews) {
    if (news.sentiment === 'positive') {
      score += 5;
      reasons.push(`Actualité positive: ${news.title}`);
    } else if (news.sentiment === 'negative') {
      score -= 5;
      reasons.push(`Actualité négative: ${news.title}`);
    }
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    reasons
  };
}