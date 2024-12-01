import React, { useState, useEffect } from 'react';
import { FaTrash, FaChartLine, FaHistory } from 'react-icons/fa';
import { StockAnalysis } from '../types/stock';
import { getFavorites, removeFromFavorites } from '../services/stockService';
import StockCard from './StockCard';
import { toast } from 'react-toastify';

interface StockListProps {
  currentAnalysis: StockAnalysis | null;
}

const StockList: React.FC<StockListProps> = ({ currentAnalysis }) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    loadFavorites();
  }, [currentAnalysis]);

  const loadFavorites = () => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);
  };

  const handleRemoveFavorite = (symbol: string) => {
    removeFromFavorites(symbol);
    loadFavorites();
    toast.success('Favori supprimé avec succès');
  };

  const getTotalInvestment = () => {
    return favorites.reduce((total, fav) => total + (fav.quantity * fav.lastAnalysis.currentPrice), 0);
  };

  const getPerformanceClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-8">
      {currentAnalysis && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Analyse Actuelle</h2>
          <StockCard analysis={currentAnalysis} isCurrent={true} />
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes Favoris</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedView('cards')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vue Cards
            </button>
            <button
              onClick={() => setSelectedView('table')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vue Tableau
            </button>
          </div>
        </div>

        {favorites.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Résumé du Portefeuille</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Investissement Total</p>
                  <p className="text-xl font-bold">{getTotalInvestment().toFixed(2)}€</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre de Positions</p>
                  <p className="text-xl font-bold">{favorites.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performance Moyenne</p>
                  <p className={`text-xl font-bold ${getPerformanceClass(2.5)}`}>+2.5%</p>
                </div>
              </div>
            </div>

            {selectedView === 'cards' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((favorite) => (
                  <StockCard
                    key={favorite.symbol}
                    analysis={favorite.lastAnalysis}
                    onRemove={() => handleRemoveFavorite(favorite.symbol)}
                    quantity={favorite.quantity}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Actuel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur Totale</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommandation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {favorites.map((favorite) => (
                      <tr key={favorite.symbol} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{favorite.lastAnalysis.companyName}</div>
                          <div className="text-sm text-gray-500">{favorite.symbol}</div>
                        </td>
                        <td className="px-6 py-4">{favorite.quantity}</td>
                        <td className="px-6 py-4">{favorite.lastAnalysis.currentPrice.toFixed(2)}€</td>
                        <td className="px-6 py-4">
                          {(favorite.quantity * favorite.lastAnalysis.currentPrice).toFixed(2)}€
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            favorite.lastAnalysis.recommendation === 'ACHETER' ? 'bg-green-100 text-green-800' :
                            favorite.lastAnalysis.recommendation === 'VENDRE' ? 'bg-red-100 text-red-800' :
                            'bg-amber-50 text-amber-900'
                          }`}>
                            {favorite.lastAnalysis.recommendation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleRemoveFavorite(favorite.symbol)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                            <button className="text-blue-600 hover:text-blue-800">
                              <FaHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FaChartLine className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore de favoris. Analysez une action et ajoutez-la à vos favoris
              pour commencer à suivre votre portefeuille.
            </p>
            <p className="text-sm text-gray-500">
              Utilisez la barre de recherche ci-dessus pour analyser une action.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;