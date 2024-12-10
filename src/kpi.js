import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FormCheck, Button, Row, Col } from 'react-bootstrap';

const BitcoinKpiChart = () => {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKpis, setSelectedKpis] = useState({
    priceUsd: true,
    marketCapUsd: true,
    volumeUsd24Hr: true,
    supply: true,
  });

  // Fonction pour récupérer les données
  const fetchKpiData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30'
      );
      const data = await response.json();

      const formattedData = data.prices.map((point, index) => {
        const time = new Date(point[0]).toLocaleDateString();
        const priceUsd = point[1].toFixed(2);
        const marketCapUsd = data.market_caps[index] ? data.market_caps[index][1].toFixed(2) : 0;
        const volumeUsd24Hr = data.total_volumes[index] ? data.total_volumes[index][1].toFixed(2) : 0;
        const supply = data.market_caps[index] ? (data.market_caps[index][1] / priceUsd).toFixed(2) : 0;

        return {
          time,
          priceUsd,
          marketCapUsd,
          volumeUsd24Hr,
          supply,
        };
      });

      setKpiData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, []);

  // Gestion des changements dans la sélection des KPI
  const handleKpiSelection = (e) => {
    const { name, checked } = e.target;
    setSelectedKpis((prev) => ({ ...prev, [name]: checked }));
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Bitcoin KPI Variations</h3>
      <Row>
        {/* Section de sélection des KPI à gauche */}
        <Col md={4}>
          <div className="mb-4">
            <h5>Select the KPIs to display:</h5>
            <FormCheck
              type="checkbox"
              label="Price (USD)"
              name="priceUsd"
              checked={selectedKpis.priceUsd}
              onChange={handleKpiSelection}
            />
            <FormCheck
              type="checkbox"
              label="Market Cap (USD)"
              name="marketCapUsd"
              checked={selectedKpis.marketCapUsd}
              onChange={handleKpiSelection}
            />
            <FormCheck
              type="checkbox"
              label="Volume (24h USD)"
              name="volumeUsd24Hr"
              checked={selectedKpis.volumeUsd24Hr}
              onChange={handleKpiSelection}
            />
            <FormCheck
              type="checkbox"
              label="Supply"
              name="supply"
              checked={selectedKpis.supply}
              onChange={handleKpiSelection}
            />
            <Button className="mt-3" variant="primary" onClick={fetchKpiData}>
              Refresh Data
            </Button>
          </div>
        </Col>

        {/* Section du graphique à droite */}
        <Col md={8}>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: '#555' }} />
              
              {/* Axe Y pour les valeurs */}
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#555' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: '#555' }}
              />

              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />

              {/* Lignes dynamiques en fonction des KPI sélectionnés */}
              {selectedKpis.priceUsd && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="priceUsd"
                  stroke="#0dcaf0"
                  strokeWidth={3}
                  name="Price (USD)"
                />
              )}
              {selectedKpis.marketCapUsd && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="marketCapUsd"
                  stroke="#6610f2"
                  strokeWidth={3}
                  name="Market Cap (USD)"
                />
              )}
              {selectedKpis.volumeUsd24Hr && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volumeUsd24Hr"
                  stroke="#d63384"
                  strokeWidth={3}
                  name="Volume (24h USD)"
                />
              )}
              {selectedKpis.supply && (
                <Line
                  yAxisId="right"  
                  type="monotone"
                  dataKey="supply"
                  stroke="#198754"
                  strokeWidth={3}
                  name="Supply"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </div>
  );
};

export default BitcoinKpiChart;
