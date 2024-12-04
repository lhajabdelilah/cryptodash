import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import des icônes pour les modes
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from "socket.io-client";
import BitcoinKpiChart from './kpi';


const CryptoDashboard = () => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [bitcoin, setBitcoin] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('m1'); // Valeur par défaut
  const [priceHistory, setPriceHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // État pour gérer le thème
  const [yAxisDomain, setYAxisDomain] = useState([0, 100000]); // Initial range of the Y-axis (price)
  const [xAxisDomain, setXAxisDomain] = useState([0, 10]); // X-Axis range (time)

  const SOCKET_URL = "http://localhost:5000"; // L'URL de votre backend Flask
  useEffect(() => {
    // Connexion au backend Flask via Socket.IO
    const socket = io(SOCKET_URL);

    // Écouter les mises à jour du prix
    socket.on("update_price", (data) => {
      setPredictedPrice(data.predicted_price);
    });

    // Déconnexion propre lorsque le composant est démonté
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCryptoData = async () => {
    try {
      // Récupération des données des crypto-monnaies
      const cryptoResponse = await fetch('https://api.coincap.io/v2/assets');
      const cryptoJson = await cryptoResponse.json();
      setCryptoData(cryptoJson.data);

      // Récupération des informations spécifiques pour Bitcoin
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
      console.log(data); // Debugging line

      const formattedData = data.data.map((point) => ({
        time: new Date(point.time).toLocaleDateString() + ' ' + new Date(point.time).toLocaleTimeString(),
        price: parseFloat(point.priceUsd),
        predicted_price: predictedPrice || null, // Add predicted price here
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
  }, [selectedTimeframe, predictedPrice]);  // Re-fetch when timeframe or predicted price changes

  // Zoom-in handler
  const zoomIn = () => {
    setYAxisDomain([yAxisDomain[0], yAxisDomain[1] * 0.8]); // Zoom in by reducing the range (80% of the current range)
  };

  // Zoom-out handler
  const zoomOut = () => {
    setYAxisDomain([yAxisDomain[0], yAxisDomain[1] * 1.2]); // Zoom out by increasing the range (120% of the current range)
  };

  // const formatNumber = (value) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(value);
  // };

  // const formatPercentage = (value) => {
  //   return typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';
  // };

  const timeframeButtons = [
    { label: '1h', value: 'm1' },
    { label: '24h', value: 'm15' },
    { label: '7d', value: 'h1' },
    { label: '30d', value: 'd1' },
    { label: '1y', value: 'd1' }, // CoinCap API uses daily intervals for longer timeframes
  ];

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000); // Actualisation toutes les 10 secondes
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
        {/* Header avec prix actuel de Bitcoin */}
        <div className="mb-5">
          {/* <h1 className="text-info mb-3">Crypto Dashboard</h1> */}
          <h1 className="text-info">Crypto Dashboard</h1>
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
                <h5>predicted price</h5>
                <h3 className="text-info">{predictedPrice !== null ? (
                <p> {predictedPrice.toFixed(2)} USD</p>
                  ) : (
                    <p>Chargement des données...</p>
                  )}
              </h3>
              </div>
            </div>
          </div>
        </div>

 <BitcoinKpiChart/>

 <div className="container-fluid py-4">
      <h1 className="mb-4">Crypto Dashboard</h1>
      <div className="btn-group mb-4">
        {timeframeButtons.map(({ label, value }) => (
          <button
            key={value}
            className={`btn ${selectedTimeframe === value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedTimeframe(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="zoom-controls mb-4">
        <button className="btn btn-outline-primary" onClick={zoomIn}>Zoom In</button>
        <button className="btn btn-outline-primary" onClick={zoomOut}>Zoom Out</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#fff' }} />
            <YAxis tick={{ fill: '#fff' }} domain={yAxisDomain} /> {/* Use dynamic Y-axis domain */}
            <Tooltip />
            {/* Line for actual price */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0dcaf0"
              strokeWidth={2}
              dot={false}
            />
            {/* Line for predicted price */}
            <Line
              type="monotone"
              dataKey="predicted_price"
              stroke="#ff6347"  // Different color for predicted line
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
        {/* Tableau descriptif */}
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
