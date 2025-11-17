
import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ChildDetailPage from './pages/ChildDetailPage';
import LoadingSpinner from './components/LoadingSpinner';
import type { Filho } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'childDetail'>('dashboard');
  const [selectedChild, setSelectedChild] = useState<Filho | null>(null);

  const handleSelectChild = useCallback((child: Filho) => {
    setSelectedChild(child);
    setCurrentView('childDetail');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedChild(null);
    setCurrentView('dashboard');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800">
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <>
          {currentView === 'dashboard' && <DashboardPage onSelectChild={handleSelectChild} />}
          {currentView === 'childDetail' && selectedChild && (
            <ChildDetailPage child={selectedChild} onBack={handleBackToDashboard} />
          )}
        </>
      )}
    </div>
  );
};

export default App;
