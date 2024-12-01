import yahooFinance from 'yahoo-finance2';
import { RSI, MACD, BollingerBands } from 'technicalindicators';
import { StockData, TechnicalIndicators, AnalysisResult } from '../models/stock-analysis.model';

export class StockAnalyzerService {
  private async fetchStockData(symbol: string): Promise<StockData> {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        volume: quote.regularMarketVolume,
        high: quote.regularMarketHigh,
        low: quote.regularMarketLow
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw new Error('Impossible de récupérer les données de l\'action');
    }
  }

  private async getHistoricalPrices(symbol: string): Promise<number[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const historicalData = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate
      });

      return historicalData.map(data => data.close);
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques:', error);
      throw new Error('Impossible de récupérer l\'historique des prix');
    }
  }

  private calculateIndicators(prices: number[]): TechnicalIndicators {
    const rsi = RSI.calculate({
      period: 14,
      values: prices
    });

    const macd = MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices
    });

    const bb = BollingerBands.calculate({
      period: 20,
      stdDev: 2,
      values: prices
    });

    return {
      rsi: rsi[rsi.length - 1],
      macd: macd[macd.length - 1],
      bollingerBands: bb[bb.length - 1]
    };
  }

  public async analyzeStock(symbol: string): Promise<AnalysisResult> {
    try {
      const [stockData, prices] = await Promise.all([
        this.fetchStockData(symbol),
        this.getHistoricalPrices(symbol)
      ]);

      const indicators = this.calculateIndicators(prices);
      const analysis = this.analyzeIndicators(indicators, stockData);

      return {
        symbol: stockData.symbol,
        ...analysis,
        priceTarget: {
          short: Math.round(stockData.price * 1.05 * 100) / 100,
          long: Math.round(stockData.price * 1.15 * 100) / 100
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }

  private analyzeIndicators(indicators: TechnicalIndicators, stockData: StockData) {
    const reasons: string[] = [];
    let score = 0;

    // Analyse RSI
    if (indicators.rsi < 30) {
      score += 30;
      reasons.push('RSI indique une condition de survente');
    } else if (indicators.rsi > 70) {
      reasons.push('RSI indique une condition de surachat');
    } else {
      score += 15;
    }

    // Analyse MACD
    if (indicators.macd.histogram > 0) {
      score += 40;
      reasons.push('MACD montre une dynamique haussière');
    } else {
      reasons.push('MACD montre une dynamique baissière');
    }

    // Analyse Bandes de Bollinger
    const currentPrice = stockData.price;
    if (currentPrice <= indicators.bollingerBands.lower) {
      score += 30;
      reasons.push('Prix proche de la bande inférieure de Bollinger');
    } else if (currentPrice >= indicators.bollingerBands.upper) {
      reasons.push('Prix proche de la bande supérieure de Bollinger');
    }

    return {
      confidenceScore: score,
      recommendation: score > 70 ? 'BUY' : score < 30 ? 'SELL' : 'HOLD',
      technicalIndicators: indicators,
      reasons
    };
  }
}