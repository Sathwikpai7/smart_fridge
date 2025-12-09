import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Thermometer, Droplets, AlertTriangle, Waves, Ruler } from 'lucide-react';
import { SensorData } from '../types';
import { fetchSensorData, getConnectionStatusMessage } from '../utils/sensorUtils';
import { 
  getMethaneAlertLevel, 
  getMethaneAlertStyles
} from '../utils/methaneAlertUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sensors: React.FC = () => {
  const [sensorData, setSensorData] = useState<(SensorData & { isRealData: boolean; connectionStatus: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsActive, setWsActive] = useState(false);
  const [methaneAlertSent, setMethaneAlertSent] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let shouldReconnect = true;

    const connect = () => {
      ws = new window.WebSocket('ws://localhost:3000');
      wsRef.current = ws;
      ws.onopen = () => {
        // Optionally, you can send a message to the server here
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
            isRealData: true,
            connectionStatus: 'connected',
          });
          setIsLoading(false);
          setWsActive(true);
        } catch (e) {
          // Ignore invalid data
        }
      };
      ws.onerror = () => {
        // Optionally handle error
        ws?.close();
      };
      ws.onclose = () => {
        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    };
    connect();
    return () => {
      shouldReconnect = false;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Only poll if websocket has never provided data
  useEffect(() => {
    if (wsActive) return; // If websocket is providing data, skip polling forever
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
    const interval = setInterval(loadSensorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [wsActive]);

  useEffect(() => {
    if (!sensorData) return;
    
    // Methane alert threshold
    const threshold = 3000;

    // Debug log
    console.log('[Methane Alert Check] Current methane:', sensorData.methaneLevel, 'ppm | Threshold:', threshold, '| Alert sent:', methaneAlertSent);

    if (sensorData.methaneLevel > threshold && !methaneAlertSent) {
      // Create async function inside useEffect
      const sendAlert = async () => {
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
        if (userEmail) {
          const currentTime = new Date().toLocaleString();
          const emailData = {
            to: userEmail,
            subject: '🚨 Smart Fridge Alert: High Methane Detected',
            text: `Dear User,\n\nYour Smart Fridge has detected a high methane level of ${sensorData.methaneLevel.toFixed(1)} ppm, which exceeds the safe threshold of ${threshold} ppm.\n\nRecommended actions:\n- Check for spoiled or rotting food items.\n- Remove any expired products.\n- Clean your refrigerator thoroughly.\n- Ensure proper ventilation.\n\nStaying proactive helps keep your food safe and your fridge healthy!\n\nBest regards,\nYour Smart Fridge System\nTime Detected: ${currentTime}`
          };
          console.log('[Methane Alert] Sending email to:', userEmail, emailData);
          fetch('http://localhost:4000/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
          })
          .then(response => {
            if (response.ok) {
              toast.error('🚨 Methane Alert: Email notification sent!');
              console.log('[Methane Alert] Email sent successfully to:', userEmail);
            } else {
              toast.error('Failed to send methane alert email');
              console.error('[Methane Alert] Failed to send email');
            }
          })
          .catch(error => {
            toast.error('Error sending methane alert email');
            console.error('[Methane Alert] Error sending email:', error);
          });
          setMethaneAlertSent(true);
        } else {
          toast.error('No email configured. Please set up email in Settings.');
          console.error('[Methane Alert] No email configured.');
        }
      };
      
      sendAlert();
    } else if (sensorData.methaneLevel <= threshold && methaneAlertSent) {
      setMethaneAlertSent(false);
      toast.success('Methane levels have returned to normal');
      console.log('[Methane Alert] Methane back to normal, alert reset.');
    }
  }, [sensorData, methaneAlertSent]);

  const connectionStatus = sensorData ? getConnectionStatusMessage(sensorData.connectionStatus) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sensor Dashboard</h1>
        <p className="text-gray-600">Live readings from your Smart Fridge sensors</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sensor Readings</h2>
          {connectionStatus && (
            <div className="flex items-center space-x-2">
              {sensorData?.isRealData ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-yellow-600" />
              )}
              <span className={`text-sm font-medium ${
                connectionStatus.color === 'green' ? 'text-green-600' :
                connectionStatus.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {connectionStatus.message}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              <div className={`text-center p-4 rounded-lg ${
                getMethaneAlertStyles(getMethaneAlertLevel(sensorData.methaneLevel)).container
              }`}>
                <Waves className={`mx-auto h-6 w-6 mb-1 ${
                  getMethaneAlertStyles(getMethaneAlertLevel(sensorData.methaneLevel)).icon
                }`} />
                <div className={`text-2xl font-bold ${
                  getMethaneAlertStyles(getMethaneAlertLevel(sensorData.methaneLevel)).text
                }`}>
                  {sensorData.methaneLevel.toFixed(1)}ppm
                </div>
                <div className="text-sm text-gray-600">Methane Level</div>
                {getMethaneAlertLevel(sensorData.methaneLevel) === 'danger' && (
                  <div className="text-xs text-red-600 font-bold mt-1">
                    {getMethaneAlertStyles(getMethaneAlertLevel(sensorData.methaneLevel)).alertText}
                  </div>
                )}
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
            
            {/* Methane Alert Banner */}
            {getMethaneAlertLevel(sensorData.methaneLevel) === 'danger' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800">🚨 ETHANE ALERT</h3>
                    <p className="text-sm text-red-700 mb-2">
                      Methane levels are dangerously high at {sensorData.methaneLevel.toFixed(1)} ppm!
                    </p>
                    <div className="text-sm text-red-600">
                      <strong>Immediate Action Required:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Check for spoiled or rotting food items</li>
                        <li>Remove any expired products immediately</li>
                        <li>Clean the refrigerator thoroughly</li>
                        <li>Ensure proper ventilation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default Sensors;