import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Package, Clock, Wifi, WifiOff, Thermometer, Droplets, Waves, Ruler } from 'lucide-react';
import { FoodItem, SensorData } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import CategoryCard from '../components/CategoryCard';
import { getExpiryStatus } from '../utils/dateUtils';
import { fetchSensorData, getConnectionStatusMessage } from '../utils/sensorUtils';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { items, loading } = useFoodItems();
  const [sensorData, setSensorData] = useState<(SensorData & { isRealData: boolean; connectionStatus: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsActive, setWsActive] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [methaneAlertSent, setMethaneAlertSent] = useState(false);

  // WebSocket connection for live sensor data
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let shouldReconnect = true;

    const connect = () => {
      ws = new window.WebSocket('ws://localhost:3000');
      wsRef.current = ws;
      ws.onopen = () => {};
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setSensorData({
            temperature: parseFloat(data.temperature),
            humidity: parseFloat(data.humidity),
            methaneLevel: parseFloat(data.methane_level),
            ultrasonicDistance: parseFloat(data.ultrasonic_value),
            timestamp: new Date().toISOString(),
            isRealData: true,
            connectionStatus: 'connected',
          });
          setIsLoading(false);
          setWsActive(true);
        } catch (e) {}
      };
      ws.onerror = () => { ws?.close(); };
      ws.onclose = () => { if (shouldReconnect) reconnectTimeout = setTimeout(connect, 3000); };
    };
    connect();
    return () => {
      shouldReconnect = false;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Polling fallback if WebSocket is not active
  useEffect(() => {
    if (wsActive) return;
    const loadSensorData = async () => {
      try {
        const data = await fetchSensorData();
        setSensorData(data);
      } catch (error) {
        console.error('Failed to load sensor data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSensorData();
    const interval = setInterval(loadSensorData, 30000);
    return () => clearInterval(interval);
  }, [wsActive]);

  const categorizedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
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
    {
      title: 'Total Items',
      value: items.length,
      icon: Package,
      color: 'blue',
      change: '+2 this week'
    },
    {
      title: 'Expiring Soon',
      value: expiringItems.length,
      icon: Clock,
      color: 'yellow',
      change: 'Within 7 days'
    },
    {
      title: 'Expired',
      value: expiredItems.length,
      icon: AlertTriangle,
      color: 'red',
      change: 'Needs attention'
    },
    {
      title: 'Fresh Items',
      value: items.length - expiringItems.length - expiredItems.length,
      icon: TrendingUp,
      color: 'green',
      change: 'Good condition'
    }
  ];

  const connectionStatus = sensorData ? getConnectionStatusMessage(sensorData.connectionStatus) : null;

  // Extracted alert logic
  const sendMethaneAlertEmail = async (auto = false) => {
    setSendingAlert(true);
    let userEmail = '';
    try {
      const settingsResponse = await fetch('http://localhost:4000/api/settings');
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        userEmail = settings.email || '';
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }
    if (!userEmail) {
      toast.error('No email configured. Please set up email in Settings.');
      setSendingAlert(false);
      return;
    }
    const currentTime = new Date().toLocaleString();
    const emailData = {
      to: userEmail,
      subject: auto
        ? '🚨 Smart Fridge Alert: High Methane Detected'
        : '🚨 Smart Fridge Alert: Manual Methane Alert',
      text: auto
        ? `Dear User,\n\nYour Smart Fridge has detected a high methane level, which exceeds the safe threshold of 3000 ppm.\n\nRecommended actions:\n- Check for spoiled or rotting food items.\n- Remove any expired products.\n- Clean your refrigerator thoroughly.\n- Ensure proper ventilation.\n\nBest regards,\nYour Smart Fridge System\nTime: ${currentTime}`
        : `Dear User,\n\nThis is a manual methane alert from your Smart Fridge.\n\nA methane alert has been triggered by the user.\n\nRecommended actions:\n- Check for spoiled or rotting food items.\n- Remove any expired products.\n- Clean your refrigerator thoroughly.\n- Ensure proper ventilation.\n\nBest regards,\nYour Smart Fridge System\nTime: ${currentTime}`
    };
    try {
      const response = await fetch('http://localhost:4000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      if (response.ok) {
        toast.success(auto ? 'Automatic methane alert email sent!' : 'Methane alert email sent!');
      } else {
        toast.error('Failed to send methane alert email');
      }
    } catch (error) {
      toast.error('Error sending methane alert email');
      console.error('Error sending methane alert email:', error);
    } finally {
      setSendingAlert(false);
    }
  };

  // Auto-trigger when methane > 3000
  useEffect(() => {
    if (sensorData?.methaneLevel > 3000 && !methaneAlertSent) {
      sendMethaneAlertEmail(true);
      setMethaneAlertSent(true);
    } else if (sensorData?.methaneLevel <= 3000 && methaneAlertSent) {
      setMethaneAlertSent(false);
    }
  }, [sensorData?.methaneLevel, methaneAlertSent]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Fridge Dashboard</h1>
        <p className="text-gray-600">Monitor your food inventory and expiry dates</p>
        <button
          onClick={() => sendMethaneAlertEmail(false)}
          disabled={sendingAlert}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {sendingAlert ? 'Sending...' : 'Send Methane Alert'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'yellow' ? 'bg-yellow-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Data */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sensor Readings</h2>
          {sensorData && (
            <div className="flex items-center space-x-2">
              {sensorData.isRealData ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-yellow-600" />
              )}
              <span className={`text-sm font-medium ${
                sensorData.isRealData ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {sensorData.isRealData ? 'Live' : 'Simulated'}
              </span>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading sensor data...</p>
          </div>
        ) : sensorData ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Thermometer className="mx-auto h-6 w-6 text-blue-600 mb-1" />
                <div className="text-2xl font-bold text-blue-600">{sensorData.temperature.toFixed(1)}°C</div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Droplets className="mx-auto h-6 w-6 text-green-600 mb-1" />
                <div className="text-2xl font-bold text-green-600">{sensorData.humidity.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Waves className="mx-auto h-6 w-6 text-yellow-600 mb-1" />
                <div className="text-2xl font-bold text-yellow-600">{sensorData.methaneLevel.toFixed(1)}ppm</div>
                <div className="text-sm text-gray-600">Methane Level</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Ruler className="mx-auto h-6 w-6 text-purple-600 mb-1" />
                <div className="text-2xl font-bold text-purple-600">{sensorData.ultrasonicDistance.toFixed(1)}cm</div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              Last updated: {new Date(sensorData.timestamp).toLocaleString()}
            </div>
            {!sensorData.isRealData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Using Simulated Data</p>
                    <p className="text-xs text-yellow-700">
                      ESP32 device not connected. Check network connection and device status.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <WifiOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Unable to load sensor data</p>
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Food Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(categorizedItems).map(([category, categoryItems]) => (
            <CategoryCard
              key={category}
              category={category}
              items={categoryItems}
              onClick={() => navigate(`/inventory?category=${category}`)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/scan')}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200"
          >
            <h3 className="font-semibold">Scan Item</h3>
            <p className="text-sm opacity-90">Use camera to scan expiry dates</p>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200"
          >
            <h3 className="font-semibold">Upload Photo</h3>
            <p className="text-sm opacity-90">Extract dates from photos</p>
          </button>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200"
          >
            <h3 className="font-semibold">Find Recipes</h3>
            <p className="text-sm opacity-90">Cook with available ingredients</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;