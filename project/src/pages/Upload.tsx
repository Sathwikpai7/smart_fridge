import React, { useState } from 'react';
import { Upload as UploadIcon, Image, Check, X } from 'lucide-react';
import { FoodItem } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import { extractTextFromImage, extractExpiryDate } from '../utils/ocrUtils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Upload: React.FC = () => {
  const { addItem, deleteAllItems } = useFoodItems();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingResults, setProcessingResults] = useState<Array<{
    file: File;
    text: string;
    expiryDate: string | null;
    item: Partial<FoodItem>;
    processed: boolean;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Initialize processing results
    const results = files.map(file => ({
      file,
      text: '',
      expiryDate: null,
      item: {
        name: '',
        category: 'other' as FoodItem['category'],
        quantity: 1,
        unit: 'piece',
        location: 'fridge'
      },
      processed: false
    }));
    
    setProcessingResults(results);
  };

  const processAllImages = async () => {
    setIsProcessing(true);
    
    const updatedResults = [...processingResults];
    
    for (let i = 0; i < updatedResults.length; i++) {
      try {
        const text = await extractTextFromImage(updatedResults[i].file);
        const expiryDate = extractExpiryDate(text);
        
        updatedResults[i] = {
          ...updatedResults[i],
          text,
          expiryDate,
          item: {
            ...updatedResults[i].item,
            expiryDate: expiryDate || ''
          },
          processed: true
        };
        
        // Update state incrementally to show progress
        setProcessingResults([...updatedResults]);
      } catch (error) {
        console.error(`Error processing ${updatedResults[i].file.name}:`, error);
        updatedResults[i] = {
          ...updatedResults[i],
          processed: true
        };
        setProcessingResults([...updatedResults]);
      }
    }
    
    setIsProcessing(false);
  };

  const updateItem = (index: number, updates: Partial<FoodItem>) => {
    const updatedResults = [...processingResults];
    updatedResults[index].item = { ...updatedResults[index].item, ...updates };
    setProcessingResults(updatedResults);
  };

  const clearInventory = async () => {
    try {
      await deleteAllItems();
      toast.info('Inventory cleared!');
    } catch (error) {
      toast.error('Failed to clear inventory');
      console.error('Error clearing inventory:', error);
    }
  };

  const saveItem = async (index: number) => {
    const result = processingResults[index];
    
    if (!result.item.name || !result.item.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: any = {
      name: result.item.name,
      category: result.item.category as FoodItem['category'],
      expiryDate: result.item.expiryDate,
      quantity: result.item.quantity || 1,
      unit: result.item.unit || 'piece',
      addedDate: new Date().toISOString(),
      location: result.item.location,
      image: URL.createObjectURL(result.file)
    };

    try {
      await addItem(item);
      setProcessingResults(prev => prev.filter((_, i) => i !== index));
      toast.success('Item saved successfully!');
    } catch (error) {
      toast.error('Failed to save item');
      console.error('Error saving item:', error);
    }
  };

  const removeFile = (index: number) => {
    setProcessingResults(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="flex justify-end mb-2">
        <button onClick={clearInventory} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Clear Inventory</button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Food Photos</h1>
        <p className="text-gray-600">Upload photos of food packages to extract expiry dates</p>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
          <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h3>
          <p className="text-gray-600 mb-4">Select multiple photos of food packages</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-flex items-center"
          >
            <Image className="h-5 w-5 mr-2" />
            Choose Photos
          </label>
        </div>

        {selectedFiles.length > 0 && !isProcessing && (
          <div className="mt-6 text-center">
            <button
              onClick={processAllImages}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Process All Images ({selectedFiles.length})
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Processing images...</p>
          </div>
        )}
      </div>

      {/* Processing Results */}
      {processingResults.length > 0 && (
        <div className="space-y-6">
          {processingResults.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">
                  {result.file.name}
                  {result.processed && (
                    <span className="ml-2 text-sm text-green-600">✓ Processed</span>
                  )}
                </h3>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={URL.createObjectURL(result.file)}
                    alt="Uploaded"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  {result.text && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Extracted Text:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                        {result.text}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={result.item.name || ''}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Milk, Bread, Yogurt"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={result.item.category || 'other'}
                      onChange={(e) => updateItem(index, { category: e.target.value as FoodItem['category'] })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                      {result.expiryDate && (
                        <span className="text-green-600 text-sm ml-2">
                          (Auto-detected: {result.expiryDate})
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={result.item.expiryDate || ''}
                      onChange={(e) => updateItem(index, { expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={result.item.quantity || 1}
                        onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={result.item.unit || 'piece'}
                        onChange={(e) => updateItem(index, { unit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={result.item.location || ''}
                      onChange={(e) => updateItem(index, { location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fridge, Pantry, Freezer"
                    />
                  </div>

                  <button
                    onClick={() => saveItem(index)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Save Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upload;