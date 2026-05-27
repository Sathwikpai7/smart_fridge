import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Package, Clock, Wifi, WifiOff, Thermometer, Droplets, Waves, Ruler } from 'lucide-react';
import { FoodItem, SensorData } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import CategoryCard from '../components/CategoryCard';
import { getExpiryStatus } from '../utils/dateUtils';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useFoodItems();

  const [sensorData, setSensorData] = useState<(SensorData & { isRealData: boolean }) | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ✅ WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000'); // 🔥 change to IP if needed
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setSensorData({
          temperature: parseFloat(data.temperature),
          humidity: parseFloat(data.humidity),
          methaneLevel: parseFloat(data.methane_level),
          ultrasonicDistance: parseFloat(data.ultrasonic_value),
          timestamp: new Date().toISOString(),
          isRealData: true
        });

      } catch (err) {
        console.error("❌ Error parsing data:", err);
      }
    };

    ws.onerror = () => {
      console.log("❌ WebSocket error");
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Food stats
  const categorizedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const expiringItems = items.filter(item => {
    const status = getExpiryStatus(item.expiryDate, item.category);
    return status.status === 'critical' || status.status === 'warning';
  });

  const expiredItems = items.filter(item => {
    const status = getExpiryStatus(item.expiryDate, item.category);
    return status.status === 'expired';
  });

  const stats = [
    { title: 'Total Items', value: items.length, icon: Package, color: 'blue' },
    { title: 'Expiring Soon', value: expiringItems.length, icon: Clock, color: 'yellow' },
    { title: 'Expired', value: expiredItems.length, icon: AlertTriangle, color: 'red' },
    { title: 'Fresh Items', value: items.length - expiringItems.length - expiredItems.length, icon: TrendingUp, color: 'green' }
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Fridge Dashboard</h1>
        <p className="text-gray-600">Live monitoring using WebSocket</p>
      </div>

      {/* Connection Status */}
      <div className="flex justify-center">
        {connected ? (
          <div className="flex items-center text-green-600">
            <Wifi className="mr-2" /> Connected (Live)
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <WifiOff className="mr-2" /> Disconnected
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow">
              <Icon className="mb-2" />
              <h3 className="text-lg">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Sensor Data */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Live Sensor Data</h2>

        {!sensorData ? (
          <p className="text-gray-500">Waiting for ESP32 data...</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <Thermometer />
              <p>{sensorData.temperature.toFixed(1)}°C</p>
              <p>Temperature</p>
            </div>

            <div className="text-center">
              <Droplets />
              <p>{sensorData.humidity.toFixed(1)}%</p>
              <p>Humidity</p>
            </div>

            <div className="text-center">
              <Waves />
              <p>{sensorData.methaneLevel.toFixed(1)} ppm</p>
              <p>Methane</p>
            </div>

            <div className="text-center">
              <Ruler />
              <p>{sensorData.ultrasonicDistance.toFixed(1)} cm</p>
              <p>Distance</p>
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Food Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(categorizedItems).map(([category, items]) => (
            <CategoryCard
              key={category}
              category={category}
              items={items}
              onClick={() => navigate(`/inventory?category=${category}`)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;