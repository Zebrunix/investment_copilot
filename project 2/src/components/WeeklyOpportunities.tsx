import React, { useState } from 'react';
import { FaCalculator, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { analyzeWeeklyOpportunities, calculateInvestmentProjection } from '../services/weeklyAnalyzer';
import { formatCurrency } from '../utils/formatters';

const WeeklyOpportunities: React.FC = () => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [opportunities] = useState(() => analyzeWeeklyOpportunities());
  const [projections, setProjections] = useState<any>(null);

  const handleCalculateProjection = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    const results = calculateInvestmentProjection(opportunities, amount);
    setProjections(results);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Top 5 Opportunités de la Semaine</h2>
          <div className="flex items-center gap-2">
            <FaInfoCircle 
              className="text-gray-400 cursor-help"
              data-tooltip-id="weekly-info"
            />
          </div>
        </div>

        {/* Calculateur d'investissement */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant à investir (€)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 5000"
              />
            </div>
            <button
              onClick={handleCalculateProjection}
              className="h-[42px] px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaCalculator />
              Calculer
            </button>
          </div>
        </div>

        {/* Liste des opportunités */}
        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <div 
              key={opportunity.symbol}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold">{opportunity.companyName}</h3>
                  <p className="text-gray-600">{opportunity.symbol}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(opportunity.currentPrice)}</div>
                  <div className={`text-sm ${
                    opportunity.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {opportunity.weeklyChange > 0 ? '+' : ''}{opportunity.weeklyChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              {projections && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Investissement recommandé</div>
                      <div className="font-bold">{formatCurrency(projections.allocations[opportunity.symbol])}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Gain potentiel (1 mois)</div>
                      <div className="font-bold text-green-600">
                        +{formatCurrency(projections.projectedGains[opportunity.symbol])}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Score de confiance</div>
                  <div className="font-semibold">{opportunity.confidence}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Potentiel mensuel</div>
                  <div className="font-semibold text-green-600">
                    +{opportunity.monthlyUpside.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FaChartLine className="text-green-500" />
                    Points forts :
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {opportunity.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-orange-500" />
                    Risques à considérer :
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {opportunity.risks?.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projections && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Résumé de l'investissement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Investissement total</div>
                <div className="text-xl font-bold">{formatCurrency(parseFloat(investmentAmount))}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Gain potentiel sur 1 mois</div>
                <div className="text-xl font-bold text-green-600">
                  +{formatCurrency(projections.totalProjectedGain)}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              * Les projections sont basées sur une période d'un mois et sont données à titre indicatif.
            </div>
          </div>
        )}
      </div>

      <Tooltip id="weekly-info">
        <div className="max-w-xs">
          <p className="font-bold mb-1">Analyse Hebdomadaire</p>
          <p>
            Notre algorithme analyse en continu le marché pour identifier les 5 meilleures opportunités
            d'investissement à court terme (1 mois) basées sur des critères techniques et fondamentaux.
          </p>
        </div>
      </Tooltip>
    </div>
  );
};

export default WeeklyOpportunities;