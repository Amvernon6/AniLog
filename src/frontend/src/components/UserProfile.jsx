import React, { useState, useEffect } from "react";
import '../css/userprofile.css';
import '../css/profile.css';

const UserProfile = ({ selectedItem, accessToken, usersFollowing, usersFollowers, usersRequested, addedItems, inProgressItems, onHandleFollow, onHandleUnfollow, onHandleFollowRequest, onAddToMyList, onAddToInProgress, onBack, onRefresh }) => {

    const [activeProfileTab, setActiveProfileTab] = useState('profile');
    const [animeWatchedView, setAnimeWatchedView] = useState('watched');
    const [mangaReadView, setMangaReadView] = useState('read');
    const [watchedStatusFilter, setWatchedStatusFilter] = useState('ALL');
    const [isLoadingWatched, setIsLoadingWatched] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [error, setError] = useState(null);
    const [selectedWatchedItem, setSelectedWatchedItem] = useState(null);
    const [animeRankingOrder, setAnimeRankingOrder] = useState([]);
    const [mangaRankingOrder, setMangaRankingOrder] = useState([]);
    const [currUserInProgressItems, setCurrUserInProgressItems] = useState([]);
    const [fetchedWatchedItems, setFetchedWatchedItems] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    useEffect(() => {
        if (selectedItem && fetchedWatchedItems === false) {
            setIsLoadingProfile(true);
            handleGetInProgressItems('ANIME').then(items => {
                handleGetInProgressItems('MANGA').then(mangaItems => {
                    const combinedItems = [...items, ...mangaItems];
                    setCurrUserInProgressItems(combinedItems);
                    setIsLoadingProfile(false);
                });
            });

            setFetchedWatchedItems(true);
            setIsLoadingProfile(false);
        }
    }, [selectedItem, fetchedWatchedItems]);

    useEffect(() => {
        // Use the user's saved ranking order from their profile
        if (selectedItem?.animeRankingOrder && Array.isArray(selectedItem.animeRankingOrder)) {
            setAnimeRankingOrder(selectedItem.animeRankingOrder);
        } else {
            // Fallback to just listing anime items if no ranking order is saved
            const animeIds = (currUserInProgressItems || [])
                .filter(it => it.type === 'ANIME')
                .map(it => it.id);
            setAnimeRankingOrder(animeIds);
        }

        if (selectedItem?.mangaRankingOrder && Array.isArray(selectedItem.mangaRankingOrder)) {
            setMangaRankingOrder(selectedItem.mangaRankingOrder);
        } else {
            // Fallback to just listing manga items if no ranking order is saved
            const mangaIds = (currUserInProgressItems || [])
                .filter(it => it.type === 'MANGA')
                .map(it => it.id);
            setMangaRankingOrder(mangaIds);
        }
    }, [currUserInProgressItems, selectedItem]);

    const showToast = (message, type = 'info', duration = 3000) => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ visible: false, message: '', type: 'info' });
        }, duration);
    }

    const parseErrorResponse = async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (err) {
            return { error: text || response.statusText || 'Request failed' };
        }
    };

    // Spinner component
    const Spinner = () => (
        <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div className="spinner" style={{
                border: '6px solid #f3f3f3',
                borderTop: '6px solid #3498db',
                borderRadius: '50%',
                width: 48,
                height: 48,
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    const handleGetInProgressItems = async (type) => {
        setIsLoadingWatched(true);
        setError(null);

        try {
            let url = `/api/user/${selectedItem.id}/watched/type/${type}`;
            
            // Add status filter if not ALL
            if (watchedStatusFilter !== 'ALL') {
                url = `/api/user/${selectedItem.id}/watched/type/${type}/status/${watchedStatusFilter}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch watched items');
            }
            return await response.json();
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setIsLoadingWatched(false);
        }
    };

    const handleAddToMyList = async (item) => {
        if (onAddToMyList) {
            onAddToMyList(item);
        }
    };

    const handleAddToInProgress = async (item) => {
        if (onAddToInProgress) {
            onAddToInProgress(item);
        }
    };

    const handleFollowUser = async (item) => {
        if (onHandleFollow) {
            onHandleFollow(item);
        }
    };

    const handleUnfollowUser = async (item) => {
        if (onHandleUnfollow) {
            onHandleUnfollow(item);
        }
    };

    const handleRequestUser = async (item) => {
        if (onHandleFollowRequest) {
            onHandleFollowRequest(item);
        }
    };

    return (
        <div className="profile-logged-in" data-testid="profile-logged-in">
            <div className="profile-tabs">
                <button 
                    className={`profile-tab-button ${activeProfileTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('profile')}
                >
                    Profile
                </button>
                <button 
                    className={`profile-tab-button ${activeProfileTab === 'watched' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('watched')}
                >
                    Anime
                </button>
                <button 
                    className={`profile-tab-button ${activeProfileTab === 'read' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('read')}
                >
                    Manga
                </button>
            </div>

            <div className="profile-tab-content">
                {activeProfileTab === 'profile' && (
                    isLoadingProfile ? (
                        <Spinner />
                    ) : (
                        <div className="profile-view" data-testid="profile-view">
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <button onClick={onBack} className="back-button" data-testid="back-button">← Back</button>
                            </div>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {selectedItem.avatarUrl ? (
                                        <img src={selectedItem.avatarUrl} alt={`${selectedItem.username}'s avatar`} className="avatar-image" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {selectedItem.username ? selectedItem.username.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <h2>{selectedItem.username}</h2>
                                </div>
                                {usersFollowing?.find(userId => userId === selectedItem.id) || usersRequested?.find(userId => userId === selectedItem.id) ? (
                                    usersRequested?.find(userId => userId === selectedItem.id) ? (
                                        <button onClick={(e) => { e.stopPropagation(); handleUnfollowUser(selectedItem.id); }} className="follow-button pending">
                                            Requested
                                        </button>
                                    ) : (
                                        <button onClick={(e) => { e.stopPropagation(); handleUnfollowUser(selectedItem.id); }} className="follow-button added">
                                            Unfollow
                                        </button>
                                    )
                                ) : (
                                    !usersFollowers?.find(userId => userId === selectedItem.id) ? (
                                        <button onClick={(e) => { e.stopPropagation(); handleRequestUser(selectedItem.id); }} className="follow-button">
                                            + Request to Follow
                                        </button>
                                    ) : (
                                        <button onClick={(e) => { e.stopPropagation(); handleFollowUser(selectedItem.id); }} className="follow-button">
                                            + Follow Back
                                        </button>
                                    )
                                )}
                            </div>
                    
                            <div className="profile-details">
                                {/* <div className="profile-section">
                                    <h3>Favorite Anime</h3>
                                    <p>{selectedItem.favoriteAnime || 'Not specified'}</p>
                                </div>

                                <div className="profile-section">
                                    <h3>Favorite Manga</h3>
                                    <p>{selectedItem.favoriteManga || 'Not specified'}</p>
                                </div> */}
                                
                                <div className="profile-section">
                                    <h3>Favorite Genres</h3>
                                    <p>{Array.isArray(selectedItem.favoriteGenres) && selectedItem.favoriteGenres.length > 0 
                                        ? selectedItem.favoriteGenres.join(', ')
                                        : (selectedItem.favoriteGenres || 'Not specified')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {activeProfileTab === 'watched' && (
                    selectedWatchedItem ? (
                        <div className="modal-overlay" onClick={() => {
                            setSelectedWatchedItem(null);
                        }}>
                            <div className="modal-content watched-detail-modal" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => {
                                    setSelectedWatchedItem(null);
                                }} className="modal-close">✕</button>
                                
                                <div className="watched-detail">
                                    <div className="watched-detail-header">
                                        {selectedWatchedItem.coverImageUrl && (
                                            <img src={selectedWatchedItem.coverImageUrl} alt={selectedWatchedItem.title} className="watched-detail-cover" />
                                        )}
                                        <div className="watched-detail-info">
                                            <h2>{selectedWatchedItem.title}</h2>
                                            <span className={`watched-status status-${selectedWatchedItem.status?.toLowerCase()}`}>
                                                {selectedWatchedItem.status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="watched-detail-body">
                                        <div className="form-group">
                                            <label>Status</label>
                                            <span 
                                                value={selectedWatchedItem.status} 
                                                className="status-select"
                                            >
                                            </span>
                                        </div>
                                        <div className="form-group">
                                            <label>Chapters Read</label>
                                            <div className="progress-input-group">
                                                <span
                                                    type="number" 
                                                    min="0"
                                                    max={selectedWatchedItem.totalChapters || 9999}
                                                    value={selectedWatchedItem.chaptersRead}
                                                />
                                                <span className="progress-separator">/</span>
                                                <span 
                                                    type="number" 
                                                    min="0"
                                                    value={selectedWatchedItem.totalChapters}
                                                    placeholder="Total"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Rating (0-10)</label>
                                            <span 
                                                type="number" 
                                                min="0" 
                                                max="10"
                                                step="0.1"
                                                value={selectedWatchedItem.rating}
                                                placeholder="Rate this manga"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Notes</label>
                                            <p 
                                                value={selectedWatchedItem.notes}
                                                placeholder="Their thoughts about this manga..."
                                                rows="4"
                                                maxLength="1000"
                                            />
                                            <span className="char-count">{(selectedWatchedItem.notes || '').length}/1000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : ( 
                        <div className="watched-tab">
                            <div className="watched-header">
                                <h2>Watched Anime</h2>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div className="view-tabs">
                                        <button
                                            onClick={() => setAnimeWatchedView('watched')}
                                            className={`view-tab-button ${animeWatchedView === 'watched' ? 'active' : ''}`}
                                        >
                                            Watched
                                        </button>
                                        <button
                                            onClick={() => setAnimeWatchedView('rankings')}
                                            className={`view-tab-button ${animeWatchedView === 'rankings' ? 'active' : ''}`}
                                        >
                                            Rankings
                                        </button>
                                    </div>
                                    {animeWatchedView === 'watched' && <div className="status-filter">
                                        <label>Filter by Status:</label>
                                        <select 
                                            value={watchedStatusFilter} 
                                            onChange={(e) => setWatchedStatusFilter(e.target.value)}
                                            data-testid="anime-status-filter"
                                            className="status-filter-select"
                                        >
                                            <option value="ALL">All</option>
                                            <option value="WATCHING">Watching</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="ON_HOLD">On Hold</option>
                                            <option value="DROPPED">Dropped</option>
                                            <option value="PLAN_TO_WATCH">Plan to Watch</option>
                                        </select>
                                    </div>}
                                </div>
                            </div>
                            {animeWatchedView === 'rankings' && selectedItem.animeRankingOrder && selectedItem.animeRankingOrder.length > 0 && (
                                <div className="ranking" style={{ marginTop: '16px' }}>
                                    <h3 style={{ color: '#667eea', marginBottom: '8px' }}>Rankings</h3>
                                    <ul className="ranking-list">
                                        {selectedItem.animeRankingOrder?.map((id, index) => {
                                            const item = (currUserInProgressItems || []).find(i => i.id === id);
                                            if (!item) return null;
                                            return (
                                                <li
                                                    key={id}
                                                    className="ranking-item"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <span className="rank-num">{index + 1}</span>
                                                    {item.coverImageUrl && (
                                                        <img src={item.coverImageUrl} alt={item.title} className="rank-cover" />
                                                    )}
                                                    <span className="rank-title">{item.title}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                            {animeWatchedView === 'watched' && (
                                <>
                                {error && !selectedWatchedItem ? (
                                    <p className="error-message">{error}</p>
                                ) : isLoadingWatched ? (
                                    <div className="loading-placeholder">
                                        <p>Loading watched anime...</p>
                                    </div>
                                ) : (
                                    <div className="watched-items-grid">
                                        {currUserInProgressItems.filter(item => item.type === 'ANIME' && (watchedStatusFilter === 'ALL' || item.status === watchedStatusFilter)).length === 0 ? (
                                            <p className="tab-placeholder">
                                                No anime found.
                                            </p>
                                        ) : (
                                            currUserInProgressItems.filter(item => item.type === 'ANIME' && (watchedStatusFilter === 'ALL' || item.status === watchedStatusFilter)).map((item) => (
                                                <div key={item.id} className="watched-item-card" onClick={() => {
                                                    setSelectedWatchedItem(item);
                                                }}>
                                                    {item.coverImageUrl && (
                                                        <img src={item.coverImageUrl} alt={item.title} className="watched-item-cover" />
                                                    )}
                                                    <div className="watched-item-info">
                                                        <h4 className="watched-item-title">{item.title}</h4>
                                                        <span className={`watched-status status-${item.status?.toLowerCase()}`}>
                                                            {item.status?.replace(/_/g, ' ')}
                                                        </span>
                                                        {item.episodesWatched != null && (
                                                            <div className="progress-info">
                                                                <div className="progress-bar">
                                                                    <div 
                                                                        className="progress-fill" 
                                                                        style={{ 
                                                                            width: `${item.totalEpisodes ? (item.episodesWatched / item.totalEpisodes) * 100 : 0}%` 
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="progress-text">
                                                                    {item.episodesWatched}{item.totalEpisodes ? `/${item.totalEpisodes}` : ''} episodes
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.rating && (
                                                            <div className="rating-display">
                                                                ⭐ {item.rating}/10
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    )
                )}

                {activeProfileTab === 'read' && (
                    <div className="watched-tab read-tab">
                        <div className="watched-header">
                            <h2>Read Manga</h2>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div className="view-tabs">
                                    <button 
                                        className={`view-tab-button ${mangaReadView === 'read' ? 'active' : ''}`}
                                        onClick={() => setMangaReadView('read')}
                                    >
                                        Read
                                    </button>
                                    <button 
                                        className={`view-tab-button ${mangaReadView === 'rankings' ? 'active' : ''}`}
                                        onClick={() => setMangaReadView('rankings')}
                                    >
                                        Rankings
                                    </button>
                                </div>
                                {mangaReadView === 'read' && <div className="status-filter">
                                    <label>Filter by Status:</label>
                                    <select 
                                        value={watchedStatusFilter} 
                                        onChange={(e) => setWatchedStatusFilter(e.target.value)}
                                        data-testid="manga-status-filter"
                                        className="status-filter-select"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="READING">Reading</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="DROPPED">Dropped</option>
                                        <option value="PLAN_TO_READ">Plan to Read</option>
                                    </select>
                                </div>}
                            </div>
                        </div>
                        {mangaReadView === 'rankings' && mangaRankingOrder && mangaRankingOrder.length > 0 && (
                            <div className="ranking" style={{ marginTop: '16px' }}>
                                <h3 style={{ color: '#667eea', marginBottom: '8px' }}>Rankings</h3>
                                <ul className="ranking-list">
                                    {mangaRankingOrder.filter(id => (currUserInProgressItems || []).some(i => i.id === id)).map((id, index) => {
                                        const item = (currUserInProgressItems || []).find(i => i.id === id);
                                        return (
                                            <li
                                                key={id}
                                                className="ranking-item"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className="rank-num">{index + 1}</span>
                                                {item.coverImageUrl && (
                                                    <img src={item.coverImageUrl} alt={item.title} className="rank-cover" />
                                                )}
                                                <span className="rank-title">{item.title}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {mangaReadView === 'read' && (
                        <>
                        {error && !selectedWatchedItem ? (
                            <p className="error-message">{error}</p>
                        ) : isLoadingWatched ? (
                            <div className="loading-placeholder">
                                <p>Loading read manga...</p>
                            </div>
                        ) : (
                            <div className="watched-items-grid">
                                {currUserInProgressItems.filter(item => item.type === 'MANGA' && (watchedStatusFilter === 'ALL' || item.status === watchedStatusFilter)).length === 0 ? (
                                    <p className="tab-placeholder">
                                        No manga found.
                                    </p>
                                ) : (
                                    currUserInProgressItems.filter(item => item.type === 'MANGA' && (watchedStatusFilter === 'ALL' || item.status === watchedStatusFilter)).map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="watched-item-card" 
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.coverImageUrl && (
                                                <img src={item.coverImageUrl} alt={item.title} className="watched-item-cover" />
                                            )}
                                            <div className="watched-item-info">
                                                <h4 className="watched-item-title">{item.title}</h4>
                                                <span className={`watched-status status-${item.status?.toLowerCase()}`}>
                                                    {item.status?.replace(/_/g, ' ')}
                                                </span>
                                                {item.chaptersRead != null && (
                                                    <div className="progress-info">
                                                        <div className="progress-bar">
                                                            <div 
                                                                className="progress-fill" 
                                                                style={{ 
                                                                    width: `${item.totalChapters ? (item.chaptersRead / item.totalChapters) * 100 : 0}%` 
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="progress-text">
                                                            {item.chaptersRead}{item.totalChapters ? `/${item.totalChapters}` : ''} chapters
                                                        </span>
                                                    </div>
                                                )}
                                                {item.rating && (
                                                    <div className="rating-display">
                                                        ⭐ {item.rating}/10
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;