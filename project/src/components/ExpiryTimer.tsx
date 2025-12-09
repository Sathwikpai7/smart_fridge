import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getDaysUntilExpiry, getHoursUntilExpiry, getExpiryStatus } from '../utils/dateUtils';

interface ExpiryTimerProps {
  expiryDate: string;
  category: string;
  showIcon?: boolean;
}

const ExpiryTimer: React.FC<ExpiryTimerProps> = ({ expiryDate, category, showIcon = true }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [status, setStatus] = useState<{ status: string; color: string }>({ status: 'good', color: 'green' });

  useEffect(() => {
    const updateTimer = () => {
      const days = getDaysUntilExpiry(expiryDate);
      const hours = getHoursUntilExpiry(expiryDate);
      const statusInfo = getExpiryStatus(expiryDate, category);
      
      setStatus(statusInfo);

      if (days < 0) {
        setTimeRemaining('Expired');
      } else if (days === 0) {
        if (hours <= 0) {
          setTimeRemaining('Expires today');
        } else {
          setTimeRemaining(`${hours}h remaining`);
        }
      } else if (days === 1) {
        setTimeRemaining('Tomorrow');
      } else {
        setTimeRemaining(`${days} days`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate, category]);

  const getStatusIcon = () => {
    switch (status.status) {
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.color) {
      case 'red':
        return 'text-red-600 bg-red-50';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {showIcon && getStatusIcon()}
      <span className={showIcon ? 'ml-1' : ''}>{timeRemaining}</span>
    </div>
  );
};

export default ExpiryTimer;