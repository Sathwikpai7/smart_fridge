import { SensorData } from '../types';

// Configuration for ESP32 connection
const ESP32_CONFIG = {
  // You can change this IP address to match your ESP32's actual IP
  // Check your router's connected devices or ESP32 serial monitor for the correct IP
  baseUrl: 'http://192.168.208.95',
  timeout: 5000, // 5 second timeout
};

// Check if ESP32 is reachable
export const checkESP32Connection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${ESP32_CONFIG.baseUrl}/ping`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const fetchSensorData = async (): Promise<SensorData & { isRealData: boolean; connectionStatus: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.timeout);
    
    const response = await fetch(`${ESP32_CONFIG.baseUrl}/sensors`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.temperature || 0,
      humidity: data.humidity || 0,
      methaneLevel: data.methane || 0,
      ultrasonicDistance: data.ultrasonic || 0,
      timestamp: new Date().toISOString(),
      isRealData: true,
      connectionStatus: 'connected',
    };
  } catch (error) {
    console.warn('ESP32 not reachable, using simulated data:', error instanceof Error ? error.message : 'Unknown error');
    
    // Determine connection status based on error type
    let connectionStatus = 'disconnected';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        connectionStatus = 'timeout';
      } else if (error.message.includes('Failed to fetch')) {
        connectionStatus = 'network_error';
      } else if (error.message.includes('HTTP')) {
        connectionStatus = 'server_error';
      }
    }
    
    // Return realistic simulated data for demonstration
    return {
      temperature: 3.5 + Math.random() * 2, // 3.5-5.5°C (good fridge temp)
      humidity: 50 + Math.random() * 15, // 50-65% (normal range)
      methaneLevel: Math.random() * 50, // 0-50 ppm (safe range)
      ultrasonicDistance: 15 + Math.random() * 30, // 15-45 cm
      timestamp: new Date().toISOString(),
      isRealData: false,
      connectionStatus,
    };
  }
};

export const sendItemRemovalNotification = async (itemId: string, distance: number): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.timeout);
    
    const response = await fetch(`${ESP32_CONFIG.baseUrl}/item-removed`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        distance,
        timestamp: new Date().toISOString(),
      }),
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Failed to send item removal notification:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Helper function to get connection status message
export const getConnectionStatusMessage = (status: string): { message: string; color: string } => {
  switch (status) {
    case 'connected':
      return { message: 'Connected to ESP32', color: 'green' };
    case 'timeout':
      return { message: 'ESP32 connection timeout', color: 'yellow' };
    case 'network_error':
      return { message: 'Network error - ESP32 not reachable', color: 'red' };
    case 'server_error':
      return { message: 'ESP32 server error', color: 'red' };
    default:
      return { message: 'ESP32 disconnected - using simulated data', color: 'yellow' };
  }
};

// Export configuration for use in settings
export const getESP32Config = () => ESP32_CONFIG;
export const updateESP32Config = (newConfig: Partial<typeof ESP32_CONFIG>) => {
  Object.assign(ESP32_CONFIG, newConfig);
};