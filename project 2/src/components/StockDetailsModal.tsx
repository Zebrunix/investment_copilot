import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaNewspaper } from 'react-icons/fa';
import { createChart } from 'lightweight-charts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStockDetails, getStockNews } from '../services/stockService';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  lastPrice: number;
  change: number;
}

interface StockDetailsModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
}

const timeRanges = [
  { label: '1J', value: '1d' },
  { label: '1S', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1A', value: '1y' },
  { label: '5A', value: '5y' }
];

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({ stock, isOpen, onClose }) => {
  const [selectedRange, setSelectedRange] = useState('1m');
  const [chartData, setChartData] = useState<any[]>([]);
  const [details, setDetails] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [detailsData, newsData] = await Promise.all([
          getStockDetails(stock.symbol, selectedRange),
          getStockNews(stock.symbol)
        ]);
        setDetails(detailsData);
        setNews(newsData);
        setChartData(detailsData.historicalData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [stock.symbol, selectedRange, isOpen]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#4CAF50',
      downColor: '#FF5252',
      borderVisible: false,
      wickUpColor: '#4CAF50',
      wickDownColor: '#FF5252'
    });

    candlestickSeries.setData(chartData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex justify-between items-start p-6">
              <div>
                <Dialog.Title className="text-2xl font-bold">
                  {stock.name}
                </Dialog.Title>
                <div className="text-gray-600">{stock.symbol} • {stock.exchange}</div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="flex gap-2 px-6 pb-4">
              {timeRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    selectedRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div ref={chartContainerRef} className="w-full" />

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Dernier cours</div>
                    <div className="text-xl font-bold">{stock.lastPrice.toFixed(2)}€</div>
                    <div className={`text-sm ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Volume</div>
                    <div className="text-xl font-bold">
                      {details?.volume.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">24h</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Potentiel mensuel</div>
                    <div className="text-xl font-bold text-green-600">
                      +{details?.monthlyPotential.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">Estimation</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaNewspaper />
                    Dernières actualités
                  </h3>
                  <div className="space-y-4">
                    {news.map((article, index) => (
                      <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="text-lg font-medium mb-2">{article.title}</div>
                        <div className="text-sm text-gray-600">
                          {article.source} • {format(new Date(article.published_at), 'PPP', { locale: fr })}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default StockDetailsModal;