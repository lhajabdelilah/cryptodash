import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoin, setBitcoin] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('m1');
  const [priceHistory, setPriceHistory] = useState([]);
  const [technicalData, setTechnicalData] = useState([]);

  // Fetch crypto data and Bitcoin data
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
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  // Fetch Bitcoin price history
  const fetchPriceHistory = async () => {
    try {
      const url = `https://api.coincap.io/v2/assets/bitcoin/history?interval=${selectedTimeframe}`;
      const response = await fetch(url);
      const data = await response.json();
      const formattedData = data.data.map((point) => ({
        time: new Date(point.time).toLocaleDateString() + ' ' + new Date(point.time).toLocaleTimeString(),
        price: parseFloat(point.priceUsd),
      }));
      setPriceHistory(formattedData);
      calculateTechnicalIndicators(formattedData);
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  // Calculate Simple Moving Average (SMA)
  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, point) => sum + point.price, 0) / period;
      sma.push({ ...data[i], sma: avg });
    }
    return sma;
  };

  // Calculate Relative Strength Index (RSI)
  const calculateRSI = (data, period) => {
    const rsi = [];
    for (let i = period; i < data.length; i++) {
      const slice = data.slice(i - period, i);
      const gains = slice.filter((point, index) =>
        index > 0 ? point.price > slice[index - 1].price : false
      );
      const losses = slice.filter((point, index) =>
        index > 0 ? point.price < slice[index - 1].price : false
      );

      const avgGain = gains.length > 0 ? gains.reduce((sum, point) => sum + point.price, 0) / gains.length : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((sum, point) => sum + Math.abs(point.price), 0) / losses.length : 0;

      const rs = avgGain / (avgLoss || 1);
      rsi.push({ ...data[i], rsi: 100 - 100 / (1 + rs) });
    }
    return rsi;
  };

  // Calculate both SMA and RSI
  const calculateTechnicalIndicators = (data) => {
    const smaData = calculateSMA(data, 7); // 7-period SMA
    const rsiData = calculateRSI(data, 14); // 14-period RSI

    // Merge SMA and RSI data
    const mergedData = smaData.map((item, index) => ({
      ...item,
      rsi: rsiData[index]?.rsi || null,
    }));
    setTechnicalData(mergedData);
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [selectedTimeframe]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const timeframeButtons = [
    { label: '1h', value: 'm1' },
    { label: '24h', value: 'm15' },
    { label: '7d', value: 'h1' },
    { label: '30d', value: 'd1' },
    { label: '1y', value: 'd1' },
  ];

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
    <div className="bg-dark text-light min-vh-100">
      <div className="container py-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-info mb-3">Crypto Dashboard</h1>
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>Bitcoin Price</h5>
                <h3 className="text-info">
                  {bitcoin.priceUsd ? formatNumber(bitcoin.priceUsd) : 'Loading...'}
                </h3>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="card bg-secondary text-light p-3">
                <h5>24h Change</h5>
                <h3 className={bitcoin.changePercent24Hr >= 0 ? 'text-success' : 'text-danger'}>
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
          </div>
        </div>

        {/* Chart Controls */}
        <div className="btn-group mb-4">
          {timeframeButtons.map(({ label, value }) => (
            <button
              key={value}
              className={`btn ${
                selectedTimeframe === value ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setSelectedTimeframe(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Price Chart */}
        <h4 className="text-info">Price History</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#fff' }} />
            <YAxis tick={{ fill: '#fff' }} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#0dcaf0" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        {/* Technical Indicators Chart */}
        <h4 className="text-info mt-5">Technical Indicators</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={technicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#fff' }} />
            <YAxis tick={{ fill: '#fff' }} />
            <Tooltip />
            <Line type="monotone" dataKey="sma" stroke="#ffc107" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rsi" stroke="#dc3545" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CryptoDashboard;
