import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { FaSearch, FaChartLine, FaMicrochip, FaBitcoin } from 'react-icons/fa';
import SearchBar from './components/SearchBar';
import StockList from './components/StockList';
import WeeklyOpportunities from './components/WeeklyOpportunities';
import NasdaqOpportunities from './components/NasdaqOpportunities';
import CryptoOpportunities from './components/CryptoOpportunities';
import { StockAnalysis } from './types/stock';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<StockAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'opportunities' | 'nasdaq' | 'crypto'>('search');

  const tabs = [
    { id: 'search', label: 'Mon Portefeuille', icon: FaSearch },
    { id: 'opportunities', label: 'CAC 40', icon: FaChartLine },
    { id: 'nasdaq', label: 'NASDAQ', icon: FaMicrochip },
    { id: 'crypto', label: 'Crypto', icon: FaBitcoin }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Détecteur d'Investissement</h1>
          <p className="text-blue-100 text-lg">Analysez et suivez vos investissements sur les marchés mondiaux</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-xl shadow-md mb-6 p-1">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="transition-all duration-300">
          {activeTab === 'search' ? (
            <>
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Mon Portefeuille</h2>
                  <p className="text-gray-600">Gérez et analysez vos investissements</p>
                </div>
                <SearchBar onAnalysisComplete={setCurrentAnalysis} />
              </div>
              <StockList currentAnalysis={currentAnalysis} />
            </>
          ) : activeTab === 'opportunities' ? (
            <WeeklyOpportunities />
          ) : activeTab === 'nasdaq' ? (
            <NasdaqOpportunities />
          ) : (
            <CryptoOpportunities />
          )}
        </div>
      </div>

      <footer className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">Les analyses sont basées sur des indicateurs techniques et ne constituent pas des conseils en investissement.</p>
            <p className="text-sm">© 2024 Détecteur d'Investissement. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;