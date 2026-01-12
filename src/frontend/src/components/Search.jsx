import React, { useEffect, useRef, useState } from 'react';
import '../css/search.css';

const formatOptions = [
    'TV',
    'TV_SHORT',
    'MOVIE',
    'SPECIAL',
    'OVA',
    'ONA',
    'MUSIC',
    'MANGA',
    'NOVEL',
    'ONE_SHOT'
];

const typeOptions = [
    { value: '', label: 'Any' },
    { value: 'ANIME', label: 'Anime' },
    { value: 'MANGA', label: 'Manga' }
];

const genreOptions = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Psychological',
    'Romance',
    'Sports',
    'Sci-Fi',
    'Slice of Life',
    'Supernatural',
    'Thriller'
];

const statusOptions = [
    'RELEASING',
    'FINISHED',
    'NOT_YET_RELEASED',
    'CANCELLED',
    'HIATUS'
];

const sortOptions = [
    { value: 'POPULARITY_DESC', label: 'Popularity Descending' },
    { value: 'POPULARITY', label: 'Popularity Ascending' },
    { value: 'TRENDING_DESC', label: 'Trending Descending' },
    { value: 'TRENDING', label: 'Trending Ascending' },
    { value: 'SCORE_DESC', label: 'Rating Descending' },
    { value: 'SCORE', label: 'Rating Ascending' },
    { value: 'TITLE_ENGLISH_DESC', label: 'Title A-Z' },
    { value: 'TITLE_ENGLISH', label: 'Title Z-A' }
];

