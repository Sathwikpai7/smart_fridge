import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, RotateCcw, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import { extractTextFromImage, extractExpiryDate } from '../utils/ocrUtils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Scan: React.FC = () => {
  const { addItem } = useFoodItems();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: '',
    category: 'other',
    quantity: 1,
    unit: 'piece',
    location: 'fridge'
  });
  const [showForm, setShowForm] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Automatically start camera on mount
  useEffect(() => {
    let localStream: MediaStream | null = null;
    const start = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error('No camera detected on this device.');
          return;
        }
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'environment' }
          }
        });
        setStream(localStream);
        setIsScanning(true);
        setShowForm(false);
        setCapturedImage(null);
        setExtractedText('');
        setNewItem({
          name: '',
          category: 'other',
          quantity: 1,
          unit: 'piece',
          location: 'fridge'
        });
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Unable to access camera. Please check permissions.');
      }
    };
    start();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setIsScanning(false);
      setStream(null);
    };
  }, []);

  // Always attach stream to video element when both are available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    setStream(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        processImage(imageDataUrl);
        setShowForm(true);
      }
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      const text = await extractTextFromImage(file);
      setExtractedText(text);

      const expiryDate = extractExpiryDate(text);
      if (expiryDate) {
        setNewItem(prev => ({ ...prev, expiryDate }));
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedText('');
    setShowForm(false);
    setNewItem({
      name: '',
      category: 'other',
      quantity: 1,
      unit: 'piece',
      location: 'fridge'
    });
  };

  const saveItem = async () => {
    if (!newItem.name || !newItem.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: any = {
      name: newItem.name,
      category: newItem.category as FoodItem['category'],
      expiryDate: newItem.expiryDate,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'piece',
      addedDate: new Date().toISOString(),
      location: newItem.location,
      image: capturedImage || undefined
    };

    try {
      await addItem(item);
      resetCapture();
      toast.success('Item saved successfully!');
    } catch (error) {
      toast.error('Failed to save item');
      console.error('Error saving item:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Food Items</h1>
        <p className="text-gray-600">Use your camera to scan expiry dates from food packages</p>
      </div>

      {/* Camera preview and capture */}
      {isScanning && !showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="relative mb-4" style={{ minHeight: '260px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-lg bg-gray-900"
              style={{ display: 'block' }}
            />
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={captureImage}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
            >
              <CameraOff className="h-5 w-5 mr-2" />
              Stop Camera
            </button>
          </div>
        </div>
      )}

      {/* Show form after capture */}
      {showForm && capturedImage && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Captured Image</h3>
            <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-lg" />
          </div>
          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Processing image...</p>
            </div>
          )}
          {extractedText && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Extracted Text:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {extractedText}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Milk, Bread, Yogurt"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newItem.category || 'other'}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as FoodItem['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dairy">Dairy</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="meat">Meat</option>
                <option value="snacks">Snacks</option>
                <option value="grains">Grains</option>
                <option value="medicine">Medicine</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                value={newItem.expiryDate || ''}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <select
                  value={newItem.unit || 'piece'}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="piece">piece</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="pack">pack</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newItem.location || ''}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Fridge, Pantry, Freezer"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={resetCapture}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </button>
            <button
              onClick={saveItem}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Save Item
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">After saving, your item will appear in the Inventory.</div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scan;
