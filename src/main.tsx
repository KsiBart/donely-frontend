import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BrandProvider } from './brand';
import './i18n';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './state/ToastContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BrandProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrandProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
