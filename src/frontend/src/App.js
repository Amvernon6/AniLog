import React, { useState } from 'react';
import './css/App.css';
import Search from './components/Search';
import Profile from './components/Profile';
import Discover from './components/Discover';
import UserSearch from './components/UserSearch';

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
        return <Discover loggedIn={loggedIn} />;
      case 'search':
        return <Search loggedIn={loggedIn} />;
      case 'library':
        return <Profile onLogin={handleLogin} />;
      case 'users':
        return <UserSearch loggedIn={loggedIn} />;
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
      </main>
    </div>
  );
}

export default App;
