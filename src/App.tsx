import React, { useState } from 'react';
import { EmergencyProvider } from './context/EmergencyContext';
import { AppLayout } from './components/layout/AppLayout';
import { NavPage } from './components/layout/Sidebar';
import { Landing } from './pages/Landing';
import { CommandCenter } from './pages/CommandCenter';
import { LiveMap } from './pages/LiveMap';
import { Simulation } from './pages/Simulation';
import { WhatIf } from './pages/WhatIf';
import { Incidents } from './pages/Incidents';
import { Analytics } from './pages/Analytics';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('command-center');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={setCurrentPage} />;
      case 'command-center':
        return <CommandCenter />;
      case 'live-map':
        return <LiveMap />;
      case 'simulation':
        return <Simulation />;
      case 'what-if':
        return <WhatIf />;
      case 'incidents':
        return <Incidents />;
      case 'analytics':
        return <Analytics />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <EmergencyProvider>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppLayout>
    </EmergencyProvider>
  );
};

export default App;
