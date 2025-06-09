import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// This is where React connects to the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// React.StrictMode is a development tool that helps detect potential problems
// It doesn't render anything visible but activates additional checks and warnings