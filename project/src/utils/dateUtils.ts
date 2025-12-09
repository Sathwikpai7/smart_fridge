import { differenceInDays, differenceInHours, isAfter, parseISO, format } from 'date-fns';

export const getDaysUntilExpiry = (expiryDate: string): number => {
  return differenceInDays(parseISO(expiryDate), new Date());
};

export const getHoursUntilExpiry = (expiryDate: string): number => {
  return differenceInHours(parseISO(expiryDate), new Date());
};

export const isExpired = (expiryDate: string): boolean => {
  return isAfter(new Date(), parseISO(expiryDate));
};

export const formatExpiryDate = (expiryDate: string): string => {
  return format(parseISO(expiryDate), 'MMM dd, yyyy');
};

export const getExpiryStatus = (expiryDate: string, category: string) => {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  const hoursUntil = getHoursUntilExpiry(expiryDate);
  
  if (daysUntil < 0) return { status: 'expired', color: 'red' };
  
  switch (category) {
    case 'dairy':
      if (hoursUntil <= 24) return { status: 'critical', color: 'red' };
      if (daysUntil <= 3) return { status: 'warning', color: 'yellow' };
      return { status: 'good', color: 'green' };
    
    case 'vegetables':
      if (daysUntil <= 3) return { status: 'critical', color: 'red' };
      if (daysUntil <= 7) return { status: 'warning', color: 'yellow' };
      return { status: 'good', color: 'green' };
    
    case 'snacks':
      if (daysUntil <= 7) return { status: 'critical', color: 'red' };
      if (daysUntil <= 14) return { status: 'warning', color: 'yellow' };
      return { status: 'good', color: 'green' };
    
    case 'medicine':
      if (daysUntil <= 7) return { status: 'critical', color: 'red' };
      if (daysUntil <= 30) return { status: 'warning', color: 'yellow' };
      return { status: 'good', color: 'green' };
    
    default:
      if (daysUntil <= 3) return { status: 'critical', color: 'red' };
      if (daysUntil <= 7) return { status: 'warning', color: 'yellow' };
      return { status: 'good', color: 'green' };
  }
};