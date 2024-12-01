import React from 'react';
import { InvestmentRecommendation } from '../services/portfolioAnalyzer';

interface PortfolioAnalysisProps {
  recommendations: InvestmentRecommendation[];
  totalAmount: number;
}

const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({ recommendations, totalAmount }) => {
  const totalExpectedReturn = recommendations.reduce(
    (sum, rec) => sum + (rec.amount * rec.expectedReturn) / 100,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommandations d'Investissement</h2>
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <div key={rec.symbol} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{rec.symbol}</h3>
              <span className="text-green-600 font-bold">
                {rec.expectedReturn.toFixed(1)}% attendu
              </span>
            </div>
            <div className="text-lg mb-2">
              Montant recommandé: <span className="font-bold">{rec.amount.toFixed(2)}€</span>
            </div>
            <div className="text-gray-600">
              <div>Score de confiance: {rec.confidence}%</div>
              <ul className="list-disc list-inside mt-2">
                {rec.reasoning.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t">
          <div className="text-xl">
            Retour total estimé:{' '}
            <span className="font-bold text-green-600">
              {totalExpectedReturn.toFixed(2)}€ ({((totalExpectedReturn / totalAmount) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis;