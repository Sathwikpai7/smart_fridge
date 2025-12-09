import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

// Generic hook for API data management
export function useAPI<T>(endpoint: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    try {
      setError(null);
      const updatedData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(data) 
        : newData;
      
      setData(updatedData);
      
      // If it's an array, we need to handle it differently
      if (Array.isArray(updatedData)) {
        // For arrays, we'll sync all items
        // This is handled by individual CRUD operations
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('API update error:', err);
    }
  }, [data]);

  return { data, loading, error, refetch: fetchData, updateData };
}

// Hook for Food Items
export function useFoodItems() {
  const { data, loading, error, refetch, updateData } = useAPI<any[]>('/food-items', []);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setItems(data);
    } else {
      setItems([]);
    }
  }, [data]);

  const addItem = async (item: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to add item');
      await refetch();
    } catch (err) {
      console.error('Error adding item:', err);
      throw err;
    }
  };

  const updateItem = async (id: string, item: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to update item');
      await refetch();
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await refetch();
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  };

  const deleteAllItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete all items');
      await refetch();
    } catch (err) {
      console.error('Error deleting all items:', err);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    deleteAllItems,
    refetch
  };
}

// Hook for Medicines
export function useMedicines() {
  const { data, loading, error, refetch, updateData } = useAPI<any[]>('/medicines', []);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setMedicines(data);
    }
  }, [data]);

  const addMedicine = async (medicine: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      if (!response.ok) throw new Error('Failed to add medicine');
      await refetch();
    } catch (err) {
      console.error('Error adding medicine:', err);
      throw err;
    }
  };

  const updateMedicine = async (id: string, medicine: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      if (!response.ok) throw new Error('Failed to update medicine');
      await refetch();
    } catch (err) {
      console.error('Error updating medicine:', err);
      throw err;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete medicine');
      await refetch();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      throw err;
    }
  };

  return {
    medicines,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    refetch
  };
}

// Hook for Settings
export function useSettings() {
  const { data, loading, error, refetch } = useAPI<any>('/settings', {
    email: '',
    dairyAlert: 24,
    vegetableAlert: 3,
    snackAlert: 7,
    medicineAlert: 7,
    enableSensorAlerts: true
  });
  const [settings, setSettings] = useState<any>(data);

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const updateSettings = async (newSettings: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const updated = await response.json();
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch
  };
}

