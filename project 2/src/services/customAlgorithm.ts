import * as technicalIndicators from 'technicalindicators';

// ... (interfaces identiques)

function calculateRSI(data: StockData[]): number {
  const prices = data.map(d => d.close);
  const rsi = technicalIndicators.RSI.calculate({
    values: prices,
    period: 14
  });
  return rsi[rsi.length - 1];
}

function calculateMovingAverages(data: StockData[], config: { short: number; long: number }): "BUY" | "SELL" | "HOLD" {
  const prices = data.map(d => d.close);
  const shortMA = technicalIndicators.SMA.calculate({
    values: prices,
    period: config.short
  });
  const longMA = technicalIndicators.SMA.calculate({
    values: prices,
    period: config.long
  });

  // ... (reste du code identique)
}

function calculateMACD(data: StockData[], config: { short: number; long: number; signal: number }): "BUY" | "SELL" | "HOLD" {
  const prices = data.map(d => d.close);
  const macd = technicalIndicators.MACD.calculate({
    values: prices,
    fastPeriod: config.short,
    slowPeriod: config.long,
    signalPeriod: config.signal
  });

  // ... (reste du code identique)
}

function calculateBollingerBands(data: StockData[], config: { period: number; deviation: number }): "BUY" | "SELL" | "HOLD" {
  const prices = data.map(d => d.close);
  const bb = technicalIndicators.BollingerBands.calculate({
    values: prices,
    period: config.period,
    stdDev: config.deviation
  });

  // ... (reste du code identique)
}

// ... (reste du code identique)