const Search = () => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [format, setFormat] = useState([]);
    const [status, setStatus] = useState([]);
    const [isAdult, setIsAdult] = useState(false);
    const [genres, setGenres] = useState([]);
    const [sortBy, setSortBy] = useState('POPULARITY_DESC');
    const [results, setResults] = useState([]);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formatOpen, setFormatOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);
    const [genreOpen, setGenreOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const formatRef = useRef(null);
    const typeRef = useRef(null);
    const genreRef = useRef(null);
    const statusRef = useRef(null);
    const sortRef = useRef(null);
    const toastTimerRef = useRef(null);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
    const [addedItems, setAddedItems] = useState(new Set());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formatRef.current && !formatRef.current.contains(event.target)) {
                setFormatOpen(false);
            }
            if (typeRef.current && !typeRef.current.contains(event.target)) {
                setTypeOpen(false);
            }
            if (genreRef.current && !genreRef.current.contains(event.target)) {
                setGenreOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setStatusOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setSortOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Fetch both anime and manga lists
        Promise.all([
            fetch(`/api/user/${userId}/list/ANIME`).then(res => res.ok ? res.json() : []),
            fetch(`/api/user/${userId}/list/MANGA`).then(res => res.ok ? res.json() : [])
        ]).then(([animeList, mangaList]) => {
            const allItems = [...animeList, ...mangaList];
            const itemIds = new Set(allItems.map(item => item.anilistId));
            setAddedItems(itemIds);
        }).catch(err => console.error('Error fetching user lists:', err));
    }, []);

    const toggleFormat = (value) => {
        setFormat((prev) => {
            const next = prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value];
            return next;
        });
    };

    const toggleGenre = (value) => {
        setGenres((prev) => {
            const next = prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value];
            return next;
        });
    };

    const toggleStatus = (value) => {
        setStatus((prev) => {
            const next = prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value];
            return next;
        });
    };

    const selectType = (value) => {
        setType(value);
    };

    const selectSort = (value) => {
        setSortBy(value);
    };

    const showToast = (message, type = 'info', duration = 3200) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToast({ message, type, visible: true });
        toastTimerRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, duration);
    };

    const handleSearch = async () => {
        if (!query.trim() 
            && !type.trim() 
            && format.length === 0
            && status.length === 0
            && genres.length === 0) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    type,
                    format,
                    status,
                    isAdult,
                    genres,
                    sortBy
                })
            });

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
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
                method: 'POST',
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

    return (
        <div className="search-page" data-testid="search-page">
            {selectedItem == null ? (
                <div className="search-bar">
                        <input
                            data-testid="search-input"
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSearchExecuted(false); }}
                            placeholder="Search for anime or manga..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <div className="search-filters">
                            <div className="filter-card">
                                <label className="filter-label">Type</label>
                                <div className="multi-dropdown" ref={typeRef}>
                                    <button
                                        data-testid="type-filter-button"
                                        type="button"
                                        className={`multi-dropdown-button ${type ? 'has-selection' : ''}`}
                                        onClick={() => setTypeOpen((open) => !open)}
                                    >
                                        {typeOptions.find(opt => opt.value === type)?.label || 'Any'}
                                        <span className="chevron">▾</span>
                                    </button>
                                    {typeOpen && (
                                        <div className="multi-dropdown-menu">
                                            {typeOptions.map((option) => {
                                                const selected = type === option.value;
                                                return (
                                                    <label key={option.value} className="multi-dropdown-item">
                                                        <button
                                                            type="button"
                                                            aria-pressed={selected}
                                                            className={selected ? 'selected' : ''}
                                                            onClick={() => selectType(option.value)}
                                                        >
                                                            <span className="option-label">{option.label}</span>
                                                            <span className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                                                        </button>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="filter-card">
                                <label className="filter-label">Format</label>
                                <div className="multi-dropdown" ref={formatRef}>
                                    <button
                                        data-testid="format-filter-button"
                                        type="button"
                                        className={`multi-dropdown-button ${format.length > 0 ? 'has-selection' : ''}`}
                                        onClick={() => setFormatOpen((open) => !open)}
                                    >
                                        {format.length ? `${format.length} selected` : 'Select formats'}
                                        <span className="chevron">▾</span>
                                    </button>
                                    {formatOpen && (
                                        <div className="multi-dropdown-menu">
                                            {formatOptions.map((option) => {
                                                const selected = format.includes(option);
                                                return (
                                                    <label key={option} className="multi-dropdown-item">
                                                        <button
                                                            type="button"
                                                            aria-pressed={selected}
                                                            className={selected ? 'selected' : ''}
                                                            onClick={() => toggleFormat(option)}
                                                        >
                                                            <span className="option-label">{option}</span>
                                                            <span className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                                                        </button>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="filter-card">
                                <label className="filter-label">Genre</label>
                                <div className="multi-dropdown" ref={genreRef}>
                                    <button
                                        data-testid="genre-filter-button"
                                        type="button"
                                        className={`multi-dropdown-button ${genres.length > 0 ? 'has-selection' : ''}`}
                                        onClick={() => setGenreOpen((open) => !open)}
                                    >
                                        {genres.length ? `${genres.length} selected` : 'Select genres'}
                                        <span className="chevron">▾</span>
                                    </button>
                                    {genreOpen && (
                                        <div className="multi-dropdown-menu">
                                            {genreOptions.map((option) => {
                                                const selected = genres.includes(option);
                                                return (
                                                    <label key={option} className="multi-dropdown-item">
                                                        <button
                                                            type="button"
                                                            aria-pressed={selected}
                                                            className={selected ? 'selected' : ''}
                                                            onClick={() => toggleGenre(option)}
                                                        >
                                                            <span className="option-label">{option}</span>
                                                            <span className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                                                        </button>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="filter-card">
                                <label className="filter-label">Status</label>
                                <div className="multi-dropdown" ref={statusRef}>
                                    <button
                                        data-testid="status-filter-button"
                                        type="button"
                                        className={`multi-dropdown-button ${status.length > 0 ? 'has-selection' : ''}`}
                                        onClick={() => setStatusOpen((open) => !open)}
                                    >
                                        {status.length ? `${status.length} selected` : 'Select status'}
                                        <span className="chevron">▾</span>
                                    </button>
                                    {statusOpen && (
                                        <div className="multi-dropdown-menu">
                                            {statusOptions.map((option) => {
                                                const selected = status.includes(option);
                                                return (
                                                    <label key={option} className="multi-dropdown-item">
                                                        <button
                                                            type="button"
                                                            aria-pressed={selected}
                                                            className={selected ? 'selected' : ''}
                                                            onClick={() => toggleStatus(option)}
                                                        >
                                                            <span className="option-label">{option.replace(/_/g, ' ')}</span>
                                                            <span className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                                                        </button>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="filter-card">
                                <label className="filter-label">Sort</label>
                                <div className="multi-dropdown" ref={sortRef}>
                                    <button
                                        data-testid="sort-filter-button"
                                        type="button"
                                        className="multi-dropdown-button has-selection"
                                        onClick={() => setSortOpen((open) => !open)}
                                    >
                                        {sortOptions.find(opt => opt.value === sortBy)?.label || 'Popularity Descending'}
                                        <span className="chevron">▾</span>
                                    </button>
                                    {sortOpen && (
                                        <div className="multi-dropdown-menu">
                                            {sortOptions.map((option) => {
                                                const selected = sortBy === option.value;
                                                return (
                                                    <label key={option.value} className="multi-dropdown-item">
                                                        <button
                                                            type="button"
                                                            aria-pressed={selected}
                                                            className={selected ? 'selected' : ''}
                                                            onClick={() => selectSort(option.value)}
                                                        >
                                                            <span className="option-label">{option.label}</span>
                                                            <span className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                                                        </button>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button id="search-button" data-testid="search-button" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                </div>
            ) : null}
            <div className="search-results">
                {selectedItem ? (
                    <div className="detail-view" data-testid="detail-view">
                        <button onClick={() => setSelectedItem(null)} className="back-button" data-testid="back-button">← Back</button>
                        <div className="detail-content">
                            <div className="media-type">{selectedItem.type} {selectedItem.format != null && selectedItem.format !== selectedItem.type && `• ${selectedItem.format}`}</div>
                            <h2>{selectedItem.title?.english || selectedItem.title?.romaji || selectedItem.title?.nativeTitle || 'Error Getting Title'}</h2>
                            {selectedItem.coverImageUrl && <img src={selectedItem.coverImageUrl} alt={selectedItem.title?.english || selectedItem.title?.romaji} className="detail-cover-image" />}
                            {addedItems.has(selectedItem.id) ? (
                                <button onClick={() => handleRemoveFromList(selectedItem)} className="add-to-list-button added">
                                    ✓ Added to List
                                </button>
                            ) : (
                                <button onClick={() => handleAddToList(selectedItem)} className="add-to-list-button">
                                    + Add to List
                                </button>
                            )}
                            <div className="detail-info">
                                {selectedItem.year && <span>Year: {selectedItem.year}</span>}
                                {selectedItem.averageScore && <span> IMDB Score: {(selectedItem.averageScore / 10).toFixed(1)}/10</span>}
                            </div>
                            {selectedItem.description && (
                                <div className="description">
                                    <h4>Description</h4>
                                    <div dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                                </div>
                            )}
                            {selectedItem.episodes && <div data-testid="episodes"><strong>Episodes:</strong> {selectedItem.episodes}</div>}
                            {selectedItem.chapters && <div data-testid="chapters"><strong>Chapters:</strong> {selectedItem.chapters}</div>}
                            {selectedItem.volumes && <div data-testid="volumes"><strong>Volumes:</strong> {selectedItem.volumes}</div>}
                            {selectedItem.genres && selectedItem.genres.length > 0 && (
                                <div className="genres">
                                    <div className="genre-list">
                                        <strong>Genres:</strong> {selectedItem.genres.join(', ')}
                                    </div>
                                </div>
                            )}
                            {selectedItem.studios && selectedItem.studios.length > 0 && (
                                <div className="studios">
                                    <strong>Studios:</strong> {selectedItem.studios.join(', ')}
                                </div>
                            )}
                            {selectedItem.synonyms && selectedItem.synonyms.length > 0 && (
                                <div className="synonyms">
                                    <strong>Other Names:</strong> {selectedItem.synonyms.join(', ')}
                                </div>
                            )}
                            <div className={`status status-${selectedItem.status.toLowerCase()}`}><strong>Status:</strong> {selectedItem.status.replace(/_/g, ' ')}</div>
                            {selectedItem.isAdult && <div className="is-adult" data-testid="adult-warning">⚠️ Adult Content</div>}
                            {selectedItem.nextAiringEpisode && (
                                <div className="next-airing">
                                    <strong>Next Episode:</strong> Episode {selectedItem.nextAiringEpisode.episode} releases on {new Date(Date.now() + selectedItem.nextAiringEpisode.timeUntilAiring * 1000).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                ) : results.length > 0 ? (
                    <ul data-testid="search-results-list">
                        {results.map((item, index) => (
                            <li key={index} data-testid={`result-item-${index}`} onClick={() => { setSelectedItem(item)}} className="result-item">
                                <div className="media-type">{item.type} {item.format !== null && item.format !== item.type && `• ${item.format}`}</div>
                                <h3>{item.title?.english || item.title?.romaji || item.title?.nativeTitle || 'Error Getting Title'}</h3>
                                {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.title?.english || item.title?.romaji || item.title?.nativeTitle} className="cover-image" />}
                                <div className="media-info">
                                    {item.year && <span>Year: {item.year}</span>}
                                    {item.averageScore && <span> Score: {(item.averageScore / 10).toFixed(1)}/10</span>}
                                </div>
                                <div className={`status status-${item.status.toLowerCase()}`}>{item.status.replace(/_/g, ' ')}</div>
                                <div className="click-hint">Click for more details</div>
                                {addedItems.has(item.id) ? (
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFromList(item); }} className="add-to-list-button added">
                                        ✓ Added
                                    </button>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); handleAddToList(item); }} className="add-to-list-button">
                                        + Add to List
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : query && !loading && searchExecuted ? (
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
};

export default Search;