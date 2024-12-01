import { TechnicalIndicators } from '../../types/stock';

export function analyzeTechnicalIndicators(prices: number[]): TechnicalIndicators {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('Invalid price data for technical analysis');
  }

  const currentPrice = prices[prices.length - 1];
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bollinger = calculateBollingerBands(prices);

  return {
    rsi,
    macd,
    bollinger
  };
}

function calculateRSI(prices: number[]): number {
  // Simplified RSI calculation for demo
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains.push(difference);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(difference));
    }
  }

  const avgGain = average(gains.slice(-14));
  const avgLoss = average(losses.slice(-14));
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([macdLine], 9);
  
  return {
    value: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
}

function calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
  const sma = average(prices.slice(-20));
  const stdDev = standardDeviation(prices.slice(-20));
  
  return {
    upper: sma + (2 * stdDev),
    middle: sma,
    lower: sma - (2 * stdDev)
  };
}

function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = average(prices.slice(0, period));
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

function standardDeviation(numbers: number[]): number {
  const avg = average(numbers);
  const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
  return Math.sqrt(average(squareDiffs));
}