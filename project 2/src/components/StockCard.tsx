import React from 'react';
import { StockAnalysis } from '../types/stock';
import { addToFavorites } from '../services/stockService';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { FaStar, FaTrash, FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';

interface StockCardProps {
  analysis: StockAnalysis;
  isCurrent?: boolean;
  onRemove?: () => void;
  quantity?: number;
}

const StockCard: React.FC<StockCardProps> = ({ analysis, isCurrent, onRemove, quantity }) => {
  const handleAddToFavorites = () => {
    const qty = parseInt(prompt('Combien d\'actions possédez-vous ?', '0') || '0');
    if (!isNaN(qty)) {
      addToFavorites(analysis, qty);
      toast.success(`${analysis.symbol} ajouté aux favoris`);
    }
  };

  const getRecommendationStyle = () => {
    switch (analysis.recommendation) {
      case 'ACHETER':
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          border: 'border-green-700'
        };
      case 'VENDRE':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-700'
        };
      default:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-900',
          border: 'border-amber-200'
        };
    }
  };

  const recStyle = getRecommendationStyle();
  const technicalIndicators = analysis.indicators?.technical;

  if (!technicalIndicators) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Données techniques non disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className={`${recStyle.bg} ${recStyle.text} p-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{analysis.companyName || analysis.symbol}</h3>
            <p className="opacity-90">{analysis.currentPrice.toFixed(2)}€</p>
          </div>
          <div className="flex items-center gap-3">
            {quantity !== undefined && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {quantity} actions
              </span>
            )}
            {isCurrent ? (
              <button 
                onClick={handleAddToFavorites}
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <FaStar size={24} />
              </button>
            ) : onRemove && (
              <button 
                onClick={onRemove}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTrash size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{analysis.recommendation}</span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {analysis.confidence}% de confiance
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">RSI</h4>
            <FaInfoCircle 
              className="text-gray-400 cursor-help"
              data-tooltip-id="rsi-tooltip"
            />
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                technicalIndicators.rsi < 30 ? 'bg-green-500' :
                technicalIndicators.rsi > 70 ? 'bg-red-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${technicalIndicators.rsi}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-green-600">Survente (&lt;30)</span>
            <span className="text-red-600">Surachat (&gt;70)</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">MACD</h4>
            <FaInfoCircle 
              className="text-gray-400 cursor-help"
              data-tooltip-id="macd-tooltip"
            />
          </div>
          <div className={`flex items-center gap-2 ${
            technicalIndicators.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {technicalIndicators.macd.histogram > 0 ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )}
            <span>
              {technicalIndicators.macd.histogram > 0 ? 'Tendance haussière' : 'Tendance baissière'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-2">Points clés :</h4>
          {analysis.reasons && analysis.reasons.length > 0 ? (
            <ul className="space-y-2">
              {analysis.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Aucune analyse disponible pour le moment.</p>
          )}
        </div>
      </div>

      <Tooltip id="rsi-tooltip">
        <div className="max-w-xs">
          <p className="font-bold mb-1">RSI (Relative Strength Index)</p>
          <p>Mesure la vitesse et l'ampleur des mouvements de prix.</p>
          <ul className="mt-1">
            <li>• &lt;30 : Action potentiellement sous-évaluée</li>
            <li>• &gt;70 : Action potentiellement surévaluée</li>
          </ul>
        </div>
      </Tooltip>

      <Tooltip id="macd-tooltip">
        <div className="max-w-xs">
          <p className="font-bold mb-1">MACD (Moving Average Convergence Divergence)</p>
          <p>Indique les changements de tendance et la dynamique des prix.</p>
          <ul className="mt-1">
            <li>• Positif : Tendance haussière</li>
            <li>• Négatif : Tendance baissière</li>
          </ul>
        </div>
      </Tooltip>
    </div>
  );
};

export default StockCard;