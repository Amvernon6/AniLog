import React, { useState, useEffect } from "react";
import '../css/profile.css';

const UserProfile = ({ profileUserId, authToken, onAddToMyList, onAddToInProgress}) => {

    const [activeProfileTab, setActiveProfileTab] = useState('profile');
    const [animeWatchedView, setAnimeWatchedView] = useState('watched');
    const [mangaReadView, setMangaReadView] = useState('read');
    const [watchedStatusFilter, setWatchedStatusFilter] = useState('ALL');
    const [watchedItems, setWatchedItems] = useState([]);
    const [isLoadingWatched, setIsLoadingWatched] = useState(false);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState({
        bio: '',
        avatarUrl: '',
        emailAddress: '',
        username: '',
        favoriteAnime: '',
        favoriteManga: '',
        favoriteGenres: [],
    });
    const [selectedWatchedItem, setSelectedWatchedItem] = useState(null);
    const [animeRankingOrder, setAnimeRankingOrder] = useState([]);
    const [mangaRankingOrder, setMangaRankingOrder] = useState([]);

    useEffect(() => {
        if (profileUserId) {
            handleGetProfile(profileUserId);
        }
    }, [profileUserId]);

    useEffect(() => {
        if (profileUserId && (activeProfileTab === 'watched' || activeProfileTab === 'read')) {
            const type = activeProfileTab === 'watched' ? 'ANIME' : 'MANGA';
            handleGetWatchedItems(type);
        }
    }, [activeProfileTab, watchedStatusFilter, profileUserId]);

    useEffect(() => {
        const animeIds = (watchedItems || [])
            .filter(it => it.type === 'ANIME')
            .map(it => it.id);
        setAnimeRankingOrder(animeIds);

        const mangaIds = (watchedItems || [])
            .filter(it => it.type === 'MANGA')
            .map(it => it.id);
        setMangaRankingOrder(mangaIds);
    }, [watchedItems]);

    const handleGetProfile = async (userId) => {
        try {
            const response = await fetch(`/api/profile/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfileData(data);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        }
    };

    const handleGetWatchedItems = async (type) => {
        setIsLoadingWatched(true);
        setError(null);

        try {
            const filterParam = watchedStatusFilter !== 'ALL' ? `?status=${watchedStatusFilter}` : '';
            const response = await fetch(`/api/watched/${profileUserId}/${type}${filterParam}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch watched items');
            }

            const data = await response.json();
            setWatchedItems(data);
        } catch (err) {
            setError(err.message || 'Failed to load watched items');
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

    return (
        <div className="profile-container">
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
                    <div className="profile-view" data-testid="profile-view">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profileData.avatarUrl ? (
                                    <img src={profileData.avatarUrl} alt={`${profileData.username}'s avatar`} className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            <div className="profile-info">
                                <h2>{profileData.username}</h2>
                            </div>
                        </div>
                
                        <div className="profile-details">
                            <div className="profile-section">
                                <h3>Favorite Anime</h3>
                                <p>{profileData.favoriteAnime || 'Not specified'}</p>
                            </div>

                            <div className="profile-section">
                                <h3>Favorite Manga</h3>
                                <p>{profileData.favoriteManga || 'Not specified'}</p>
                            </div>
                            
                            <div className="profile-section">
                                <h3>Favorite Genres</h3>
                                <p>{Array.isArray(profileData.favoriteGenres) && profileData.favoriteGenres.length > 0 
                                    ? profileData.favoriteGenres.join(', ')
                                    : (profileData.favoriteGenres || 'Not specified')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeProfileTab === 'watched' && (
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
                        {animeWatchedView === 'rankings' && animeRankingOrder && animeRankingOrder.length > 0 && (
                            <div className="ranking" style={{ marginTop: '16px' }}>
                                <h3 style={{ color: '#667eea', marginBottom: '8px' }}>Rankings</h3>
                                <ul className="ranking-list">
                                    {animeRankingOrder.map((id, index) => {
                                        const item = (watchedItems || []).find(i => i.id === id);
                                        if (!item) return null;
                                        return (
                                            <li
                                                key={id}
                                                className="ranking-item"
                                                onClick={() => handleAddToMyList(item)}
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
                                    {watchedItems.length === 0 ? (
                                        <p className="tab-placeholder">
                                            No anime found.
                                        </p>
                                    ) : (
                                        watchedItems.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className="watched-item-card" 
                                                onClick={() => handleAddToMyList(item)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to add to your list"
                                            >
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
                                    {mangaRankingOrder.map((id, index) => {
                                        const item = (watchedItems || []).find(i => i.id === id);
                                        if (!item) return null;
                                        return (
                                            <li
                                                key={id}
                                                className="ranking-item"
                                                onClick={() => handleAddToMyList(item)}
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
                                {watchedItems.length === 0 ? (
                                    <p className="tab-placeholder">
                                        No manga found.
                                    </p>
                                ) : (
                                    watchedItems.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="watched-item-card" 
                                            onClick={() => handleAddToMyList(item)}
                                            style={{ cursor: 'pointer' }}
                                            title="Click to add to your list"
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