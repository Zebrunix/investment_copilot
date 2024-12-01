import { StockAnalysis, StockData } from '../types/stock';
import { searchStocks, getStockChart, getStockQuote } from './api/alphaVantage';
import { getStockNews } from './api/marketaux';
import { analyzeStockData } from './analysis/stockAnalyzer';
import { Logger } from './utils/logger';

export const CAC40_COMPANIES = [
  { symbol: 'AI.PA', name: 'Air Liquide', sector: 'Chimie' },
  { symbol: 'BN.PA', name: 'Danone', sector: 'Agroalimentaire' },
  { symbol: 'CAP.PA', name: 'Capgemini', sector: 'Technologies' },
  { symbol: 'MC.PA', name: 'LVMH', sector: 'Luxe' },
  { symbol: 'OR.PA', name: "L'Oréal", sector: 'Cosmétiques' }
] as const;

export const searchEuronextStocks = searchStocks;

export async function analyzeStock(symbol: string): Promise<StockAnalysis> {
  try {
    const [chartData, quote, newsData] = await Promise.all([
      getStockChart(symbol, 'daily'),
      getStockQuote(symbol),
      getStockNews(symbol)
    ]);

    if (!chartData?.historicalData?.length) {
      throw new Error('No historical data available for analysis');
    }

    const stockData: StockData = {
      symbol,
      name: symbol,
      price: quote.price,
      volume: quote.volume,
      high: quote.high,
      low: quote.low
    };

    const prices = chartData.historicalData.map(d => d.close);
    return analyzeStockData(stockData, prices, newsData);
  } catch (error) {
    Logger.error('Error analyzing stock:', error);
    throw error;
  }
}

// Gestion des favoris
const FAVORITES_KEY = 'stockFavorites';

export function getFavorites() {
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    Logger.error('Error getting favorites:', error);
    return [];
  }
}

export function addToFavorites(analysis: StockAnalysis, quantity: number) {
  try {
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(f => f.symbol === analysis.symbol);
    
    if (existingIndex >= 0) {
      favorites[existingIndex] = { 
        symbol: analysis.symbol, 
        quantity, 
        lastAnalysis: analysis 
      };
    } else {
      favorites.push({ 
        symbol: analysis.symbol, 
        quantity, 
        lastAnalysis: analysis 
      });
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    Logger.error('Error adding to favorites:', error);
  }
}

export function removeFromFavorites(symbol: string) {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(f => f.symbol !== symbol);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    Logger.error('Error removing from favorites:', error);
  }
}