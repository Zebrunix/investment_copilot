import axios from 'axios';

const FINANCIAL_NEWS_API = 'https://api.marketaux.com/v1';
const API_KEY = 'TWtLQNhA93njTuC3BZEMmDpZAxhLSnZZN1ke8iPa';

export async function getStockNews(symbol: string) {
  try {
    const response = await axios.get(`${FINANCIAL_NEWS_API}/news/all`, {
      params: {
        symbols: symbol,
        filter_entities: true,
        language: 'fr',
        api_token: API_KEY
      }
    });

    return response.data.data[0] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    return null;
  }
}

export function generateNewsInsight(news: any) {
  if (!news) return null;

  return {
    title: news.title,
    source: news.source,
    url: news.url,
    sentiment: news.sentiment,
    publishedAt: new Date(news.published_at).toLocaleDateString('fr-FR'),
    insight: `${news.title} (Source: ${news.source} - ${new Date(news.published_at).toLocaleDateString('fr-FR')})`
  };
}