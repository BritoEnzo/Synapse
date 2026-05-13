import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AILocalService } from './services/aiLocalService';
import { AILoadingIndicator } from './components/AILoadingIndicator';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Pré-carregar modelos em segundo plano
    AILocalService.preloadModels();
  }, []);

  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-50">
        <AILoadingIndicator />
      </div>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;