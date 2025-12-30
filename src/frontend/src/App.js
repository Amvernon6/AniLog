import React from 'react';
import './App.css';
import Search from './components/Search';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AniLog</h1>
        {/* <p>Search for Anime and Manga</p> */}
      </header>
      <main>
        <Search />
      </main>
    </div>
  );
}

export default App;
