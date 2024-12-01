import React from 'react';
import { StockAnalysis } from '../types/stock';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockAnalysisCardProps {
  analysis: StockAnalysis;
}

const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({ analysis }) => {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'ACHETER': return 'text-green-600';
      case 'VENDRE': return 'text-red-600';
      default: return 'text-orange-600';
    }
  };

  const chartData = [
    { name: 'Actuel', price: analysis.currentPrice },
    { name: 'Court Terme', price: analysis.currentPrice * 1.05 },
    { name: 'Long Terme', price: analysis.currentPrice * 1.15 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">{analysis.companyName || analysis.symbol}</h2>
          
          <div className="mb-6">
            <div className="text-lg mb-2">
              Score de Confiance: 
              <span className="font-bold ml-2">{analysis.confidence}%</span>
            </div>
            
            <div className="text-lg mb-4">
              Recommandation: 
              <span className={`font-bold ml-2 ${getRecommendationColor(analysis.recommendation)}`}>
                {analysis.recommendation}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Indicateurs Techniques</h3>
            <div className="space-y-1">
              <div>RSI: {analysis.indicators.technical.rsi.toFixed(2)}</div>
              <div>MACD: {analysis.indicators.technical.macd.value.toFixed(2)}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Raisons</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.reasons.map((reason: string, index: number) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Prévision des Prix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            <div>Prix Actuel: {analysis.currentPrice.toFixed(2)}€</div>
            <div>Objectif Court Terme: {(analysis.currentPrice * 1.05).toFixed(2)}€</div>
            <div>Objectif Long Terme: {(analysis.currentPrice * 1.15).toFixed(2)}€</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysisCard;