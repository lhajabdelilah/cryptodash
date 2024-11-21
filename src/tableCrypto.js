import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import des icônes pour les modes
import 'bootstrap/dist/css/bootstrap.min.css';



const cryptoTable = () => {
  const [cryptoData, setCryptoData] = useState([]);



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
  


  return (
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
  );
};

export default cryptoTable;
