import React from 'react';
import ReactDOM from 'react-dom/client';
import './storage.js';
import './index.css';
import ShiftTracker from './ShiftTracker.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShiftTracker />
  </React.StrictMode>,
);
