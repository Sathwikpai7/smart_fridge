import React, { useState } from 'react';
import { Save, Mail, Bell, Thermometer, Droplets, AlertTriangle, Waves } from 'lucide-react';
import { NotificationSettings } from '../types';
import { useSettings } from '../hooks/useAPI';

const Settings: React.FC = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your notification preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={localSettings.email || ''}
                onChange={(e) => updateSetting('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Receive notifications when items are about to expire
              </p>
            </div>
          </div>
        </div>

        {/* Sensor Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Sensor Alerts</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Enable Sensor Alerts</h3>
                <p className="text-sm text-gray-500">Get notified of sensor anomalies</p>
              </div>
              <button
                onClick={() => updateSetting('enableSensorAlerts', !settings.enableSensorAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.enableSensorAlerts ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full background-white transition-transform ${
                    localSettings.enableSensorAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Alert Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Expiry Alert Timing</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dairy Products
            </label>
            <div className="relative">
              <input
                type="number"
                value={localSettings.dairyAlert || 24}
                onChange={(e) => updateSetting('dairyAlert', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="168"
              />
              <span className="absolute right-3 top-2 text-sm text-gray-500">hours</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert before expiry</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vegetables
            </label>
            <div className="relative">
              <input
                type="number"
                value={localSettings.vegetableAlert || 3}
                onChange={(e) => updateSetting('vegetableAlert', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="30"
              />
              <span className="absolute right-3 top-2 text-sm text-gray-500">days</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert before expiry</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Snacks
            </label>
            <div className="relative">
              <input
                type="number"
                value={localSettings.snackAlert || 7}
                onChange={(e) => updateSetting('snackAlert', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="30"
              />
              <span className="absolute right-3 top-2 text-sm text-gray-500">days</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert before expiry</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine
            </label>
            <div className="relative">
              <input
                type="number"
                value={localSettings.medicineAlert || 7}
                onChange={(e) => updateSetting('medicineAlert', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="90"
              />
              <span className="absolute right-3 top-2 text-sm text-gray-500">days</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert before expiry</p>
          </div>
        </div>
      </div>

      {/* Sensor Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Thermometer className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Sensor Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">ESP32 Connection</h3>
            <p className="text-sm text-gray-600 mb-3">
              Current sensor IP: <code className="bg-white px-2 py-1 rounded">192.168.208.95</code>
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Temperature Sensor</h4>
                <Thermometer className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">DHT11 - Temperature monitoring</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Humidity Sensor</h4>
                <Droplets className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">DHT11 - Humidity monitoring</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Gas Sensor</h4>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">MQ-4 - Methane detection</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Ultrasonic Sensor</h4>
                <Waves className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">HC-SR04 - Distance measurement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center disabled:opacity-50"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;