import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'
import './index.css';
import App from './App'; 
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

// Get the root element
const rootElement = document.getElementById('root');
// Create a root
const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <Router> {/* Wrap App with Router */}
      <App />
    </Router>
  </React.StrictMode>
);