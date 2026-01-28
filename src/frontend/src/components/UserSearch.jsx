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

        if (item.type == null || (item.type !== 'ANIME' && item.type !== 'MANGA')) {
            showToast('Cannot add item: Invalid media type.', 'error');
            return;
        }

        if (item.title == null || (item.title.english == null && item.title.romaji == null && item.title.nativeTitle == null)) {
            showToast('Cannot add item: Title information is missing.', 'error');
            return;
        }

        if (item.id == null) {
            showToast('Cannot add item: Missing media ID.', 'error');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to add items to your list.', 'error');
            return;
        }

        // Proceed to add item to list
        setLoading(true);

        try {
            fetch('/api/user/list/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    type: item.type,
                    title: item.title?.english || item.title?.romaji || item.title?.nativeTitle,
                    coverImageUrl: item.coverImageUrl,
                    anilistId: item.id
                })
            }).then(response => {
                if (response.ok) {
                    showToast('Item added to list successfully.', 'success');
                    setAddedItems(prev => new Set([...prev, item.id]));
                } else {
                    showToast('Failed to add item to list.', 'error');
                }
            });
        } catch (error) {
            console.error('Error adding item to list:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromList = (item) => {
        if (!item) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to remove items from your list.', 'error');
            return;
        }

        // Proceed to remove item from list
        setLoading(true);
        try {
            fetch('/api/user/list/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    anilistId: item.id
                })
            }).then(response => {
                if (response.ok) {
                    showToast('Item removed from list successfully.', 'success');
                    setAddedItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(item.id);
                        return newSet;
                    });
                } else {
                    showToast('Failed to remove item from list.', 'error');
                }
            });
        } catch (error) {
            console.error('Error removing item from list:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToInProgress = (item) => {
        if (!item) return;

        if (item.type == null || (item.type !== 'ANIME' && item.type !== 'MANGA')) {
            showToast('Cannot add item: Invalid media type.', 'error');
            return;
        }

        if (item.title == null || (item.title.english == null && item.title.romaji == null && item.title.nativeTitle == null)) {
            showToast('Cannot add item: Title information is missing.', 'error');
            return;
        }

        if (item.id == null) {
            showToast('Cannot add item: Missing media ID.', 'error');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to add items to in-progress list.', 'error');
            return;
        }

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!accessToken || !refreshToken) {
            showToast('You must be logged in to add items to in-progress list.', 'error');
            return;
        }

        setLoading(true);

        try {
            const mediaType = item.type === 'ANIME' ? 'ANIME' : 'MANGA';
            const statusType = item.type === 'ANIME' ? 'WATCHING' : 'READING';

            fetch('/api/user/watched/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    type: mediaType,
                    title: item.title?.english || item.title?.romaji || item.title?.nativeTitle,
                    coverImageUrl: item.coverImageUrl,
                    anilistId: item.id,
                    totalEpisodes: item.episodes || null,
                    totalChapters: item.chapters || null,
                    status: statusType
                })
            }).then(response => {
                if (response.ok) {
                    showToast(`Added to in-progress ${item.type === 'ANIME' ? 'anime' : 'manga'} list!`, 'success');
                    setInProgressItems(prev => new Map(prev).set(item.id, statusType));
                } else {
                    showToast('Failed to add item to in-progress list.', 'error');
                }
            });

            try {
                handleRemoveFromList(item);
            } catch (err) {
                // Silently fail if item wasn't in list
                console.log('Item was not in list or already removed');
            }

        } catch (error) {
            console.error('Error adding item to in-progress list:', error);
            showToast('Error adding item to in-progress list.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleBackFromDetail = () => {
        setSelectedItem(null);
    };

    const showToast = (message, type = 'info', duration = 3000) => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ visible: false, message: '', type: 'info' });
        }, duration);
    }

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
                        accessToken={localStorage.getItem('authToken')}
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