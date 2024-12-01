import axios from 'axios';
import { API_CONFIG } from './config';
import { Logger } from '../utils/logger';
import { StockData, TimeSeries } from '../../types/stock';

export interface AlphaVantageQuote {
  symbol: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
}

export interface ChartData {
  historicalData: TimeSeries[];
  volume: number;
}

export async function searchStocks(query: string) {
  try {
    const response = await axios.get(API_CONFIG.ALPHA_VANTAGE.BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: API_CONFIG.ALPHA_VANTAGE.API_KEY
      }
    });

    if (!response.data?.bestMatches) {
      Logger.warn('No matches found in Alpha Vantage search');
      return [];
    }

    return response.data.bestMatches
      .filter((match: any) => match['4. region'] === 'Paris' || match['4. region'] === 'France')
      .map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        exchange: 'Euronext Paris',
        type: match['3. type'],
        region: match['4. region']
      }));
  } catch (error) {
    Logger.error('Error searching stocks:', error);
    return [];
  }
}

export async function getStockQuote(symbol: string): Promise<AlphaVantageQuote> {
  try {
    const response = await axios.get(API_CONFIG.ALPHA_VANTAGE.BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_CONFIG.ALPHA_VANTAGE.API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    if (!quote) {
      throw new Error('No quote data received');
    }

    return {
      symbol: quote['01. symbol'],
      price: Number(quote['05. price']),
      volume: Number(quote['06. volume']),
      high: Number(quote['03. high']),
      low: Number(quote['04. low']),
      change: Number(quote['09. change']),
      changePercent: Number(quote['10. change percent'].replace('%', ''))
    };
  } catch (error) {
    Logger.error('Error fetching stock quote:', error);
    throw error;
  }
}

export async function getStockChart(symbol: string, interval: string = 'daily'): Promise<ChartData> {
  try {
    const response = await axios.get(API_CONFIG.ALPHA_VANTAGE.BASE_URL, {
      params: {
        function: `TIME_SERIES_${interval.toUpperCase()}`,
        symbol,
        outputsize: 'compact',
        apikey: API_CONFIG.ALPHA_VANTAGE.API_KEY
      }
    });

    const timeSeriesKey = `Time Series (${interval.charAt(0).toUpperCase() + interval.slice(1)})`;
    const timeSeries = response.data[timeSeriesKey];

    if (!timeSeries) {
      throw new Error('No time series data received');
    }

    const historicalData = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: Number(values['1. open']),
      high: Number(values['2. high']),
      low: Number(values['3. low']),
      close: Number(values['4. close']),
      volume: Number(values['5. volume'])
    }));

    return {
      historicalData,
      volume: historicalData.reduce((sum, data) => sum + data.volume, 0) / historicalData.length
    };
  } catch (error) {
    Logger.error('Error fetching stock chart:', error);
    throw error;
  }
}