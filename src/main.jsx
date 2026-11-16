import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TransitionProvider } from './components/PageTransition.jsx';
import Cursor from './components/Cursor.jsx';
import Preloader from './components/Preloader.jsx';
import './styles.css';

// Точка входа: находим <div id="root"> в index.html и рендерим туда приложение.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TransitionProvider>
        <App />
        <Cursor />
        <Preloader />
      </TransitionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
