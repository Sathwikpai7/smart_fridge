import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { FoodItem } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import ItemCard from '../components/ItemCard';
import { getExpiryStatus } from '../utils/dateUtils';
import defaultImages from '../utils/defaultImages';

const Inventory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { items, loading, error, updateItem, deleteItem } = useFoodItems();
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'category'>('expiry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const prevItemsRef = useRef<FoodItem[]>([]);
  const notifiedItemIdsRef = useRef<string[]>([]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This useEffect must be called on every render
  useEffect(() => {
    console.log('Filter effect running. Items:', items);
    if (!Array.isArray(items)) {
      console.log('Items is not an array, setting filteredItems to []');
      setFilteredItems([]);
      return;
    }
    if (items.length === 0) {
      console.log('Items array is empty');
      setFilteredItems([]);
      return;
    }
    let filtered = [...items]; // Create a copy to avoid mutating the original
    console.log('Starting with', filtered.length, 'items');

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'expiry':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    console.log('After filtering,', filtered.length, 'items remain');
    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Send email if a new expired item is added
  useEffect(() => {
    if (!Array.isArray(items)) return;
    const prevItems = prevItemsRef.current;
    if (items.length > prevItems.length) {
      // Find the new items
      const newItems = items.filter((item: any) => !prevItems.some((prev: any) => (prev.id || prev._id) === (item.id || item._id)));
      newItems.forEach(async (item) => {
        // Only notify if not already notified
        const itemId = (item as any).id || (item as any)._id;
        if (notifiedItemIdsRef.current.includes(itemId)) return;
        const status = getExpiryStatus(item.expiryDate, item.category);
        // Get user email and alert thresholds from API
        let userEmail = '';
        let settings: any = {};
        try {
          const settingsResponse = await fetch('http://localhost:4000/api/settings');
          if (settingsResponse.ok) {
            settings = await settingsResponse.json();
            userEmail = settings.email || '';
          }
        } catch {}
        // Expiry alert thresholds (defaults)
        const thresholds = {
          dairy: settings.dairyAlert || 24, // hours
          vegetables: settings.vegetableAlert || 3, // days
          snacks: settings.snackAlert || 7, // days
          medicine: settings.medicineAlert || 7, // days
        };
        // Check for expired
        if (status.status === 'expired' && userEmail) {
          await fetch('http://localhost:4000/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: userEmail,
              subject: 'Expired Item Added to Inventory',
              text: `The item "${item.name}" was added to your inventory but is already expired (expiry date: ${item.expiryDate}).`
            })
          });
        }
        // Check for near expiry (within threshold)
        if (userEmail && status.status !== 'expired') {
          const now = new Date();
          const expiry = new Date(item.expiryDate);
          let thresholdMs = 0;
          if (item.category === 'dairy') thresholdMs = thresholds.dairy * 60 * 60 * 1000;
          else if (item.category === 'vegetables') thresholdMs = (thresholds.vegetables || 3) * 24 * 60 * 60 * 1000;
          else if (item.category === 'snacks') thresholdMs = (thresholds.snacks || 7) * 24 * 60 * 60 * 1000;
          else if (item.category === 'medicine') thresholdMs = (thresholds.medicine || 7) * 24 * 60 * 60 * 1000;
          else thresholdMs = 3 * 24 * 60 * 60 * 1000; // default 3 days
          if (expiry > now && expiry.getTime() - now.getTime() <= thresholdMs) {
            await fetch('http://localhost:4000/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: userEmail,
                subject: 'Item Near Expiry',
                text: `The item "${item.name}" will expire soon (expiry date: ${item.expiryDate}). Please use it before it expires.`
              })
            });
          }
        }
        notifiedItemIdsRef.current.push(itemId);
      });
    }
    prevItemsRef.current = items;
  }, [items]);

  // Now we can do conditional returns AFTER all hooks are called
  console.log('Inventory component rendered');
  console.log('Inventory items state:', items);
  console.log('Inventory loading:', loading);
  console.log('Inventory error:', error);
  console.log('Items is array:', Array.isArray(items));
  console.log('Items length:', items?.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-lg font-semibold">Error loading inventory</div>
        <p className="text-gray-600">{error}</p>
        <p className="text-sm text-gray-500">Make sure the backend server is running on http://localhost:4000</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleSaveEdit = async (updatedItem: FoodItem) => {
    try {
      const itemId = (updatedItem as any)._id || updatedItem.id;
      // Remove id/_id from the update payload
      const { id, _id, ...updateData } = updatedItem as any;
      await updateItem(itemId, updateData);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const categories = ['all', ...new Set((Array.isArray(items) ? items : []).map(item => item?.category).filter(Boolean))];

  const getStatusCounts = () => {
    const counts = { expired: 0, critical: 0, warning: 0, good: 0 };
    (filteredItems || []).forEach(item => {
      try {
        const status = getExpiryStatus(item.expiryDate, item.category);
        counts[status.status as keyof typeof counts]++;
      } catch (err) {
        console.error('Error getting expiry status:', err);
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Safety: Ensure we always have valid data
  const safeItems = Array.isArray(items) ? items : [];
  const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

  // Debug: Force render something visible
  console.log('About to render Inventory UI');
  console.log('safeItems:', safeItems);
  console.log('safeFilteredItems:', safeFilteredItems);

  return (
    <div className="space-y-6 p-4" style={{ minHeight: '200px', position: 'relative', zIndex: 1 }}>
      {/* Debug banner - remove this after confirming it works */}
      <div className="bg-yellow-200 border-2 border-yellow-500 p-2 mb-4 rounded">
        <strong>DEBUG:</strong> Inventory component is rendering! Items: {safeItems.length}, Filtered: {safeFilteredItems.length}
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
          <p className="text-gray-600">Manage your food items and track expiry dates</p>
        </div>
        <div className="text-sm text-gray-600">
          {safeFilteredItems.length} items
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
          <div className="text-sm text-red-600">Expired</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{statusCounts.critical}</div>
          <div className="text-sm text-orange-600">Critical</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.warning}</div>
          <div className="text-sm text-yellow-600">Warning</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{statusCounts.good}</div>
          <div className="text-sm text-green-600">Good</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'expiry' | 'category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expiry">Expiry Date</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {safeFilteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-300 p-8">
          <div className="text-2xl font-bold text-gray-700 mb-2">No items found</div>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters, or add items to your inventory</p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 inline-block">
            <p className="text-sm font-semibold text-blue-800">Total items in database: <span className="text-2xl">{safeItems.length}</span></p>
            {searchTerm && <p className="text-xs text-blue-600 mt-1">Search term: "{searchTerm}"</p>}
            {selectedCategory !== 'all' && <p className="text-xs text-blue-600 mt-1">Category filter: "{selectedCategory}"</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeFilteredItems.map((item: any) => (
            <ItemCard
              key={item.id || item._id}
              item={{
                ...item,
                id: item.id || item._id,
                image: item.image || defaultImages[item.name.toLowerCase()] || defaultImages[item.category] || defaultImages.default
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as FoodItem['category'] })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={editingItem.expiryDate}
                  onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingItem)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;