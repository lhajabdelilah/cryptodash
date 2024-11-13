import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, MoreVertical, Share2, Star } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

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
        <div className="bg-dark p-3 rounded shadow-sm border border-secondary">
          <p className="text-light mb-1">{`Time: ${label}`}</p>
          <p className="fw-bold text-info mb-0">
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
      <div className="d-flex align-items-center justify-content-center vh-100 bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-light">
      <div className="container-fluid py-4">
        <div className="card bg-dark border-secondary">
          <div className="card-body">
            <h1 className="card-title h3 mb-4">Crypto Market Overview</h1>

            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="card bg-secondary">
                  <div className="card-body">
                    <h3 className="card-title h5 text-light mb-3">Bitcoin Price</h3>
                    <div className="d-flex align-items-center">
                      <span className="h2 mb-0 text-info me-3">
                        {formatNumber(bitcoinPrice)}
                      </span>
                      <span className="d-flex align-items-center text-success">
                        <TrendingUp className="me-1" size={20} />
                        +2.4%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-secondary">
                  <div className="card-body">
                    <h3 className="card-title h5 text-light mb-3">Market Cap</h3>
                    <span className="h2 mb-0 text-info">
                      {formatNumber(cryptoData[0]?.marketCapUsd || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="btn-group mb-4">
              {timeframeButtons.map((timeframe) => (
                <button
                  key={timeframe}
                  className={`btn ${
                    selectedTimeframe === timeframe
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            <div className="card bg-secondary mb-4">
              <div className="card-body" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0dcaf0" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0dcaf0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#6c757d" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#adb5bd"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#adb5bd"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#0dcaf0"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                      fill="url(#colorPrice)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th scope="col">Asset</th>
                    <th scope="col">Price</th>
                    <th scope="col">Change (24h)</th>
                    <th scope="col">Market Cap</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoData.slice(0, 10).map((crypto) => (
                    <tr key={crypto.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <span className="text-light fw-bold">
                              {crypto.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="fw-bold">{crypto.name}</div>
                            <small className="text-muted">{crypto.symbol}</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {formatNumber(crypto.priceUsd)}
                      </td>
                      <td className="align-middle">
                        <div className={`d-flex align-items-center ${
                          crypto.changePercent24Hr >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {crypto.changePercent24Hr >= 0 ? (
                            <TrendingUp size={16} className="me-1" />
                          ) : (
                            <TrendingDown size={16} className="me-1" />
                          )}
                          {formatPercentage(crypto.changePercent24Hr)}
                        </div>
                      </td>
                      <td className="align-middle text-muted">
                        {formatNumber(crypto.marketCapUsd)}
                      </td>
                      <td className="align-middle text-end">
                        <div className="btn-group">
                          <button className="btn btn-outline-secondary btn-sm">
                            <Star size={16} />
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <Share2 size={16} />
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;