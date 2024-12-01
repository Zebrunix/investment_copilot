import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { searchEuronextStocks, analyzeStock } from '../services/stockService';
import { toast } from 'react-toastify';

interface SearchBarProps {
  onAnalysisComplete: (analysis: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onAnalysisComplete }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchEuronextStocks(value);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        toast.error('Erreur lors de la recherche');
      }
    }, 300);
  };

  const handleSelectStock = async (stock: any) => {
    setQuery(stock.name);
    setShowResults(false);
    setIsLoading(true);

    try {
      const result = await analyzeStock(stock.symbol);
      onAnalysisComplete(result);
      toast.success(`Analyse de ${stock.name} terminée`);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={searchRef} className="relative max-w-2xl mx-auto mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher une entreprise du CAC 40 (ex: Total, LVMH...)"
              className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              disabled={isLoading}
            />
            {isLoading ? (
              <FaSpinner className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={20} />
            ) : (
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {searchResults.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelectStock(result)}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({result.symbol})</span>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {result.exchange}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;