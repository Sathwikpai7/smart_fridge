import React, { useState, useEffect } from 'react';
import { sendMethaneAlert, getUserEmail, getMethaneAlertLevel, getMethaneAlertStyles } from '../utils/methaneAlertUtils';
import { toast } from 'react-toastify';

const MethaneAlertTest: React.FC = () => {
  const [testLevel, setTestLevel] = useState(4500);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await getUserEmail();
      setUserEmail(email);
    };
    fetchEmail();
  }, []);

  const testMethaneAlert = async () => {
    setIsLoading(true);
    
    if (!userEmail) {
      toast.error('No email configured. Please set up email in Settings first.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await sendMethaneAlert(testLevel, userEmail);
      if (success) {
        toast.success(`Test methane alert sent to ${userEmail} with level ${testLevel}ppm`);
      } else {
        toast.error('Failed to send test methane alert');
      }
    } catch (error) {
      toast.error('Error sending test methane alert');
      console.error('Test methane alert error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const alertLevel = getMethaneAlertLevel(testLevel);
  const styles = getMethaneAlertStyles(alertLevel);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Methane Alert Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Methane Level (ppm)
          </label>
          <input
            type="number"
            value={testLevel}
            onChange={(e) => setTestLevel(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="10000"
          />
        </div>

        <div className={`p-4 rounded-lg ${styles.container}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${styles.text}`}>
              {testLevel} ppm
            </div>
            <div className="text-sm text-gray-600">Methane Level</div>
            <div className={`text-sm font-bold mt-1 ${styles.text}`}>
              {alertLevel.toUpperCase()} - {styles.alertText}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <strong>Alert Levels:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><span className="text-green-600">Normal:</span> 0-2000 ppm</li>
            <li><span className="text-yellow-600">Warning:</span> 2001-4000 ppm</li>
            <li><span className="text-red-600">Danger:</span> 4001+ ppm (triggers email alert)</li>
          </ul>
        </div>

        <button
          onClick={testMethaneAlert}
          disabled={isLoading || !userEmail}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending Test Alert...' : 'Send Test Methane Alert'}
        </button>

        {!userEmail && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            ⚠️ No email configured. Please set up your email address in Settings to test alerts.
          </div>
        )}
      </div>
    </div>
  );
};

export default MethaneAlertTest; 