import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';
import { store } from './store';
import { initGTM } from './utils/gtm';

initGTM();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </Provider>
  </StrictMode>
);
