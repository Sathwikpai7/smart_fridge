import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Upload from './pages/Upload';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import Medicine from './pages/Medicine';
import Sensors from './pages/Sensors';
import Settings from './pages/Settings';
import RemoveItem from './pages/RemoveItem';
import GeminiDebug from './pages/GeminiDebug';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="scan" element={<Scan />} />
          <Route path="upload" element={<Upload />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="sensors" element={<Sensors />} />
          <Route path="settings" element={<Settings />} />
          <Route path="remove" element={<RemoveItem />} />
          <Route path="debug" element={<GeminiDebug />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;