import React, {useState, useEffect} from "react";
import '../css/profile.css';

const genres = [
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

const Profile = ({ onLogin }) => {
    const [id, setId] = useState(null);
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signupEmailAddress, setSignupEmailAddress] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    // const [signupAge, setSignupAge] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingItem, setIsLoadingItem] = useState(false);
    const [signupButtonClicked, setSignupButtonClicked] = useState(false);
    const [LoggedIn, setLoggedIn] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const [profileData, setProfileData] = useState({
        bio: '',
        avatarUrl: '',
        emailAddress: '',
        username: '',
        favoriteAnime: '',
        favoriteManga: '',
        favoriteGenres: [],
        // age: ''
    });
    const [activeProfileTab, setActiveProfileTab] = useState('profile');
    const [userList, setUserList] = useState([]);
    const [activeListTab, setActiveListTab] = useState('anime');
    const [selectedListItem, setSelectedListItem] = useState(null);
    const [watchedItems, setWatchedItems] = useState([]);
    const [isLoadingWatched, setIsLoadingWatched] = useState(false);
    const [watchedStatusFilter, setWatchedStatusFilter] = useState('ALL');
    const [selectedWatchedItem, setSelectedWatchedItem] = useState(null);
    const [editWatchedData, setEditWatchedData] = useState({});
    const [listItemsAsInProgress, setListItemsAsInProgress] = useState(new Set());
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
    const [originalUsername, setOriginalUsername] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState(true);
    const [originalEmail, setOriginalEmail] = useState('');
    const [editedProfileData, setEditedProfileData] = useState({
        bio: '',
        avatarUrl: '',
        emailAddress: '',
        username: '',
        // favoriteAnime: '',
        // favoriteManga: '',
        favoriteGenres: [],
        // age: ''
    });

    // Drag-and-drop ranking state for all watched titles
    const [animeRankingOrder, setAnimeRankingOrder] = useState([]);
    const [mangaRankingOrder, setMangaRankingOrder] = useState([]);
    const [draggingAnimeIndex, setDraggingAnimeIndex] = useState(null);
    const [draggingMangaIndex, setDraggingMangaIndex] = useState(null);
    
    // View switching state
    const [animeWatchedView, setAnimeWatchedView] = useState('watched'); // 'watched' or 'rankings'
    const [mangaReadView, setMangaReadView] = useState('read'); // 'watched' or 'rankings'

    // Initialize ranking orders when watched items change
    useEffect(() => {
        // For anime: get all anime items (any status)
        const animeIds = (watchedItems || [])
            .map(it => it.id);
        const savedAnimeOrder = JSON.parse(localStorage.getItem('animeRankingOrder') || '[]');
        const reconciledAnimeOrder = [
            ...savedAnimeOrder.filter(id => animeIds.includes(id)),
            ...animeIds.filter(id => !savedAnimeOrder.includes(id))
        ];
        setAnimeRankingOrder(reconciledAnimeOrder);

        // For manga: get all manga items (any status)
        const mangaIds = (watchedItems || [])
            .map(it => it.id);
        const savedMangaOrder = JSON.parse(localStorage.getItem('mangaRankingOrder') || '[]');
        const reconciledMangaOrder = [
            ...savedMangaOrder.filter(id => mangaIds.includes(id)),
            ...mangaIds.filter(id => !savedMangaOrder.includes(id))
        ];
        setMangaRankingOrder(reconciledMangaOrder);
    }, [watchedItems]);

    const reorderArray = (arr, fromIndex, toIndex) => {
        if (fromIndex === null || toIndex === null || fromIndex === toIndex) return arr;
        const next = arr.slice();
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
    };

    const handleAnimeDrop = (toIndex) => {
        setAnimeRankingOrder(prev => {
            const next = reorderArray(prev, draggingAnimeIndex, toIndex);
            localStorage.setItem('animeRankingOrder', JSON.stringify(next));
            return next;
        });
        setDraggingAnimeIndex(null);
    };

    const handleMangaDrop = (toIndex) => {
        setMangaRankingOrder(prev => {
            const next = reorderArray(prev, draggingMangaIndex, toIndex);
            localStorage.setItem('mangaRankingOrder', JSON.stringify(next));
            return next;
        });
        setDraggingMangaIndex(null);
    };

    useEffect(() => {
        // Check if user is already logged in on mount
        if (accessToken && localStorage.getItem('userId') != null) {
            const storedUserId = parseInt(localStorage.getItem('userId'), 10);
            setLoggedIn(true);
            setId(storedUserId);
            handleGetProfile(storedUserId);
        }
    }, []);

    useEffect(() => {
        // Auto-refresh list when list tab is active or list type changes
        if (LoggedIn && id && activeProfileTab === 'list') {
            handleGetUserList(activeListTab);
        }

        if (LoggedIn && id && activeProfileTab === 'profile'){
            handleGetProfile(id);
        }
    }, [activeProfileTab, activeListTab]);

    useEffect(() => {
        // Auto-load watched items when watched/read tabs are active
        if (LoggedIn && id && (activeProfileTab === 'watched' || activeProfileTab === 'read')) {
            const type = activeProfileTab === 'watched' ? 'ANIME' : 'MANGA';
            handleGetWatchedItems(type);
        }
    }, [activeProfileTab, watchedStatusFilter]);

    const parseErrorResponse = async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (err) {
            return { error: text || response.statusText || 'Request failed' };
        }
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            setError('Session expired. Please log in again.');
            handleLogout();
            return null;
        }

        try {
            const response = await fetch('/api/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            const newAccessToken = data.accessToken;

            // Update tokens in state and storage
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);

            return newAccessToken;
        } catch (err) {
            setError('Session expired. Please log in again.');
            handleLogout();
            return null;
        }
    };

    const makeAuthenticatedRequest = async (url, options = {}) => {
        let currentToken = accessToken;

        const requestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'Authorization': `Bearer ${currentToken}`
            }
        };

        let response = await fetch(url, requestOptions);

        // If 401, try to refresh token and retry
        if (response.status === 401 && refreshToken) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                currentToken = newToken;
                requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, requestOptions);
            }
        }

        return response;
    };

    const handleGetUserList = async (type) => {
        setIsLoadingList(true);
        setError(null);

        try {
            const safeId = localStorage.getItem('userId');
            const response = await makeAuthenticatedRequest(`/api/user/${safeId}/list/${type}`);
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch user list');
            }
            const data = await response.json();
            setUserList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleListItemClick = async (item) => {
        if (!item.anilistId) {
            setError('Unable to load details for this item');
            return;
        }

        setIsLoadingItem(true);
        setError(null);

        try {
            const response = await fetch(`/api/search/${item.anilistId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }
            const fullItemData = await response.json();
            setSelectedListItem(fullItemData[0]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingItem(false);
        }
    };

    const fetchWatchedItemsData = async (type) => {
        try {
            const safeId = localStorage.getItem('userId');
            let url = `/api/user/${safeId}/watched/type/${type}`;
            
            // Add status filter if not ALL
            if (watchedStatusFilter !== 'ALL') {
                url = `/api/user/${safeId}/watched/type/${type}/status/${watchedStatusFilter}`;
            }

            const response = await makeAuthenticatedRequest(url);
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch watched items');
            }
            return await response.json();
        } catch (err) {
            setError(err.message);
            return [];
        }
    };

    const handleGetWatchedItems = async (type) => {
        setIsLoadingWatched(true);
        setError(null);

        try {
            const data = await fetchWatchedItemsData(type);
            setWatchedItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingWatched(false);
        }
    };

    const handleUpdateWatchedItem = async (itemId, updatedData) => {
        try {
            const response = await makeAuthenticatedRequest(
                `/api/user/watched/${itemId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ ...updatedData, userId: id })
                }
            );

            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to update item');
            }

            // Refresh the watched items list
            const type = activeProfileTab === 'watched' ? 'ANIME' : 'MANGA';
            handleGetWatchedItems(type);
            setSelectedWatchedItem(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveWatchedItem = async (anilistId) => {
        if (!window.confirm('Are you sure you want to remove this item?')) {
            return;
        }

        try {
            const safeId = localStorage.getItem('userId');
            const safeAnilistId = encodeURIComponent(anilistId);
            const response = await makeAuthenticatedRequest(
                `/api/user/${safeId}/watched/${safeAnilistId}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to remove item');
            }

            // Refresh the watched items list
            const type = activeProfileTab === 'watched' ? 'ANIME' : 'MANGA';
            handleGetWatchedItems(type);
            setSelectedWatchedItem(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddListItemToInProgress = async (item) => {
        if (!item || !item.anilistId) {
            setError('Cannot add item: Invalid data');
            return;
        }

        try {
            const mediaType = activeListTab === 'anime' ? 'ANIME' : 'MANGA';
            const statusType = activeListTab === 'anime' ? 'WATCHING' : 'READING';

            const response = await makeAuthenticatedRequest(
                `/api/user/watched/add`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: id,
                        type: mediaType,
                        title: item.title,
                        coverImageUrl: item.coverImageUrl,
                        anilistId: item.anilistId,
                        totalEpisodes: item.episodes || null,
                        totalChapters: item.chapters || null,
                        status: statusType
                    })
                }
            );

            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to add to in-progress list');
            }

            setError(null);
            setListItemsAsInProgress(prev => new Set([...prev, item.anilistId]));
            
            try {
                await makeAuthenticatedRequest(
                    `/api/user/list/remove`,
                    {
                        method: 'DELETE',
                        body: JSON.stringify({
                            userId: id,
                            anilistId: item.anilistId
                        })
                    }
                );
            } catch (err) {
                // Silently fail if item wasn't in list
                console.log('Item was not in list or already removed');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, password })
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Login failed');
            }
            const data = await response.json();

            // Store tokens and user info
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userId', data.userId);
            
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setLoggedIn(true);
            setId(data.userId);

            // Fetch full profile data
            const profileResponse = await makeAuthenticatedRequest(`/api/profile/${data.userId}`);
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setProfileData({
                    bio: profileData.bio || '',
                    avatarUrl: profileData.avatarUrl || '',
                    emailAddress: profileData.emailAddress || '',
                    username: profileData.username || '',
                    // favoriteAnime: profileData.favoriteAnime || '',
                    // favoriteManga: profileData.favoriteManga || '',
                    favoriteGenres: profileData.favoriteGenres || [],
                    // age: profileData.age || ''
                });
                setOriginalUsername(profileData.username || '');
                setOriginalEmail(profileData.emailAddress || '');
            }

            onLogin(data.userId); // Notify parent component of login
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (signupPassword !== signupConfirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailAddress: signupEmailAddress,
                    username: signupUsername,
                    password: signupPassword,
                    // age: parseInt(signupAge, 10)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            const data = await response.json();
            alert('Registration successful! You can now log in.');
            setSignupButtonClicked(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const checkEmailAvailability = async (emailAddress) => {
        if (emailAddress.trim() === '') {
            setError(null);
            setIsEmailAvailable(true);
            return;
        }
        
        // If email hasn't changed from original, it's available
        if (emailAddress === originalEmail) {
            setError(null);
            setIsEmailAvailable(true);
            return;
        }
        
        try {
            const response = await fetch(`/api/register/check-email?emailAddress=${encodeURIComponent(emailAddress)}`);
            if (!response || typeof response.json !== 'function') {
                setIsEmailAvailable(false);
                return;
            }
            const data = await response.json();
            if (!data.available) {
                setError('Email address is already being used on a different account');
                setIsEmailAvailable(false);
            } else {
                setError(null);
                setIsEmailAvailable(true);
            }
        } catch (err) {
            console.error('Error checking email availability:', err);
            setIsEmailAvailable(false);
        }
    };

    const checkUsernameAvailability = async (username) => {
        if (username.trim() === '') {
            setError(null);
            setIsUsernameAvailable(true);
            return;
        }
        
        // If username hasn't changed from original, it's available
        if (username === originalUsername) {
            setError(null);
            setIsUsernameAvailable(true);
            return;
        }
        
        try {
            const response = await fetch(`/api/register/check-username?username=${encodeURIComponent(username)}`);
            if (!response || typeof response.json !== 'function') {
                setIsUsernameAvailable(false);
                return;
            }
            const data = await response.json();
            if (!data.available) {
                setError('Username is already taken');
                setIsUsernameAvailable(false);
            } else {
                setError(null);
                setIsUsernameAvailable(true);
            }
        } catch (err) {
            console.error('Error checking username availability:', err);
            setIsUsernameAvailable(false);
        }
    };

    const clearInputs = () => {
        setEmailOrUsername('');
        setPassword('');
        setSignupEmailAddress('');
        setSignupUsername('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setError(null);
    };

    const switchToSignup = () => {
        clearInputs();
        setSignupButtonClicked(true);
        setError(null);
    };

    const switchToLogin = () => {
        clearInputs();
        setSignupButtonClicked(false);
        setError(null);
    }

    const handleGetProfile = async (userId) => {
        setIsLoading(true);
        setError(null);

        try {
            // Load watched items directly (without state updates) so we can get top rated anime/manga
            const animeData = await fetchWatchedItemsData('ANIME');
            const mangaData = await fetchWatchedItemsData('MANGA');
            
            // Get top anime from the fetched data
            const animeRankingOrder = JSON.parse(localStorage.getItem('animeRankingOrder') || '[]');
            const topAnime = animeRankingOrder.length > 0 
                ? animeData.find(i => i.id === animeRankingOrder[0])
                : null;
            
            // Get top manga from the fetched data
            const mangaRankingOrder = JSON.parse(localStorage.getItem('mangaRankingOrder') || '[]');
            const topManga = mangaRankingOrder.length > 0 
                ? mangaData.find(i => i.id === mangaRankingOrder[0])
                : mangaData[0];
            
            const safeId = encodeURIComponent(userId);
            const response = await makeAuthenticatedRequest(`/api/profile/${safeId}`);
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch profile');
            }
            const data = await response.json();
            setProfileData({
                bio: data.bio || '',
                avatarUrl: data.avatarUrl || '',
                emailAddress: data.emailAddress || '',
                username: data.username || '',
                favoriteAnime: topAnime?.title || '',
                favoriteManga: topManga?.title || '',
                favoriteGenres: data.favoriteGenres || [],
                // age: data.age || ''
            });
            setOriginalUsername(data.username || '');
            setOriginalEmail(data.emailAddress || '');
            setIsUsernameAvailable(true);
            setIsEmailAvailable(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const safeId = localStorage.getItem('userId');
            const response = await makeAuthenticatedRequest(`/api/profile/${safeId}`, {
                method: 'PUT',
                body: JSON.stringify(editedProfileData)
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to update profile');
            }
            const data = await response.json();

            setIsEditing(false);
            handleGetProfile(id);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavoriteGenre = (genre) => {
        setEditedProfileData(prev => {
            const current = prev.favoriteGenres || [];
            const exists = current.includes(genre);
            const nextGenres = exists ? current.filter(g => g !== genre) : [...current, genre];
            return { ...prev, favoriteGenres: nextGenres };
        });
    };

    const handleLogout = () => {
        setLoggedIn(false);
        clearInputs();
        setProfileData({
            bio: '',
            avatarUrl: '',
            emailAddress: '',
            username: '',
            favoriteAnime: '',
            favoriteManga: '',
            favoriteGenres: [],
            // age: ''
        });
        setEditedProfileData({
            bio: '',
            avatarUrl: '',
            emailAddress: '',
            username: '',
            favoriteAnime: '',
            favoriteManga: '',
            favoriteGenres: [],
            // age: ''
        });
        setIsEditing(false);
        setId(null);
        setAccessToken(null);
        setRefreshToken(null);
        setOriginalEmail('');
        setOriginalUsername('');
        
        // Clear tokens from storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        
        onLogin(null); // Notify parent component of logout
    };

    return (
        !LoggedIn ? (
            !signupButtonClicked ? (
                <div className="login-container" data-testid="login-container">
                    <h2>Login</h2>
                    <form onSubmit={handleLoginSubmit} className="login-form" data-testid="login-form">
                        <input
                            type="text"
                            placeholder="Email or Username"
                            value={emailOrUsername}
                            onChange={(e) => { setEmailOrUsername(e.target.value)}}
                            required
                            data-testid="login-email-input"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-testid="login-password-input"
                        />
                        <button id="login-button" type="submit" disabled={isLoading} data-testid="login-submit-button">
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        {error && <p className="error-message" data-testid="login-error">{error}</p>}
                    </form>
                    <button className="signup-switch-button" data-testid="switch-to-signup" onClick={() => { switchToSignup(); setError(null); }}>
                        Sign Up
                    </button>
                </div>
            ) : (
                <div className="signup-container" data-testid="signup-container">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSignupSubmit} className="signup-form" data-testid="signup-form">
                        <input
                            type="text"
                            placeholder="Email Address"
                            value={signupEmailAddress}
                            onChange={(e) => { setSignupEmailAddress(e.target.value); checkEmailAvailability(e.target.value); } }
                            required
                            data-testid="signup-email-input"
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={signupUsername}
                            onChange={(e) => { setSignupUsername(e.target.value);  checkUsernameAvailability(e.target.value); }}
                            required
                            data-testid="signup-username-input"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            data-testid="signup-password-input"
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                            data-testid="signup-confirm-password-input"
                        />
                        <div className="password-requirements">
                            Password must be 8 or more characters, contain uppercase & lowercase letters, a number, & a special character.
                        </div>
                        {/* <input
                            type="number"
                            placeholder="Age"
                            value={signupAge}
                            onChange={(e) => setSignupAge(e.target.value)}
                            min="1"
                            max="120"
                            required
                            data-testid="signup-age-input"
                        /> */}
                        {/* <div className="age-note">Used to provide age-appropriate content.</div> */}
                        <button id="signup-button" type="submit" disabled={isLoading || !isEmailAvailable || !isUsernameAvailable} data-testid="signup-submit-button">
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                        {error && <p className="error-message" data-testid="signup-error">{error}</p>}
                        <button className="signup-switch-button" data-testid="back-to-login" onClick={() => { switchToLogin(); setError(null); }}>
                            Back to Login
                        </button>
                    </form>
                </div>
            )
        ) : (
            <div className="profile-logged-in" data-testid="profile-logged-in">
                <div className="profile-tabs">
                    <button 
                        className={`profile-tab-button ${activeProfileTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveProfileTab('profile')}
                    >
                        Profile
                    </button>
                    <button 
                        className={`profile-tab-button ${activeProfileTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveProfileTab('list')}
                    >
                        My List
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
                    {activeProfileTab === 'list' && (
                        <div className="list-tab">
                            <div className="list-tab-buttons">
                                <button onClick={() => setActiveListTab('anime')} data-testid="list-anime-tab" className={`anime-tab-button ${activeListTab === 'anime' ? 'active' : ''}`}>Anime</button>
                                <button onClick={() => setActiveListTab('manga')} data-testid="list-manga-tab" className={`manga-tab-button ${activeListTab === 'manga' ? 'active' : ''}`}>Manga</button>
                            </div>
                            {error && !selectedListItem ? (
                                <p className="error-message" data-testid="list-error">{error}</p>
                            ) : ( isLoadingList ? (
                                <div className="loading-placeholder" style={{ textAlign: 'center', padding: '80px 40px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your list...</p>
                                </div>
                            ) : (
                                <div className="user-lists" data-testid="user-lists">
                                    {userList.length === 0 ? (
                                        <p className="tab-placeholder">Your list is empty. Start adding {activeListTab.toLowerCase()} to your {activeListTab.toLowerCase() == 'anime' ? 'watch' : 'reading'} list using the <strong>Search</strong> or <strong>Discover</strong> tabs!</p>
                                    ) : (
                                        <ul className="user-list">
                                            {[...userList]
                                                .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
                                                .map((item) => (
                                                <li key={item.id} data-testid={`list-item-${item.id}`} className="list-item" onClick={() => handleListItemClick(item)}>
                                                    {item.coverImageUrl && (
                                                        <img src={item.coverImageUrl} alt={item.title} className="item-cover-image" />
                                                    )}
                                                    <div className="item-info">
                                                        <span className="item-title">{item.title}</span>
                                                    </div>
                                                    <div className="list-item-buttons" onClick={(e) => e.stopPropagation()}>
                                                        {listItemsAsInProgress.has(item.anilistId) ? (
                                                            <button className="in-progress-button added">✓ In Progress</button>
                                                        ) : (
                                                            <button 
                                                                className="in-progress-button"
                                                                onClick={() => handleAddListItemToInProgress(item)}
                                                            >
                                                                + Mark as In Progress
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                            {selectedListItem && (
                                <div className="modal-overlay" onClick={() => setSelectedListItem(null)}>
                                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setSelectedListItem(null)} className="modal-close">✕</button>
                                        {isLoadingItem ? (
                                            <div className="detail-inner" style={{ textAlign: 'center', padding: '80px 40px' }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading details...</p>
                                            </div>
                                        ) : (
                                            <div className="detail-view">
                                                <div className="detail-inner">
                                                    <div className="media-type">{selectedListItem.type} {selectedListItem.format != null && selectedListItem.format !== selectedListItem.type && `• ${selectedListItem.format}`}</div>
                                                    <h2>{selectedListItem.title?.english || selectedListItem.title?.romaji || selectedListItem.title?.nativeTitle || 'Error Getting Title'}</h2>
                                                    {selectedListItem.coverImageUrl && <img src={selectedListItem.coverImageUrl} alt={selectedListItem.title?.english || selectedListItem.title?.romaji} className="detail-cover-image" />}
                                                    <div className="detail-info">
                                                        {selectedListItem.year && <span>Year: {selectedListItem.year}</span>}
                                                        {selectedListItem.averageScore && <span> IMDB Score: {(selectedListItem.averageScore / 10).toFixed(1)}/10</span>}
                                                    </div>
                                                {selectedListItem.description && (
                                                    <div className="description" data-testid="item-description">
                                                        <h4>Description</h4>
                                                        <div dangerouslySetInnerHTML={{ __html: selectedListItem.description }} />
                                                    </div>
                                                )}
                                                {selectedListItem.episodes && <div><strong>Episodes:</strong> {selectedListItem.episodes}</div>}
                                                {selectedListItem.chapters && <div><strong>Chapters:</strong> {selectedListItem.chapters}</div>}
                                                {selectedListItem.volumes && <div><strong>Volumes:</strong> {selectedListItem.volumes}</div>}
                                                {selectedListItem.genres && selectedListItem.genres.length > 0 && (
                                                    <div className="genres">
                                                        <div className="genre-list">
                                                            <strong>Genres:</strong> {selectedListItem.genres.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedListItem.studios && selectedListItem.studios.length > 0 && (
                                                    <div className="studios">
                                                        <strong>Studios:</strong> {selectedListItem.studios.join(', ')}
                                                    </div>
                                                )}
                                                {selectedListItem.synonyms && selectedListItem.synonyms.length > 0 && (
                                                    <div className="synonyms">
                                                        <strong>Other Names:</strong> {selectedListItem.synonyms.join(', ')}
                                                    </div>
                                                )}
                                                {selectedListItem.status && <div className={`status status-${selectedListItem.status.toLowerCase()}`}><strong>Status:</strong> {selectedListItem.status.replace(/_/g, ' ')}</div>}
                                                {selectedListItem.isAdult && <div className="is-adult">⚠️ Adult Content</div>}
                                                {selectedListItem.nextAiringEpisode && (
                                                    <div className="next-airing">
                                                        <strong>Next Episode:</strong> Episode {selectedListItem.nextAiringEpisode.episode} releases on {new Date(Date.now() + selectedListItem.nextAiringEpisode.timeUntilAiring * 1000).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                            {/* Ranking (All Anime) - Show only in rankings view */}
                            {animeWatchedView === 'rankings' && animeRankingOrder && animeRankingOrder.length > 0 && (
                                <div className="ranking" style={{ marginTop: '16px' }}>
                                    <h3 style={{ color: '#667eea', marginBottom: '8px' }}>Your Rankings</h3>
                                    <ul className="ranking-list">
                                        {animeRankingOrder.map((id, index) => {
                                            const item = (watchedItems || []).find(i => i.id === id);
                                            if (!item) return null;
                                            return (
                                                <li
                                                    key={id}
                                                    className="ranking-item"
                                                    draggable
                                                    onDragStart={() => setDraggingAnimeIndex(index)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={() => handleAnimeDrop(index)}
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

                            {/* Watched grid - Show only in watched view */}
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
                                            No anime found. Add anime to your watched list from the <strong>My List</strong> or <strong>Search</strong> tabs!
                                        </p>
                                    ) : (
                                        watchedItems.map((item) => (
                                            <div key={item.id} className="watched-item-card" onClick={() => {
                                                setSelectedWatchedItem(item);
                                                setEditWatchedData({
                                                    status: item.status,
                                                    episodesWatched: item.episodesWatched || 0,
                                                    totalEpisodes: item.totalEpisodes || 0,
                                                    rating: item.rating || '',
                                                    notes: item.notes || ''
                                                });
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

                            {selectedWatchedItem && (
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
                                                    <select 
                                                        value={editWatchedData.status} 
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, status: e.target.value})}
                                                        className="status-select"
                                                    >
                                                        <option value="WATCHING">Watching</option>
                                                        <option value="COMPLETED">Completed</option>
                                                        <option value="ON_HOLD">On Hold</option>
                                                        <option value="DROPPED">Dropped</option>
                                                        <option value="PLAN_TO_WATCH">Plan to Watch</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Episodes Watched</label>
                                                    <div className="progress-input-group">
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={editWatchedData.totalEpisodes || 9999}
                                                            value={editWatchedData.episodesWatched}
                                                            onChange={(e) => setEditWatchedData({...editWatchedData, episodesWatched: parseInt(e.target.value) || 0})}
                                                        />
                                                        <span className="progress-separator">/</span>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={editWatchedData.totalEpisodes}
                                                            onChange={(e) => setEditWatchedData({...editWatchedData, totalEpisodes: parseInt(e.target.value) || 0})}
                                                            placeholder="Total"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Rating (0-10)</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max="10"
                                                        step="0.1"
                                                        value={editWatchedData.rating}
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, rating: parseFloat(e.target.value) || ''})}
                                                        placeholder="Rate this anime"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Notes</label>
                                                    <textarea 
                                                        value={editWatchedData.notes}
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, notes: e.target.value})}
                                                        placeholder="Your thoughts about this anime..."
                                                        rows="4"
                                                        maxLength="1000"
                                                    />
                                                    <span className="char-count">{(editWatchedData.notes || '').length}/1000</span>
                                                </div>

                                                <div className="watched-detail-actions">
                                                    <button 
                                                        onClick={() => handleUpdateWatchedItem(selectedWatchedItem.id, editWatchedData)}
                                                        className="save-button"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveWatchedItem(selectedWatchedItem.anilistId)}
                                                        className="remove-button"
                                                    >
                                                        Remove from List
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                            {/* Ranking (All Manga) - Show only in rankings view */}
                            {mangaReadView === 'rankings' && mangaRankingOrder && mangaRankingOrder.length > 0 && (
                                <div className="ranking" style={{ marginTop: '16px' }}>
                                    <h3 style={{ color: '#667eea', marginBottom: '8px' }}>Your Rankings</h3>
                                    <ul className="ranking-list">
                                        {mangaRankingOrder.map((id, index) => {
                                            const item = (watchedItems || []).find(i => i.id === id);
                                            if (!item) return null;
                                            return (
                                                <li
                                                    key={id}
                                                    className="ranking-item"
                                                    draggable
                                                    onDragStart={() => setDraggingMangaIndex(index)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={() => handleMangaDrop(index)}
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
                                            No manga found. Add manga to your read list from the <strong>My List</strong> or <strong>Search</strong> tabs!
                                        </p>
                                    ) : (
                                        watchedItems.map((item) => (
                                            <div key={item.id} className="watched-item-card" onClick={() => {
                                                setSelectedWatchedItem(item);
                                                setEditWatchedData({
                                                    status: item.status,
                                                    chaptersRead: item.chaptersRead || 0,
                                                    totalChapters: item.totalChapters || 0,
                                                    rating: item.rating || '',
                                                    notes: item.notes || ''
                                                });
                                            }}>
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

                            {selectedWatchedItem && (
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
                                                    <select 
                                                        value={editWatchedData.status} 
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, status: e.target.value})}
                                                        className="status-select"
                                                    >
                                                        <option value="READING">Reading</option>
                                                        <option value="COMPLETED">Completed</option>
                                                        <option value="ON_HOLD">On Hold</option>
                                                        <option value="DROPPED">Dropped</option>
                                                        <option value="PLAN_TO_READ">Plan to Read</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Chapters Read</label>
                                                    <div className="progress-input-group">
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={editWatchedData.totalChapters || 9999}
                                                            value={editWatchedData.chaptersRead}
                                                            onChange={(e) => setEditWatchedData({...editWatchedData, chaptersRead: parseInt(e.target.value) || 0})}
                                                        />
                                                        <span className="progress-separator">/</span>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={editWatchedData.totalChapters}
                                                            onChange={(e) => setEditWatchedData({...editWatchedData, totalChapters: parseInt(e.target.value) || 0})}
                                                            placeholder="Total"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Rating (0-10)</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max="10"
                                                        step="0.1"
                                                        value={editWatchedData.rating}
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, rating: parseFloat(e.target.value) || ''})}
                                                        placeholder="Rate this manga"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Notes</label>
                                                    <textarea 
                                                        value={editWatchedData.notes}
                                                        onChange={(e) => setEditWatchedData({...editWatchedData, notes: e.target.value})}
                                                        placeholder="Your thoughts about this manga..."
                                                        rows="4"
                                                        maxLength="1000"
                                                    />
                                                    <span className="char-count">{(editWatchedData.notes || '').length}/1000</span>
                                                </div>

                                                <div className="watched-detail-actions">
                                                    <button 
                                                        onClick={() => handleUpdateWatchedItem(selectedWatchedItem.id, editWatchedData)}
                                                        className="save-button"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveWatchedItem(selectedWatchedItem.anilistId)}
                                                        className="remove-button"
                                                    >
                                                        Remove from List
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'profile' && (
                        !isEditing ? (
                            <div className="profile-view" data-testid="profile-view">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        {profileData.avatarUrl ? (
                                            <img src={profileData.avatarUrl} alt={`${profileData.username}'s avatar`} className="avatar-image" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {profileData.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{profileData.username}</h2>
                                        {/* {profileData.age && <p className="profile-age">Age: {profileData.age}</p>} */}
                                        <div className="profile-actions">
                                            <button onClick={() => { setEditedProfileData(profileData); setIsEditing(true)}} className="edit-profile-button" data-testid="edit-profile-button">
                                                Edit Profile
                                            </button>
                                            <button onClick={handleLogout} className="logout-button" data-testid="logout-button">
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        
                                <div className="profile-details">
                                    <div className="profile-section">
                                        <h3>Email Address</h3>
                                        <p>{profileData.emailAddress || 'No email address provided.'}</p>
                                    </div>
                                    
                                    {/* <div className="profile-section">
                                        <h3>Bio</h3>
                                        <p>{profileData.bio || 'No bio yet. Click "Edit Profile" to add one!'}</p>
                                    </div> */}
                                    
                                    <div className="profile-section">
                                        <h3>Favorite Anime</h3>
                                        <p>{profileData.favoriteAnime || 'Your #1 rated anime from the rankings tab will appear here'}</p>
                                    </div>

                                    <div className="profile-section">
                                        <h3>Favorite Manga</h3>
                                        <p>{profileData.favoriteManga || 'Your #1 rated manga from the rankings tab will appear here'}</p>
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
                        ) : (
                            <div className="profile-edit" data-testid="profile-edit">
                                <h2>Edit Profile</h2>
                                <form onSubmit={handleProfileUpdate} className="profile-edit-form" data-testid="profile-edit-form">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your username"
                                            value={editedProfileData.username}
                                            onChange={(e) => {
                                                setEditedProfileData({...editedProfileData, username: e.target.value});
                                                checkUsernameAvailability(e.target.value);
                                            }}
                                            required
                                            data-testid="username-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Avatar URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/your-avatar.jpg"
                                            value={editedProfileData.avatarUrl}
                                            onChange={(e) => setEditedProfileData({...editedProfileData, avatarUrl: e.target.value})}
                                            data-testid="avatar-url-input"
                                        />
                                        {editedProfileData.avatarUrl && (
                                            <div className="avatar-preview">
                                                <img src={editedProfileData.avatarUrl} alt="Avatar preview" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <textarea
                                            placeholder="Enter your email address"
                                            value={editedProfileData.emailAddress}
                                            onChange={(e) => {
                                                setEditedProfileData({...editedProfileData, emailAddress: e.target.value});
                                                checkEmailAvailability(e.target.value);
                                            }}
                                            required
                                            data-testid="email-textarea"
                                        />
                                    </div>
                                    
                                    {/* <div className="form-group">
                                        <label>Bio</label>
                                        <textarea
                                            placeholder="Tell us about yourself..."
                                            value={editedProfileData.bio}
                                            onChange={(e) => setEditedProfileData({...editedProfileData, bio: e.target.value})}
                                            maxLength="500"
                                            rows="4"
                                            data-testid="bio-textarea"
                                        />
                                        <span className="char-count">{editedProfileData.bio.length}/500</span>
                                    </div> */}
                                    
                                    {/* <div className="form-group">
                                        <label>Favorite Anime</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Attack on Titan"
                                            value={editedProfileData.favoriteAnime}
                                            onChange={(e) => setEditedProfileData({...editedProfileData, favoriteAnime: e.target.value})}
                                            data-testid="favorite-anime-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Favorite Manga</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., One Piece"
                                            value={editedProfileData.favoriteManga}
                                            onChange={(e) => setEditedProfileData({...editedProfileData, favoriteManga: e.target.value})}
                                            data-testid="favorite-manga-input"
                                        />
                                    </div> */}
                                    
                                    <div className="form-group">
                                        <label>Favorite Genres</label>
                                        <div className="genre-button-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {genres.map((genre) => {
                                                const isSelected = (editedProfileData.favoriteGenres || []).includes(genre);
                                                return (
                                                    <button
                                                        key={genre}
                                                        type="button"
                                                        onClick={() => toggleFavoriteGenre(genre)}
                                                        className={`genre-button ${isSelected ? 'selected' : ''}`}
                                                        data-testid={`favorite-genre-${genre}`}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: '16px',
                                                            border: '1px solid #ccc',
                                                            backgroundColor: isSelected ? '#667eea' : '#f5f5f5',
                                                            color: isSelected ? '#fff' : '#333',
                                                            cursor: 'pointer',
                                                            transition: 'all 120ms ease',
                                                        }}
                                                    >
                                                        {genre}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            placeholder="Your age"
                                            value={editedProfileData.age}
                                            onChange={(e) => setEditedProfileData({...editedProfileData, age: e.target.value})}
                                            min="1"
                                            max="120"
                                            data-testid="age-input"
                                        />
                                    </div> */}
                                    
                                    {error && <p className="error-message" data-testid="profile-edit-error">{error}</p>}
                                    
                                    <div className="form-actions">
                                        <button type="submit" disabled={isLoading || !isUsernameAvailable || !isEmailAvailable} className="save-button" data-testid="save-profile-button">
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="cancel-button" data-testid="cancel-edit-button">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )
                    )}
                </div>
            </div>
        )
    );
}

export default Profile;