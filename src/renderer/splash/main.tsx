import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import '../styles/themes.css';
import { SplashApp } from './SplashApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SplashApp />
  </React.StrictMode>,
);
