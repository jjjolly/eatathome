import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Calendar from './components/Calendar';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './utils/localStorage';

function App() {
  const [currentUser, setCurrentUserState] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
    }
  }, []);

  const handleOnboardingComplete = (userName) => {
    setCurrentUser(userName);
    setCurrentUserState(userName);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUserState(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!currentUser) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
      />

      <main className="p-4 pb-8">
        <Calendar key={refreshKey} currentUser={currentUser} />
      </main>
    </div>
  );
}

export default App;
