import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaHistory, FaStar } from 'react-icons/fa';
import { searchEuronextStocks } from '../services/stockService';
import StockDetailsModal from './StockDetailsModal';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  lastPrice: number;
  change: number;
}

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Stock[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recentStockSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    };

    loadRecentSearches();
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchResults = await searchEuronextStocks(value);
        setResults(searchResults);
      } catch (error) {
        console.error('Erreur de recherche:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    setShowModal(true);
    
    // Mise à jour des recherches récentes
    const updatedSearches = [
      stock,
      ...recentSearches.filter(s => s.symbol !== stock.symbol)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentStockSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher une action (ex: Total, LVMH...)"
            className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <FaSearch 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>

        {(results.length > 0 || isLoading) && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{stock.symbol}</span>
                      <span className="text-gray-400">•</span>
                      <span>{stock.exchange}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{stock.lastPrice.toFixed(2)}€</div>
                    <div className={`text-sm ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {query.length === 0 && recentSearches.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaHistory className="text-gray-400" />
            <h3 className="text-lg font-semibold">Recherches récentes</h3>
          </div>
          <div className="grid gap-3">
            {recentSearches.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock)}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-sm text-gray-500">{stock.symbol}</div>
                </div>
                <FaStar className="text-gray-300 hover:text-yellow-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStock && (
        <StockDetailsModal
          stock={selectedStock}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default StockSearch;