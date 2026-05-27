// Ocean View — App Root
// Simple hash-based routing between Landing and Dashboard

import { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

type Route = 'landing' | 'dashboard';

function getRoute(): Route {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'dashboard' || hash === 'app') return 'dashboard';
  return 'landing';
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate function exposed globally for use in components
  useEffect(() => {
    (window as any).__navigate = (path: Route) => {
      window.location.hash = path === 'dashboard' ? '#dashboard' : '';
      setRoute(path);
    };
  }, []);

  return (
    <ErrorBoundary>
      {route === 'landing' && <LandingPage />}
      {route === 'dashboard' && <DashboardPage />}
    </ErrorBoundary>
  );
}

export default App;