import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Camera, 
  Upload, 
  Package, 
  ChefHat, 
  Pill, 
  Activity, 
  Settings,
  Bell
} from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Scan', href: '/scan', icon: Camera },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Remove Item', href: '/remove', icon: Package },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Medicine', href: '/medicine', icon: Pill },
    { name: 'Sensors', href: '/sensors', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Desktop Navbar */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-md w-full">
        <div className="w-full mx-auto px-0 sm:px-4 lg:px-8">
          <div className="flex justify-between h-20 max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">SmartFridge</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-5 py-2 text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-105 relative group ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm underline underline-offset-8 decoration-2 decoration-blue-500'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-6 w-6 mr-2" />
                    {item.name}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-blue-200 shadow-2xl w-full">
        <div className="grid grid-cols-4 gap-0 p-0">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-3 rounded-none transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-7 w-7" />
                <span className="text-xs mt-1 font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;