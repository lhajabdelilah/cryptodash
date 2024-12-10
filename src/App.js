import React, { useState, useEffect } from 'react';
import './App.css'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock, 
  BarChart2, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { FaSun, FaMoon, FaBitcoin, FaChartLine } from 'react-icons/fa';
import { GiCrystalBall } from 'react-icons/gi';
import { RiExchangeDollarLine } from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from "socket.io-client";

// Placeholder for BitcoinKpiChart (since original wasn't provided)
const BitcoinKpiChart = () => {
  return (
    <div className="container-fluid mb-4">
      <h3>Bitcoin KPI Chart Placeholder</h3>
      <p>KPI Chart content would be rendered here</p>
    </div>
  );
};

const CryptoDashboard = () => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [chatPredicts, setChatPredicts] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoin, setBitcoin] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('m1');
  const [priceHistory, setPriceHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [yAxisDomain, setYAxisDomain] = useState([0, 100000]);
  const [xAxisDomain, setXAxisDomain] = useState([0, 10]);

  const SOCKET_URL = "http://localhost:5000";

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("update_price", (data) => {
      setPredictedPrice(data.predicted_price);
      
      // Add new chat prediction to the list, keeping only the last 5
      if (data.chat_prediction) {
        setChatPredicts(prev => {
          const updated = [
            { 
              id: Date.now(), 
              message: data.chat_prediction, 
              timestamp: new Date().toLocaleString() 
            },
            ...prev
          ];
          return updated.slice(0, 5); // Keep only the 5 most recent predictions
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCryptoData = async () => {
    try {
      const cryptoResponse = await fetch('https://api.coincap.io/v2/assets');
      const cryptoJson = await cryptoResponse.json();
      setCryptoData(cryptoJson.data);

      const bitcoinResponse = await fetch('https://api.coincap.io/v2/assets/bitcoin');
      const bitcoinJson = await bitcoinResponse.json();
      setBitcoin(bitcoinJson.data);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const url = `https://api.coincap.io/v2/assets/bitcoin/history?interval=${selectedTimeframe}`;
      const response = await fetch(url);
      const data = await response.json();

      const formattedData = data.data.map((point) => ({
        time: new Date(point.time).toLocaleDateString() + ' ' + new Date(point.time).toLocaleTimeString(),
        price: parseFloat(point.priceUsd),
        predicted_price: predictedPrice || null,
      }));
      setPriceHistory(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching price history:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [selectedTimeframe, predictedPrice]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const zoomIn = () => {
    setYAxisDomain([yAxisDomain[0], yAxisDomain[1] * 0.8]);
  };

  const zoomOut = () => {
    setYAxisDomain([yAxisDomain[0], yAxisDomain[1] * 1.2]);
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);

  const formatPercentage = (value) => {
    if (isNaN(value)) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const timeframeButtons = [
    { label: '1h', value: 'm1', icon: <Clock size={16} /> },
    { label: '24h', value: 'm15', icon: <Activity size={16} /> },
    { label: '7d', value: 'h1', icon: <BarChart2 size={16} /> },
    { label: '30d', value: 'd1', icon: <FaChartLine size={16} /> },
    { label: '1y', value: 'd1', icon: <TrendingUp size={16} /> },
  ];

  if (loading) {
    return (
      <div className={`d-flex align-items-center justify-content-center vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className={`spinner-border ${isDarkMode ? 'text-light' : 'text-dark'}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'} min-vh-100`}>
      <div className="container-fluid">
        <div className="row">
          {/* Main Content Column */}
          <div className="col-lg-9 col-md-8">
            <div className="container py-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className={`${isDarkMode ? 'text-info' : 'text-primary'} d-flex align-items-center`}>
                  <FaBitcoin className="me-2" /> Crypto Dashboard
                </h1>
                <div className="d-flex align-items-center">
                  <button
                    className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} me-2`}
                    onClick={toggleTheme}
                    title="Toggle Theme"
                  >
                    {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                  </button>
                  <button
                    className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                    onClick={fetchCryptoData}
                    title="Refresh Data"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              <div className="row g-4 mb-5">
                {[
                  { 
                    title: 'Bitcoin Price', 
                    value: bitcoin.priceUsd, 
                    icon: <DollarSign size={24} />,
                    color: 'info'
                  },
                  { 
                    title: '24h Change', 
                    value: formatPercentage(parseFloat(bitcoin.changePercent24Hr)),
                    icon: bitcoin.changePercent24Hr >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />,
                    color: bitcoin.changePercent24Hr >= 0 ? 'success' : 'danger'
                  },
                  { 
                    title: 'Market Cap', 
                    value: formatNumber(bitcoin.marketCapUsd),
                    icon: <RiExchangeDollarLine size={24} />,
                    color: 'info'
                  },
                  { 
                    title: 'Volume 24h', 
                    value: formatNumber(bitcoin.volumeUsd24Hr),
                    icon: <BarChart2 size={24} />,
                    color: 'info'
                  },
                  { 
                    title: 'Predicted Price', 
                    value: typeof predictedPrice === 'number' ? `${predictedPrice.toFixed(2)} USD` : 'Loading',
                    icon: <GiCrystalBall size={24} />,
                    color: 'warning'
                  }
                ].map((stat, index) => (
                  <div key={index} className="col-lg-4 col-md-6">
                    <div className={`card bg-${isDarkMode ? 'secondary' : 'light'} shadow-sm h-100`}>
                      <div className="card-body d-flex align-items-center">
                        <div className={`bg-${stat.color} text-white rounded-circle p-3 me-3`}>
                          {stat.icon}
                        </div>
                        <div>
                          <h6 className="card-subtitle mb-2 text-muted">{stat.title}</h6>
                          <h4 className={`text-${stat.color}`}>{stat.value}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <BitcoinKpiChart />

              <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="btn-group">
                    {timeframeButtons.map(({ label, value, icon }) => (
                      <button
                        key={value}
                        className={`btn d-flex align-items-center ${selectedTimeframe === value ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setSelectedTimeframe(value)}
                      >
                        {icon} <span className="ms-2">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="zoom-controls">
                    <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} me-2`} onClick={zoomIn}>Zoom In</button>
                    <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={zoomOut}>Zoom Out</button>
                  </div>
                </div>

                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#ddd'} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fill: isDarkMode ? '#fff' : '#000' }} 
                      />
                      <YAxis 
                        tick={{ fill: isDarkMode ? '#fff' : '#000' }} 
                        domain={yAxisDomain} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#333' : '#fff', 
                          color: isDarkMode ? '#fff' : '#000' 
                        }} 
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#0dcaf0"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted_price"
                        stroke="#ff6347"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className={`rounded p-4 ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                <h4 className={`mb-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Top Cryptocurrencies</h4>
                <div className="table-responsive">
                  <table className={`table ${isDarkMode ? 'table-dark' : 'table-light'} table-hover`}>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Asset</th>
                        <th scope="col">Price</th>
                        <th scope="col">24h Change</th>
                        <th scope="col">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cryptoData.slice(0, 10).map((crypto, index) => (
                        <tr key={crypto.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div>
                              <strong>{crypto.name}</strong> <small>({crypto.symbol})</small>
                            </div>
                          </td>
                          <td>{formatNumber(crypto.priceUsd)}</td>
                          <td className={crypto.changePercent24Hr >= 0 ? 'text-success' : 'text-danger'}>
                            {formatPercentage(parseFloat(crypto.changePercent24Hr))}
                          </td>
                          <td>{formatNumber(crypto.marketCapUsd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Predictions Sidebar */}
          <div
  className={`col-lg-3 col-md-4 p-4 ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}
  style={{ maxHeight: '100vh', overflowY: 'auto' }}
>
  <h5 className={`mb-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
    <GiCrystalBall className="me-2" /> AI Price Predictions
  </h5>
  {chatPredicts.length === 0 ? (
    <div className={`alert ${isDarkMode ? 'alert-secondary' : 'alert-light'}`}>
      No predictions yet
    </div>
  ) : (
    <ul className={`list-group ${isDarkMode ? 'list-group-dark' : ''}`}>
      {chatPredicts.slice(-5).map((prediction) => ( // Limit to 5 most recent predictions
        <li
          key={prediction.id}
          className={`list-group-item ${isDarkMode ? 'bg-dark text-light' : 'bg-white text-dark'}`}
        >
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{prediction.timestamp}</small>
            <GiCrystalBall className={`${isDarkMode ? 'text-info' : 'text-primary'}`} />
          </div>
          <p className="mb-0">{prediction.message}</p>
        </li>
      ))}
    </ul>
  )}
</div>

        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;
