import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme.css';

// Make React and ReactDOM globally available
window.React = React;
window.ReactDOM = ReactDOM;

// Load config
import('./config.js');

// Import all components in order
import('./components/Router.js').then(() =>
  import('./components/LoadingContext.js')
).then(() =>
  import('./services/authService.js')
).then(() =>
  import('./services/propertyService.js')
).then(() =>
  import('./services/mediaService.js')
).then(() =>
  import('./services/masterDataService.js')
).then(() =>
  import('./context/AuthContext.js')
).then(() =>
  import('./components/ConfirmModal.js')
).then(() =>
  import('./components/Breadcrumb.js')
).then(() =>
  import('./components/Header.js')
).then(() =>
  import('./components/Footer.js')
).then(() =>
  import('./components/PropertyDetails.js')
).then(() =>
  import('./components/AccommodationList.js')
).then(() =>
  import('./components/SignIn.js')
).then(() =>
  import('./components/SignUp.js')
).then(() =>
  import('./components/Dashboard.js')
).then(() =>
  import('./components/AddProperty.js')
).then(() =>
  import('./components/Profile.js')
).then(() =>
  import('./components/App.js')
).then(() => {
  // Render the app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(window.AuthProvider, null,
      React.createElement(window.App)
    )
  );
});
