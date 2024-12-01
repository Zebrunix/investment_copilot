import { SentimentData, NewsArticle, SocialMediaMention, InstitutionalHolding } from '../types/stock';

export function analyzeSentiment(data: SentimentData) {
  let score = 0;
  const reasons: string[] = [];

  // Analyse des news
  const newsScore = calculateNewsScore(data.newsArticles);
  if (newsScore > 0.5) {
    score += 15;
    reasons.push('Sentiment médiatique très positif');
  } else if (newsScore < -0.5) {
    score -= 15;
    reasons.push('Couverture médiatique négative');
  }

  // Analyse des réseaux sociaux
  const socialScore = calculateSocialScore(data.socialMediaMentions);
  if (socialScore > 0.5) {
    score += 10;
    reasons.push('Fort intérêt positif sur les réseaux sociaux');
  } else if (socialScore < -0.5) {
    score -= 10;
    reasons.push('Sentiment négatif sur les réseaux sociaux');
  }

  // Fear & Greed Index
  if (data.fearGreedIndex < 20) {
    score += 15; // Opportunité potentielle en période de peur excessive
    reasons.push('Marché en situation de peur excessive - opportunité potentielle');
  } else if (data.fearGreedIndex > 80) {
    score -= 15;
    reasons.push('Marché potentiellement suracheté');
  }

  // Analyse des positions institutionnelles
  const institutionalSentiment = analyzeInstitutionalHoldings(data.institutionalHoldings);
  if (institutionalSentiment > 0) {
    score += 20;
    reasons.push('Accumulation par les investisseurs institutionnels');
  } else if (institutionalSentiment < 0) {
    score -= 20;
    reasons.push('Réduction des positions institutionnelles');
  }

  return {
    score,
    reasons
  };
}

function calculateNewsScore(articles: NewsArticle[]): number {
  if (articles.length === 0) return 0;
  const avgSentiment = articles.reduce((sum, article) => sum + article.sentiment, 0) / articles.length;
  return avgSentiment;
}

function calculateSocialScore(mentions: SocialMediaMention[]): number {
  if (mentions.length === 0) return 0;
  const weightedScore = mentions.reduce((sum, mention) => {
    return sum + (mention.sentiment * mention.volume);
  }, 0);
  const totalVolume = mentions.reduce((sum, mention) => sum + mention.volume, 0);
  return weightedScore / totalVolume;
}

function analyzeInstitutionalHoldings(holdings: InstitutionalHolding[]): number {
  if (holdings.length === 0) return 0;
  const netChange = holdings.reduce((sum, holding) => sum + holding.changePercent, 0);
  return netChange / holdings.length;
}