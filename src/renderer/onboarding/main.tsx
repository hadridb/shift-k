import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import './onboarding.css';
import { OnboardingApp } from './OnboardingApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OnboardingApp />
  </React.StrictMode>,
);
