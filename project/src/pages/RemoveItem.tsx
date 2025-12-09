import React, { useState, useEffect, useRef } from 'react';
import { useFoodItems } from '../hooks/useAPI';
import { FoodItem } from '../types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// RemoveItem.tsx
// Instructions:
// 1. Select an item from your inventory.
// 2. When the ultrasonic sensor value (from ws://localhost:3000) drops below 15, the quantity of the selected item will decrease by 1.
// 3. This simulates removing an item from your fridge.
//
// To use your mobile phone as a webcam:
// - Use an app like DroidCam (Android/iOS) or Iriun Webcam.
// - Connect your phone and computer to the same WiFi network.
// - Start the webcam app on your phone and the client on your computer.
// - In your browser, select the mobile webcam as the video source when prompted.

const RemoveItem: React.FC = () => {
  const { items, updateItem, refetch } = useFoodItems();
  const [selectedId, setSelectedId] = useState<string>('');
  const [ultrasonic, setUltrasonic] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [removalTriggered, setRemovalTriggered] = useState(false);

  // Subscribe to ultrasonic sensor via websocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let shouldReconnect = true;
    const connect = () => {
      ws = new window.WebSocket('ws://localhost:3000');
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.ultrasonic_value) {
            setUltrasonic(parseFloat(data.ultrasonic_value));
          }
        } catch {}
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

  // Remove item if ultrasonic < 15
  useEffect(() => {
    if (!selectedId || ultrasonic === null) return;
    if (ultrasonic < 15 && !removalTriggered) {
      setRemovalTriggered(true);
      const item = items.find((i: any) => (i._id || i.id) === selectedId);
      if (item && item.quantity > 0) {
        const { id, _id, ...itemData } = item;
        updateItem(item._id || item.id, { ...itemData, quantity: item.quantity - 1 })
          .then(() => {
            toast.success('Item removed (quantity -1)');
            refetch();
          })
          .catch((error) => {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
          });
      }
    } else if (ultrasonic >= 15 && removalTriggered) {
      setRemovalTriggered(false);
    }
  }, [ultrasonic, selectedId, items, updateItem, refetch, removalTriggered]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Remove Item</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select an item --</option>
          {items.map((item: any) => (
            <option key={item._id || item.id} value={item._id || item.id}>
              {item.name} (Qty: {item.quantity})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Ultrasonic Sensor Value</label>
        <div className="text-2xl font-bold text-purple-700">
          {ultrasonic !== null ? `${ultrasonic.toFixed(2)} cm` : 'Waiting for data...'}
        </div>
        <div className="text-xs text-gray-500">(If value drops below 15, quantity will decrease by 1)</div>
      </div>
      {selectedId && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Selected Item Details</h2>
          {(() => {
            const item = items.find((i: any) => (i._id || i.id) === selectedId);
            if (!item) return <div>Item not found.</div>;
            return (
              <ul className="text-sm text-gray-700 space-y-1">
                <li><b>Name:</b> {item.name}</li>
                <li><b>Category:</b> {item.category}</li>
                <li><b>Quantity:</b> {item.quantity}</li>
                <li><b>Expiry:</b> {item.expiryDate}</li>
              </ul>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RemoveItem; 