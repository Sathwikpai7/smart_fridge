import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Handle null, undefined string, or empty values
      if (item === null || item === '"undefined"' || item === 'undefined' || item === '') {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          if (event.newValue === null || event.newValue === '"undefined"' || event.newValue === 'undefined' || event.newValue === '') {
            setStoredValue(initialValue);
          } else {
            setStoredValue(JSON.parse(event.newValue));
          }
        } catch (error) {
          setStoredValue(initialValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  // Listen for changes to localStorage in the same tab
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const item = window.localStorage.getItem(key);
        if (item === null || item === '"undefined"' || item === 'undefined' || item === '') {
          if (storedValue !== initialValue) setStoredValue(initialValue);
        } else {
          const parsed = JSON.parse(item);
          if (JSON.stringify(parsed) !== JSON.stringify(storedValue)) {
            setStoredValue(parsed);
          }
        }
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, [key, initialValue, storedValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      return newValue;
    });
  };

  return [storedValue, setValue];
}