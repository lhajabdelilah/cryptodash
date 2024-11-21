import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, MoreVertical, Share2, Star } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceChange, setPriceChange] = useState(0);

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets');
      const data = await response.json();
      setCryptoData(data.data);

      const bitcoinResponse = await fetch('https://api.coincap.io/v2/assets/bitcoin');
      const bitcoinData = await bitcoinResponse.json();
      const newPrice = parseFloat(bitcoinData.data.priceUsd);

      // Calculate price change
      if (priceHistory.length > 0) {
        const lastPrice = priceHistory[priceHistory.length - 1].price;
        const change = ((newPrice - lastPrice) / lastPrice) * 100;
        setPriceChange(change);
      }

      const timestamp = new Date().toLocaleTimeString();
      setPriceHistory((prev) => {
        // Keep only the last 50 entries to prevent memory issues
        const updatedHistory = [...prev, { time: timestamp, price: newPrice }];
        return updatedHistory.slice(-50);
      });

      setBitcoinPrice(newPrice);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  }, [priceHistory]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 3000); // Fetch every 3 seconds for more real-time updates
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6, // Increased decimal places for more precision
      notation: 'standard', // Changed from 'compact' to show full precision
    }).format(value);
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(4)}%` : 'N/A';
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

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Improved Y-axis range calculation with more sensitivity
  const minPrice = Math.min(...priceHistory.map((entry) => entry.price)) * 0.9999; // Minimal padding
  const maxPrice = Math.max(...priceHistory.map((entry) => entry.price)) * 1.0001;

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
                      <span 
                        className={`d-flex align-items-center ${
                          priceChange >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {priceChange >= 0 ? <TrendingUp className="me-1" size={20} /> : <TrendingDown className="me-1" size={20} />}
                        {formatPercentage(priceChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* ... (reste du code inchangé) ... */}
            </div>

            {/* Graphique avec configurations améliorées */}
            <div className="card bg-secondary mb-4">
              <div className="card-body" style={{ height: '500px' }}> {/* Augmenté la hauteur */}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0dcaf0" stopOpacity={0.3} /> {/* Augmenté l'opacité */}
                        <stop offset="95%" stopColor="#0dcaf0" stopOpacity={0} />
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
                      domain={[minPrice, maxPrice]} // Plage dynamique très sensible
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#0dcaf0"
                      strokeWidth={3} // Épaisseur du trait augmentée
                      dot={false}
                      activeDot={{ r: 6 }} // Taille du point actif
                      fill="url(#colorPrice)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ... (reste du code inchangé) ... */}
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
                          <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                            style={{ width: '40px', height: '40px' }}
                          >
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
                        <div
                          className={`d-flex align-items-center ${
                            crypto.changePercent24Hr >= 0
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
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