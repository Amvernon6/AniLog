import React, { useEffect, useRef, useState } from 'react';
import '../css/watchlist.css';

const Watchlist = ({ isLoggedIn, onRemove }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [watchlist, setWatchlist] = useState([]);
    const watchlistRef = useRef(null);

    // Fetch watchlist on component mount
    useEffect(() => {
    fetch('/api/watchlist')
        .then(res => res.json())
        .then(data => setWatchlist(data));
    }, []);

    // Remove handler - update database then state
    const handleRemoveFromWatchlist = async (id) => {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    setWatchlist(watchlist.filter(item => item.id !== id));
    };

    // Add handler - update database then state
    const handleAddToWatchlist = async (item) => {
    await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });
    setWatchlist([...watchlist, item]);
    };

    if (isLoggedIn === false) {
        return (
            <div className="watchlist-container">
                <div className="watchlist-header">
                    <h2>Watchlist</h2>
                </div>
                <div className="not-logged-in">
                    <p>Please log in to view your watchlist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`watchlist-container ${isVisible ? '' : 'collapsed'}`} ref={watchlistRef}>
            <div className="watchlist-header" onClick={() => setIsVisible(!isVisible)}>
                <h2>Watchlist</h2>
                <span className="toggle-icon">{isVisible ? '−' : '+'}</span>
            </div>
            {isVisible && (
                <ul className="watchlist-items">
                    {watchlist.map((item) => (
                        <li key={item.id} className="watchlist-item">
                            <span className="item-name">{item.name}</span>
                            <button className="remove-button" onClick={() => onRemove(item.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Watchlist;