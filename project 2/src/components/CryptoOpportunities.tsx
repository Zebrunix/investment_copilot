import React, { useState, useEffect } from 'react';
import { FaCalculator, FaBitcoin, FaInfoCircle, FaChartLine } from 'react-icons/fa';
import { analyzeCryptoOpportunities, calculateCryptoProjection } from '../services/cryptoAnalyzer';
import { formatCurrency } from '../utils/formatters';
import { CryptoOpportunity } from '../types/crypto';
import { Tooltip } from 'react-tooltip';

const CryptoOpportunities: React.FC = () => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [opportunities, setOpportunities] = useState<CryptoOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projections, setProjections] = useState<any>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await analyzeCryptoOpportunities();
        setOpportunities(data);
      } catch (err) {
        setError("Impossible de charger les données des cryptomonnaies. Veuillez réessayer plus tard.");
        console.error("Erreur lors du chargement des cryptomonnaies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleCalculateInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const results = calculateCryptoProjection(opportunities, amount);
    setProjections(results);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaBitcoin className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold">Top Crypto Opportunities</h2>
          </div>
          <FaInfoCircle 
            className="text-gray-400 cursor-help"
            data-tooltip-id="crypto-info"
          />
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
                placeholder="Ex: 1000"
              />
            </div>
            <button
              onClick={handleCalculateInvestment}
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
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {opportunity.name}
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {opportunity.category}
                    </span>
                  </h3>
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

              <div className="mt-4 grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Score Technique</div>
                  <div className="font-semibold">{opportunity.technicalScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Score Réseau</div>
                  <div className="font-semibold">{opportunity.networkScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Score Marché</div>
                  <div className="font-semibold">{opportunity.marketScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Potentiel mensuel</div>
                  <div className="font-semibold text-green-600">+{opportunity.monthlyUpside}%</div>
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
                    {opportunity.risks.map((risk, index) => (
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
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Niveau de risque</div>
                <div className={`font-bold ${
                  projections.riskLevel === 'High' ? 'text-red-600' :
                  projections.riskLevel === 'Medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {projections.riskLevel}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Score de diversification</div>
                <div className="font-bold">{projections.diversificationScore.toFixed(1)}%</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              * Les projections sont basées sur une période d'un mois et sont données à titre indicatif.
              Le marché des cryptomonnaies est particulièrement volatil.
            </div>
          </div>
        )}
      </div>

      <Tooltip id="crypto-info">
        <div className="max-w-xs">
          <p className="font-bold mb-1">Analyse Crypto</p>
          <p>
            Notre algorithme analyse les cryptomonnaies en temps réel en prenant en compte
            les indicateurs techniques, la santé du réseau et les tendances du marché.
          </p>
        </div>
      </Tooltip>
    </div>
  );
};

export default CryptoOpportunities;