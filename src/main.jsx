import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/400-italic.css';
import '@fontsource/amiri/700.css';
import '@fontsource/aref-ruqaa/400.css';
import '@fontsource/aref-ruqaa/700.css';
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import App from './App.jsx';
import './index.css';
import { initNativePlatform } from './native.js';
import { registerSW } from 'virtual:pwa-register';
import { AppErrorBoundary } from './components/layout/AppErrorBoundary.jsx';
import { SanctuaryProvider } from './context/SanctuaryContext.jsx';

// Register PWA Service Worker in production builds; in dev, clear any stale SW/caches
// so preview iframes always load live Vite modules cleanly.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    registerSW({ immediate: true });
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {});
    if (typeof caches !== 'undefined') {
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((k) => k.includes('workbox')).map((k) => caches.delete(k))))
        .catch(() => {});
    }
  }
}

// Boot native platform features (StatusBar, SplashScreen)
initNativePlatform();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <SanctuaryProvider>
        <App />
      </SanctuaryProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
