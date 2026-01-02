import React, { useState } from 'react';
import './css/App.css';
import Search from './components/Search';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="tab-content">
            <h2>Welcome to AniLog</h2>
            <p>Your personal anime and manga tracker</p>
          </div>
        );
      case 'search':
        return <Search />;
      case 'watchlist':
        return (
          <div className="tab-content">
            <h2>Your Watchlist</h2>
            <p>Your saved anime and manga will appear here</p>
          </div>
        );
      case 'library':
        return (
          <div className="tab-content">
            <h2>Your Library</h2>
            <p>Browse your complete collection</p>
          </div>
        );
      default:
        return <Search />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AniLog</h1>
        <nav className="tab-nav">
        <button 
          className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
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
          Library
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
