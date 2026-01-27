import React, { useEffect, useRef, useState } from 'react';
import '../css/usersearch.css';
import UserProfile from './UserProfile';

export default function UserSearch({ loggedIn, userData }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addedItems, setAddedItems] = useState([]);
    const [inProgressItems, setInProgressItems] = useState([]);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearchExecuted(false);
        
        try {
            const response = await fetch(`/api/profile/safe/${encodeURIComponent(query.trim())}/by-username`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResults(data ? data : []);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setResults([]);
        } finally {
            setLoading(false);
            setSearchExecuted(true);
        }
    };

    const handleAddToList = (item) => {
        if (!item) return;
        // Add item to list logic here
    };

    const handleRemoveFromList = (item) => {
        if (!item) return;
        // Remove item from list logic here
    };

    const handleAddToInProgress = (item) => {
        if (!item) return;
        // Add item to in-progress list logic here
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleBackFromDetail = () => {
        setSelectedItem(null);
    };

    return (
        <div className="search-page" data-testid="search-page">
            {selectedItem == null ? (
                <div className="search-bar">
                        <input
                            data-testid="search-input"
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSearchExecuted(false); }}
                            placeholder="Search for users by username..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button id="search-button" data-testid="search-button" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                </div>
            ) : null}
            <div className="search-results">
                {selectedItem && <UserProfile
                        selectedItem={selectedItem}
                        onBack={handleBackFromDetail}
                        inProgressItems={inProgressItems}
                        addedItems={addedItems}
                        onAddToList={handleAddToList}
                        onRemoveFromList={handleRemoveFromList}
                        onAddToInProgress={handleAddToInProgress}
                    />
                }
                {!selectedItem && results.length > 0 ? (
                    <ul data-testid="search-results-list" className="modern-ui-list">
                        {results.map((item, index) => (
                            <li
                                key={index}
                                className="search-result-item modern-ui-item"
                                onClick={() => handleSelectItem(item)}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSelectItem(item); }}
                            >
                                <div className="avatar-placeholder">
                                    {item.avatarUrl || item.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="username">{item.username}</span>
                            </li>
                        ))}
                    </ul>
                ) : query && !loading && searchExecuted && !selectedItem ? (
                    <p className="no-results" data-testid="no-results-message">No results found.</p>
                ) : null}
            </div>
            {toast.visible && (
            <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
                {toast.message}
            </div>
            )}
        </div>
    );
}