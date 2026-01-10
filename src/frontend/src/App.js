import React, { useState } from 'react';
import './css/App.css';
import Search from './components/Search';
import Watchlist from './components/Watchlist';
import Profile from './components/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (data) => {
    setLoggedIn(true);
    setUserData(data);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserData(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <div className="tab-content">
            <h2>Welcome to AniLog</h2>
            <p>Your personal anime and manga tracker</p>
          </div>
        );
      case 'search':
        return <Search loggedIn={loggedIn} userData={userData} />;
      case 'watchlist':
        return <Watchlist loggedIn={loggedIn} userData={userData} />;
      case 'library':
        return <Profile onLogin={handleLogin} />;
      default:
        return <Profile onLogin={handleLogin} />;
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
          className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          Watchlist
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
      </main>
    </div>
  );
}

export default App;
