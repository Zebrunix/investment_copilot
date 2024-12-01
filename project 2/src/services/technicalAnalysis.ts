import * as technicalIndicators from 'technicalindicators';

export function calculateIndicators(prices: number[]) {
  return {
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    bollinger: calculateBollingerBands(prices)
  };
}

function calculateRSI(prices: number[]) {
  const rsi = technicalIndicators.RSI.calculate({
    values: prices,
    period: 14
  });
  return rsi[rsi.length - 1];
}

function calculateMACD(prices: number[]) {
  const macd = technicalIndicators.MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  });
  return macd[macd.length - 1];
}

function calculateBollingerBands(prices: number[]) {
  const bb = technicalIndicators.BollingerBands.calculate({
    values: prices,
    period: 20,
    stdDev: 2
  });
  return bb[bb.length - 1];
}