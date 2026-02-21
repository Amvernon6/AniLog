import React, { useState, useRef } from 'react';
import './css/App.css';
import Search from './components/Search';
import Profile from './components/Profile';
import Discover from './components/Discover';
import UserSearch from './components/UserSearch';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [loggedIn, setLoggedIn] = useState(false);

  // Global toast state
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const toastTimerRef = useRef(null);

  // Global showToast function
  const showToast = (message, type = 'info', duration = 3200) => {
    setToast({ message, type, visible: true });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  const handleLogin = (data) => {
    setLoggedIn(true);

    // Store tokens and user info
    if (data && data.accessToken && data.refreshToken && data.userId) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);

    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discover loggedIn={loggedIn} showToast={showToast} />;
      case 'search':
        return <Search loggedIn={loggedIn} showToast={showToast} />;
      case 'library':
        return <Profile Login={handleLogin} Logout={handleLogout} showToast={showToast} />;
      case 'users':
        return <UserSearch loggedIn={loggedIn} showToast={showToast} />;
      default:
        return <Profile Login={handleLogin} Logout={handleLogout} showToast={showToast} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AniLog</h1>
        <nav className="tab-nav">
        <button 
          className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          Profile
        </button>
      </nav>
      </header>
      <main>
        {renderTabContent()}
        {toast.visible && (
          <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
