import axios from 'axios';
import { RSI, MACD, BollingerBands } from 'technicalindicators';
import { StockData, TechnicalIndicators, StockAnalysis } from '../types/stock';

export class StockAnalyzer {
  private async fetchStockData(symbol: string): Promise<StockData> {
    try {
      const response = await axios.get(`https://api.example.com/stocks/${symbol}`);
      return {
        symbol: response.data.symbol,
        price: response.data.price,
        volume: response.data.volume,
        high: response.data.high,
        low: response.data.low
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw new Error('Impossible de récupérer les données de l\'action');
    }
  }

  private async getHistoricalPrices(symbol: string): Promise<number[]> {
    try {
      const response = await axios.get(`https://api.example.com/stocks/${symbol}/historical`);
      return response.data.map((item: { close: number }) => item.close);
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques:', error);
      throw new Error('Impossible de récupérer l\'historique des prix');
    }
  }

  private calculateIndicators(prices: number[]): TechnicalIndicators {
    const rsi = RSI.calculate({
      values: prices,
      period: 14
    });

    const macdInput = {
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: true,
      SimpleMASignal: true
    };

    const macdResult = MACD.calculate(macdInput);

    const bb = BollingerBands.calculate({
      period: 20,
      values: prices,
      stdDev: 2
    });

    const lastMACD = macdResult[macdResult.length - 1];

    return {
      rsi: rsi[rsi.length - 1],
      macd: {
        value: lastMACD?.MACD || 0,
        signal: lastMACD?.signal || 0,
        histogram: lastMACD?.histogram || 0
      },
      bollingerBands: bb[bb.length - 1]
    };
  }

  public async analyzeStock(symbol: string): Promise<StockAnalysis> {
    try {
      const [stockData, prices] = await Promise.all([
        this.fetchStockData(symbol),
        this.getHistoricalPrices(symbol)
      ]);

      const indicators = this.calculateIndicators(prices);
      const analysis = this.analyzeIndicators(indicators);

      return {
        symbol: stockData.symbol,
        currentPrice: stockData.price,
        confidence: analysis.confidenceScore,
        recommendation: this.getRecommendation(analysis.confidenceScore),
        indicators: {
          technical: {
            rsi: indicators.rsi,
            macd: indicators.macd,
            bollinger: indicators.bollingerBands
          }
        },
        reasons: analysis.reasons
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }

  private getRecommendation(score: number): 'ACHETER' | 'VENDRE' | 'CONSERVER' {
    if (score > 70) return 'ACHETER';
    if (score < 30) return 'VENDRE';
    return 'CONSERVER';
  }

  private analyzeIndicators(indicators: TechnicalIndicators) {
    const reasons: string[] = [];
    let score = 0;

    if (indicators.rsi < 30) {
      score += 30;
      reasons.push('RSI indique une condition de survente');
    } else if (indicators.rsi > 70) {
      reasons.push('RSI indique une condition de surachat');
    } else {
      score += 15;
    }

    if (indicators.macd.histogram > 0) {
      score += 40;
      reasons.push('MACD montre une dynamique haussière');
    } else {
      reasons.push('MACD montre une dynamique baissière');
    }

    return {
      confidenceScore: score,
      reasons
    };
  }
}