import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BrandProvider } from './brand';
import './i18n';
import { AuthProvider } from './state/AuthContext';
import { SiteThemeProvider } from './state/SiteThemeContext';
import { ToastProvider } from './state/ToastContext';
import { applyTheme } from './theme';
import './styles/global.css';
import './landing/landing.css';

// Apply the env-resolved accent palette (VITE_THEME / VITE_ACCENT — see src/theme.ts) as CSS
// custom properties on :root BEFORE the first render, so there's no flash of the default palette.
applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BrandProvider>
        <AuthProvider>
          <ToastProvider>
            <SiteThemeProvider>
              <App />
            </SiteThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </BrandProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
