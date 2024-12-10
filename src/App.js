import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaSun, FaMoon } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from "socket.io-client";
import BitcoinKpiChart from './kpi';

const CryptoDashboard = () => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoin, setBitcoin] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('m1');
  const [priceHistory, setPriceHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const SOCKET_URL = "http://localhost:5000";

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("update_price", (data) => {
      setPredictedPrice(data.predicted_price);
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
      
      const formattedData = data.data.map((point, index) => {
        const timePoint = new Date(point.time);
        return {
          time: timePoint.toLocaleDateString() + ' ' + timePoint.toLocaleTimeString(),
          actualPrice: parseFloat(point.priceUsd),
          predictedPrice: predictedPrice ? predictedPrice : null
        };
      });
      
      setPriceHistory(formattedData);
    } catch (error) {
      console.error('Error fetching price history:', error);
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
    { label: '1h', value: 'm1' },
    { label: '24h', value: 'm15' },
    { label: '7d', value: 'h1' },
    { label: '30d', value: 'd1' },
    { label: '1y', value: 'd1' },
  ];

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
    <div className={`${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'} text-light min-vh-100`}>
      <div className="container py-5">
        <div className="mb-5">
          <h1 className="text-info mb-3">Crypto Dashboard</h1>

          <button
            className="btn btn-outline-primary"
            onClick={toggleTheme}
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>Bitcoin Price</h5>
                <h3 className="text-info">  {bitcoin.priceUsd ? bitcoin.priceUsd : 'Loading...'}</h3>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>24h Change</h5>
                <h3 className={bitcoin.changePercent24Hr >= 0 ? 'text-info' : 'text-danger'}>
                  {formatPercentage(parseFloat(bitcoin.changePercent24Hr))}
                  {bitcoin.changePercent24Hr >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </h3>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>Market Cap</h5>
                <h3 className="text-info">{formatNumber(bitcoin.marketCapUsd)}</h3>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>Volume 24h</h5>
                <h3 className="text-info">{formatNumber(bitcoin.volumeUsd24Hr)}</h3>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>Predicted Price</h5>
                <h3 className="text-info">
                  {predictedPrice !== null ? (
                    <p>{predictedPrice.toFixed(2)} USD</p>
                  ) : (
                    <p>Loading data...</p>
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <BitcoinKpiChart/>

        <div className="container-fluid py-4">
          <h1 className="mb-4">Bitcoin Price Chart</h1>
          <div className="btn-group mb-4">
            {timeframeButtons.map(({ label, value }) => (
              <button
                key={value}
                className={`btn ${
                  selectedTimeframe === value
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setSelectedTimeframe(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actualPrice"
                name="Actual Price"
                stroke="#0dcaf0"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="predictedPrice"
                name="Predicted Price"
                stroke="#dc3545"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Existing table for Top Cryptocurrencies */}
        <div className="table-responsive bg-secondary rounded p-4">
          <h4 className="text-light mb-4">Top Cryptocurrencies</h4>
          <table className="table table-dark table-hover">
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
  );
};

export default CryptoDashboard;