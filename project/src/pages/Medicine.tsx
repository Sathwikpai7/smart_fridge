import React, { useState } from 'react';
import { Plus, Pill, AlertTriangle, Clock, Trash2, Edit } from 'lucide-react';
import { Medicine } from '../types';
import { useMedicines } from '../hooks/useAPI';
import ExpiryTimer from '../components/ExpiryTimer';
import { formatExpiryDate, getExpiryStatus } from '../utils/dateUtils';

const MedicinePage: React.FC = () => {
  const { medicines, loading, addMedicine, updateMedicine, deleteMedicine } = useMedicines();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    name: '',
    dosage: '',
    expiryDate: '',
    quantity: 1,
    instructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMedicine.name || !newMedicine.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingMedicine) {
        // Update existing medicine
        const { id, _id, ...medicineData } = editingMedicine as any;
        const updatedMedicine: any = {
          ...medicineData,
          ...newMedicine
        };
        await updateMedicine(editingMedicine._id || editingMedicine.id, updatedMedicine);
        setEditingMedicine(null);
      } else {
        // Add new medicine
        const medicine: any = {
          name: newMedicine.name,
          dosage: newMedicine.dosage || '',
          expiryDate: newMedicine.expiryDate,
          quantity: newMedicine.quantity || 1,
          instructions: newMedicine.instructions || '',
          addedDate: new Date().toISOString()
        };
        await addMedicine(medicine);
      }

      setNewMedicine({
        name: '',
        dosage: '',
        expiryDate: '',
        quantity: 1,
        instructions: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Failed to save medicine');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setNewMedicine(medicine);
    setEditingMedicine(medicine);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteMedicine(id);
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Failed to delete medicine');
      }
    }
  };

  const getStatusCounts = () => {
    const counts = { expired: 0, critical: 0, warning: 0, good: 0 };
    medicines.forEach((medicine: any) => {
      const status = getExpiryStatus(medicine.expiryDate, 'medicine');
      counts[status.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Tracker</h1>
          <p className="text-gray-600">Track your medications and expiry dates</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Medicine
        </button>
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

      {/* Medicine List */}
      {medicines.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medicines Added</h3>
          <p className="text-gray-600">Start by adding your first medicine to track its expiry date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine: any) => {
            const status = getExpiryStatus(medicine.expiryDate, 'medicine');
            return (
              <div
                key={medicine._id || medicine.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 ${
                  status.color === 'red' ? 'border-red-500' :
                  status.color === 'yellow' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      status.color === 'red' ? 'bg-red-100' :
                      status.color === 'yellow' ? 'bg-yellow-100' :
                      'bg-green-100'
                    }`}>
                      <Pill className={`h-6 w-6 ${
                        status.color === 'red' ? 'text-red-600' :
                        status.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                      {medicine.dosage && (
                        <p className="text-sm text-gray-600">{medicine.dosage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(medicine)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medicine._id || medicine.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{medicine.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expiry:</span>
                    <span className="font-medium">{formatExpiryDate(medicine.expiryDate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Status:</span>
                    <ExpiryTimer expiryDate={medicine.expiryDate} category="medicine" />
                  </div>
                  
                  {medicine.instructions && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{medicine.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={newMedicine.name || ''}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Aspirin, Vitamin D"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newMedicine.dosage || ''}
                  onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={newMedicine.expiryDate || ''}
                  onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newMedicine.quantity || 1}
                  onChange={(e) => setNewMedicine({ ...newMedicine, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={newMedicine.instructions || ''}
                  onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="e.g., Take with food, twice daily"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMedicine(null);
                    setNewMedicine({
                      name: '',
                      dosage: '',
                      expiryDate: '',
                      quantity: 1,
                      instructions: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicinePage;