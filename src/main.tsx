import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import '@fontsource-variable/noto-sans-sc/wght.css';
import '@fontsource-variable/noto-serif-sc/wght.css';

import { App } from './app/App';
import { normalizeRouterBasename } from './app/routerBase';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/base.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found.');
}

const routerBasename = normalizeRouterBasename(import.meta.env.BASE_URL);

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
