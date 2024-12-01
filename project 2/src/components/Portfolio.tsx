import React from 'react';
import StockSearch from './StockSearch';
import StockList from './StockList';
import { StockAnalysis } from '../types/stock';

interface PortfolioProps {
  currentAnalysis: StockAnalysis | null;
}

const Portfolio: React.FC<PortfolioProps> = ({ currentAnalysis }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mon Portefeuille</h2>
        <p className="text-gray-600">Gérez et analysez vos investissements</p>
      </div>

      <StockSearch />
      
      <StockList currentAnalysis={currentAnalysis} />
    </div>
  );
};

export default Portfolio;