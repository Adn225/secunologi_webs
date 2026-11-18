import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// A deployment can replace a lazy chunk while an older tab is still open.
window.addEventListener('vite:preloadError', (event) => {
  const { payload } = event as Event & { payload?: unknown };
  const isAssetLoadError = payload instanceof Error
    && /dynamically imported module|importing a module script failed|unable to preload css/i.test(payload.message);
  if (!isAssetLoadError) return;

  // Allow one automatic reload for this route and build in the current tab.
  const retryKey = `secunologie:preload-retry:${import.meta.url}:${window.location.pathname}`;
  try {
    if (window.sessionStorage.getItem(retryKey)) return;
    window.sessionStorage.setItem(retryKey, '1');
  } catch {
    // If the marker cannot be saved, leave the manual retry to ErrorBoundary.
    return;
  }

  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
