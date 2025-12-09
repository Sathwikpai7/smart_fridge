import React from 'react';
import { FoodItem } from '../types';
import { Trash2, Edit, MapPin } from 'lucide-react';
import ExpiryTimer from './ExpiryTimer';
import { formatExpiryDate } from '../utils/dateUtils';

interface ItemCardProps {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {item.image && (
        <div className="h-32 bg-gray-200 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">{item.quantity} {item.unit}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expiry:</span>
            <span className="font-medium">{formatExpiryDate(item.expiryDate)}</span>
          </div>
          
          {item.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{item.location}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
              item.category === 'dairy' ? 'bg-blue-100 text-blue-800' :
              item.category === 'vegetables' ? 'bg-green-100 text-green-800' :
              item.category === 'snacks' ? 'bg-orange-100 text-orange-800' :
              item.category === 'medicine' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.category}
            </span>
            <ExpiryTimer expiryDate={item.expiryDate} category={item.category} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;