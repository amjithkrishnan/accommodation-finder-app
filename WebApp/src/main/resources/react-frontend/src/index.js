import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import all components and services
import './components/Router';
import './components/LoadingContext';
import './services/authService';
import './services/propertyService';
import './services/mediaService';
import './services/masterDataService';
import { AuthProvider } from './context/AuthContext';
import './components/ConfirmModal';
import './components/Breadcrumb';
import './components/Header';
import './components/Footer';
import './components/PropertyDetails';
import './components/AccommodationList';
import './components/SignIn';
import './components/SignUp';
import './components/Dashboard';
import './components/AddProperty';
import './components/Profile';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
