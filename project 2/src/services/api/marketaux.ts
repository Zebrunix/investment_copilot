import axios from 'axios';
import { API_CONFIG } from './config';
import { Logger } from '../utils/logger';

export async function getStockNews(symbol: string) {
  try {
    const response = await axios.get(`${API_CONFIG.MARKETAUX.BASE_URL}/news/all`, {
      params: {
        symbols: symbol,
        filter_entities: true,
        language: 'fr',
        api_token: API_CONFIG.MARKETAUX.API_KEY
      }
    });

    if (!response.data?.data) {
      Logger.warn('No news data received from Marketaux');
      return [];
    }

    return response.data.data.map((item: any) => ({
      title: String(item.title || ''),
      description: String(item.description || ''),
      url: String(item.url || ''),
      source: String(item.source || ''),
      published_at: String(item.published_at || ''),
      sentiment: String(item.sentiment || 'neutral')
    }));
  } catch (error) {
    Logger.error('Error fetching news:', error);
    return [];
  }
}