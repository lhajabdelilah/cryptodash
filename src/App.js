import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MoreVertical, Share2, Star } from 'lucide-react';

const CryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Fonction pour récupérer les données crypto
  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets');
      const data = await response.json();
      setCryptoData(data.data);

      const bitcoinResponse = await fetch('https://api.coincap.io/v2/assets/bitcoin');
      const bitcoinData = await bitcoinResponse.json();
      const newPrice = parseFloat(bitcoinData.data.priceUsd);

      const timestamp = new Date().toLocaleTimeString();
      setPriceHistory((prev) => [...prev.slice(-30), { time: timestamp, price: newPrice }]);

      setBitcoinPrice(newPrice);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-gray-600">{`Time: ${label}`}</p>
          <p className="font-bold text-indigo-600">
            {formatNumber(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeframeButtons = ['1h', '24h', '7d', '30d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Card className="bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Crypto Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Price Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Bitcoin Price
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatNumber(bitcoinPrice)}
                </span>
                <span className="flex items-center text-green-500">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  +2.4%
                </span>
              </div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Market Cap
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatNumber(cryptoData[0]?.marketCapUsd || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex space-x-2 mb-6">
            {timeframeButtons.map((timeframe) => (
              <button
                key={timeframe}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Price Chart */}
          <div className="h-[400px] bg-white p-4 rounded-xl shadow-sm mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                  fill="url(#colorPrice)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Crypto Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change (24h)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cryptoData.slice(0, 10).map((crypto) => (
                  <tr key={crypto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {crypto.symbol.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {crypto.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {crypto.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(crypto.priceUsd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        crypto.changePercent24Hr >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {crypto.changePercent24Hr >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {formatPercentage(crypto.changePercent24Hr)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(crypto.marketCapUsd)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Star className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoDashboard;