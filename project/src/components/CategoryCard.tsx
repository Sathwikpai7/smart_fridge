import React from 'react';
import { FoodItem } from '../types';
import { Milk, Carrot, Cookie, Pill, Apple, Beef, Wheat, Package } from 'lucide-react';

interface CategoryCardProps {
  category: string;
  items: FoodItem[];
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, items, onClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dairy':
        return <Milk className="h-8 w-8" />;
      case 'vegetables':
        return <Carrot className="h-8 w-8" />;
      case 'snacks':
        return <Cookie className="h-8 w-8" />;
      case 'medicine':
        return <Pill className="h-8 w-8" />;
      case 'fruits':
        return <Apple className="h-8 w-8" />;
      case 'meat':
        return <Beef className="h-8 w-8" />;
      case 'grains':
        return <Wheat className="h-8 w-8" />;
      default:
        return <Package className="h-8 w-8" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dairy':
        return 'from-blue-400 to-blue-600';
      case 'vegetables':
        return 'from-green-400 to-green-600';
      case 'snacks':
        return 'from-orange-400 to-orange-600';
      case 'medicine':
        return 'from-red-400 to-red-600';
      case 'fruits':
        return 'from-pink-400 to-pink-600';
      case 'meat':
        return 'from-purple-400 to-purple-600';
      case 'grains':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const expiringItems = items.filter(item => {
    const daysUntil = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
  });

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            {getCategoryIcon(category)}
            <h3 className="text-xl font-bold mt-2 capitalize">{category}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm opacity-90">items</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {expiringItems.length > 0 && (
          <div className="flex items-center text-amber-600">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
            <span className="text-sm">{expiringItems.length} expiring soon</span>
          </div>
        )}
        {items.length === 0 && (
          <div className="text-gray-500 text-sm">No items</div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;