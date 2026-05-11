import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {usePriorityTabPreload} from './tabs/usePriorityTabPreload';
import './index.css';

function AppWithPreloads() {
  usePriorityTabPreload();

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithPreloads />
  </StrictMode>,
);
