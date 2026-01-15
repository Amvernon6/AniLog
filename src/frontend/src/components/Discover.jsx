import React, { useState, useEffect, useRef } from 'react';
import '../css/discover.css';
import TitleDetail from './TitleDetail';

// const genres = [
//     'Action', 'Adventure', 'Comedy', 'Fantasy',
//     'Horror', 'Mystery', 'Psychological', 'Romance', 'Sports',
//     'Sci-Fi', 'Supernatural', 'Thriller'
// ];

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const Discover = () => {
    const getCachedData = () => {
        try {
            const cached = localStorage.getItem('discoverData');
            const timestamp = localStorage.getItem('discoverTimestamp');
            
            if (!cached || !timestamp) return null;
            
            const age = Date.now() - parseInt(timestamp);
            if (age > CACHE_DURATION) {
                // Cache expired
                localStorage.removeItem('discoverData');
                localStorage.removeItem('discoverTimestamp');
                return null;
            }
            
            const data = JSON.parse(cached);
            
            // Validate that cache has actual content
            const hasAnimeData = data?.anime?.trending?.length > 0 || 
                                data?.anime?.popular?.length > 0 || 
                                data?.anime?.new?.length > 0 ||
                                data?.anime?.comingSoon?.length > 0;
            const hasMangaData = data?.manga?.trending?.length > 0 || 
                                data?.manga?.popular?.length > 0 || 
                                data?.manga?.new?.length > 0 ||
                                data?.manga?.comingSoon?.length > 0;
            
            if (!hasAnimeData && !hasMangaData) {
                // Cache is empty, clear it
                localStorage.removeItem('discoverData');
                localStorage.removeItem('discoverTimestamp');
                return null;
            }
            
            return data;
        } catch (e) {
            console.error('Error reading cache:', e);
            return null;
        }
    };

    const saveToCache = (data) => {
        try {
            localStorage.setItem('discoverData', JSON.stringify(data));
            localStorage.setItem('discoverTimestamp', Date.now().toString());
        } catch (e) {
            console.error('Error saving to cache:', e);
        }
    };

    const [activeTab, setActiveTab] = useState('anime');
    const [addedItems, setAddedItems] = useState(new Set());
    const [inProgressItems, setInProgressItems] = useState(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const hasInitialized = useRef(false);
    
    // Try to load from cache first
    const cachedData = getCachedData();
    const [loading, setLoading] = useState(!cachedData);
    const [data, setData] = useState(cachedData || {
        anime: {
            trending: [],
            popular: [],
            new: [],
            comingSoon: []
            // genres: {}
        },
        manga: {
            trending: [],
            popular: [],
            new: [],
            comingSoon: []
            // genres: {}
        }
    });

    const fetchJson = async (url) => {
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error('Fetch error:', url, e);
            return [];
        }
    };

    useEffect(() => {
        // Prevent running effect twice in strict mode
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Get user lists on mount
        handleGetUserLists().catch(err => console.error('Error getting user lists:', err));

        // Check if we have valid cached data
        const cached = getCachedData();
        if (cached) {
            setData(cached);
            setLoading(false);
            return;
        }

        // No cache or expired - fetch fresh data
        const load = async () => {
            setLoading(true);

            // Core discovery lists (sequential to avoid rate limits)
            const trendingAnime = await fetchJson(`/api/search/trending/ANIME`);
            const trendingManga = await fetchJson(`/api/search/trending/MANGA`);
            const popularAnime = await fetchJson(`/api/search/popular/ANIME`);
            const popularManga = await fetchJson(`/api/search/popular/MANGA`);
            const newAnime = await fetchJson(`/api/search/new/ANIME`);
            const newManga = await fetchJson(`/api/search/new/MANGA`);
            const comingSoonAnime = await fetchJson(`/api/search/comingsoon/ANIME`);
            const comingSoonManga = await fetchJson(`/api/search/comingsoon/MANGA`);

            // // Genres (sequential per type)
            // const animeGenreData = {};
            // for (const genre of genres) {
            //     const animeRes = await fetchJson(`/api/search/genre/${genre}/ANIME`);
            //     animeGenreData[genre] = animeRes.slice(0, 20);
            // }

            // const mangaGenreData = {};
            // for (const genre of genres) {
            //     const mangaRes = await fetchJson(`/api/search/genre/${genre}/MANGA`);
            //     mangaGenreData[genre] = mangaRes.slice(0, 20);
            // }

            const fetchedData = {
                anime: {
                    trending: trendingAnime.slice(0, 20),
                    popular: popularAnime.slice(0, 20),
                    new: newAnime.slice(0, 20),
                    comingSoon: comingSoonAnime.slice(0, 20)
                    // genres: animeGenreData
                },
                manga: {
                    trending: trendingManga.slice(0, 20),
                    popular: popularManga.slice(0, 20),
                    new: newManga.slice(0, 20),
                    comingSoon: comingSoonManga.slice(0, 20)
                    // genres: mangaGenreData
                }
            };

            setData(fetchedData);
            saveToCache(fetchedData);
            setLoading(false);
        };

        load().catch(err => {
            console.error('Error fetching discover lists:', err);
            setLoading(false);
            setRefreshing(false);
        });
    }, []);

    const handleGetUserLists = async () => {
        const userId = localStorage.getItem('userId');
        setLoading(true);

        // Fetch user's lists if logged in
        if (userId) {
            const [animeList, mangaList, watchedItems] = await Promise.all([
                fetchJson(`/api/user/${userId}/list/ANIME`),
                fetchJson(`/api/user/${userId}/list/MANGA`),
                fetchJson(`/api/user/${userId}/watched`)
            ]);
            const addedItemsCombined = [...animeList, ...mangaList];
            setAddedItems(new Set(addedItemsCombined.map(item => item.anilistId)));
            setInProgressItems(new Set(watchedItems.map(item => item.anilistId)));
        }
    };

    const handleAddToList = (item) => {
        if (!item?.id) return;
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('You must be logged in to add items to your list.');
            return;
        }

        const mediaType = item.type === 'ANIME' ? 'ANIME' : 'MANGA';
        fetch('/api/user/list/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                type: mediaType,
                title: item.title?.english || item.title?.romaji || item.title?.nativeTitle,
                coverImageUrl: item.coverImageUrl,
                anilistId: item.id
            })
        }).then(response => {
            if (response.ok) {
                setAddedItems(prev => new Set([...prev, item.id]));
            }
        }).catch(err => console.error('Error adding to list:', err));
    };

    const handleRemoveFromList = (item) => {
        if (!item?.id) return;
        
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        fetch(`/api/user/list/remove/${userId}/${item.id}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                setAddedItems(prev => {
                    const updated = new Set(prev);
                    updated.delete(item.id);
                    return updated;
                });
            }
        }).catch(err => console.error('Error removing from list:', err));
    };

    const handleAddToInProgress = (item) => {
        if (!item?.id) return;
        
        const userId = localStorage.getItem('userId');
        const accessToken = localStorage.getItem('accessToken');
        if (!userId || !accessToken) {
            alert('You must be logged in to mark items as in-progress.');
            return;
        }

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
                setInProgressItems(prev => new Set([...prev, item.id]));
                handleRemoveFromList(item);
            }
        }).catch(err => console.error('Error adding to in-progress:', err));
    };

    const renderSection = (title, items) => {
        if (!items || items.length === 0) return null;
        
        return (
            <div className="discover-section">
                <h2 className="section-title">{title}</h2>
                <div className="items-row">
                    {items.map((item, index) => (
                        <div 
                            key={item.id || index} 
                            className="item-card"
                            data-testid="discover-card"
                            onClick={() => setSelectedItem(item)}
                            style={{ cursor: 'pointer' }}
                        >
                            {item.coverImageUrl && (
                                <img 
                                    src={item.coverImageUrl} 
                                    alt={item.title?.english || item.title?.romaji || 'Cover'} 
                                    className="item-image"
                                />
                            )}
                            <div className="item-info">
                                <h3 className="item-title">
                                    {item.title?.english || item.title?.romaji || item.title?.native || 'Untitled'}
                                </h3>
                                {item.averageScore && (
                                    <span className="item-score">
                                        ★ {(item.averageScore / 10).toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        const currentData = data[activeTab];
        
        return (
            <div className="discover-content">
                {renderSection(`Trending ${activeTab === 'anime' ? 'Anime' : 'Manga'}`, currentData.trending)}
                {renderSection(`Popular ${activeTab === 'anime' ? 'Anime' : 'Manga'}`, currentData.popular)}
                {renderSection(`New ${activeTab === 'anime' ? 'Anime' : 'Manga'}`, currentData.new)}
                {renderSection(`Coming Soon ${activeTab === 'anime' ? 'Anime' : 'Manga'}`, currentData.comingSoon)}
                {/* {genres.map(genre => (
                    <React.Fragment key={genre}>
                        {renderSection(`${genre}`, currentData.genres[genre])}
                    </React.Fragment>
                ))} */}
            </div>
        );
    };

    return (
        <div className="discover-container">
            {!selectedItem && (
                <div className="discover-header">
                    <div className="discover-tabs">
                        <button
                            className={`tab-button ${activeTab === 'anime' ? 'active' : ''}`}
                            onClick={() => setActiveTab('anime')}
                        >
                            Anime
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'manga' ? 'active' : ''}`}
                            onClick={() => setActiveTab('manga')}
                        >
                            Manga
                        </button>
                    </div>
                </div>
            )}

            {selectedItem ? (
                <TitleDetail
                    selectedItem={selectedItem}
                    onBack={() => setSelectedItem(null)}
                    inProgressItems={inProgressItems}
                    addedItems={addedItems}
                    onAddToList={handleAddToList}
                    onRemoveFromList={handleRemoveFromList}
                    onAddToInProgress={handleAddToInProgress}
                />
            ) : loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading discovery content...</p>
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default Discover;

