import React, {useState, useEffect} from "react";
import '../css/profile.css';

const Profile = ({ onLogin }) => {
    const [id, setId] = useState(null);
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signupEmailAddress, setSignupEmailAddress] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupAge, setSignupAge] = useState('');
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
        favoriteGenre: '',
        age: ''
    });
    const [activeProfileTab, setActiveProfileTab] = useState('profile');
    const [userList, setUserList] = useState([]);
    const [activeListTab, setActiveListTab] = useState('anime');
    const [selectedListItem, setSelectedListItem] = useState(null);

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
    }, [activeProfileTab, activeListTab]);

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
            const safeId = encodeURIComponent(id);
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
                    favoriteAnime: profileData.favoriteAnime || '',
                    favoriteManga: profileData.favoriteManga || '',
                    favoriteGenre: profileData.favoriteGenre || '',
                    age: profileData.age || ''
                });
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
                    age: parseInt(signupAge, 10)
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
            return;
        }
        try {
            const response = await fetch(`/api/register/check-email?emailAddress=${encodeURIComponent(emailAddress)}`);
            const data = await response.json();
            if (!data.available) {
                setError('Email address is already being used on a different account');
            } else {
                setError(null);
            }
        } catch (err) {
            console.error('Error checking email availability:', err);
        }
    };

    const checkUsernameAvailability = async (username) => {
        if (username.trim() === '') {
            setError(null);
            return;
        }
        try {
            const response = await fetch(`/api/register/check-username?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            if (!data.available) {
                setError('Username is already taken');
            } else {
                setError(null);
            }
        } catch (err) {
            console.error('Error checking username availability:', err);
        }
    };

    const clearInputs = () => {
        setEmailOrUsername('');
        setPassword('');
        setSignupEmailAddress('');
        setSignupUsername('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupAge('');
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
                favoriteAnime: data.favoriteAnime || '',
                favoriteManga: data.favoriteManga || '',
                favoriteGenre: data.favoriteGenre || '',
                age: data.age || ''
            });
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
            const safeId = encodeURIComponent(id);
            const response = await makeAuthenticatedRequest(`/api/profile/${safeId}`, {
                method: 'PUT',
                body: JSON.stringify(profileData)
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
            favoriteGenre: '',
            age: ''
        });
        setIsEditing(false);
        setId(null);
        setAccessToken(null);
        setRefreshToken(null);
        
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
                        <text className="password-requirements">
                            Password must be 8 or more characters, contain uppercase & lowercase letters, a number, & a special character.
                        </text>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                            data-testid="signup-confirm-password-input"
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            value={signupAge}
                            onChange={(e) => setSignupAge(e.target.value)}
                            min="1"
                            max="120"
                            required
                            data-testid="signup-age-input"
                        />
                        {/* <text className="age-note">Used to provide age-appropriate content.</text> */}
                        <button id="signup-button" type="submit" disabled={isLoading} data-testid="signup-submit-button">
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
                                <button onClick={() => setActiveListTab('anime')} className={`anime-tab-button ${activeListTab === 'anime' ? 'active' : ''}`}>Anime</button>
                                <button onClick={() => setActiveListTab('manga')} className={`manga-tab-button ${activeListTab === 'manga' ? 'active' : ''}`}>Manga</button>
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
                                                <li key={item.id} className="list-item" onClick={() => handleListItemClick(item)}>
                                                    {item.coverImageUrl && (
                                                        <img src={item.coverImageUrl} alt={item.title} className="item-cover-image" />
                                                    )}
                                                    <div className="item-info">
                                                        <span className="item-title">{item.title}</span>
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
                                                    <div className="description">
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
                            <h2>Watched Anime</h2>
                            <p className="tab-placeholder">Anime you've watched with your ratings will appear here.</p>
                        </div>
                    )}

                    {activeProfileTab === 'read' && (
                        <div className="read-tab">
                            <h2>Read Manga</h2>
                            <p className="tab-placeholder">Manga you've read with your ratings will appear here.</p>
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
                                {profileData.age && <p className="profile-age">Age: {profileData.age}</p>}
                                <div className="profile-actions">
                                    <button onClick={() => setIsEditing(true)} className="edit-profile-button" data-testid="edit-profile-button">
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
                            
                            <div className="profile-section">
                                <h3>Bio</h3>
                                <p>{profileData.bio || 'No bio yet. Click "Edit Profile" to add one!'}</p>
                            </div>
                            
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
                                <p>{profileData.favoriteGenre || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="profile-edit" data-testid="profile-edit">
                        <h2>Edit Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="profile-edit-form" data-testid="profile-edit-form">
                            <div className="form-group">
                                <label>Avatar URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/your-avatar.jpg"
                                    value={profileData.avatarUrl}
                                    onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                                    data-testid="avatar-url-input"
                                />
                                {profileData.avatarUrl && (
                                    <div className="avatar-preview">
                                        <img src={profileData.avatarUrl} alt="Avatar preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <textarea
                                    placeholder="Enter your email address"
                                    value={profileData.emailAddress}
                                    onChange={(e) => setProfileData({...profileData, emailAddress: e.target.value})}
                                    data-testid="email-textarea"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    placeholder="Tell us about yourself..."
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    maxLength="500"
                                    rows="4"
                                    data-testid="bio-textarea"
                                />
                                <span className="char-count">{profileData.bio.length}/500</span>
                            </div>
                            
                            <div className="form-group">
                                <label>Favorite Anime</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Attack on Titan"
                                    value={profileData.favoriteAnime}
                                    onChange={(e) => setProfileData({...profileData, favoriteAnime: e.target.value})}
                                    data-testid="favorite-anime-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Favorite Manga</label>
                                <input
                                    type="text"
                                    placeholder="e.g., One Piece"
                                    value={profileData.favoriteManga}
                                    onChange={(e) => setProfileData({...profileData, favoriteManga: e.target.value})}
                                    data-testid="favorite-manga-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Favorite Genres</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Action, Romance, Comedy"
                                    value={profileData.favoriteGenre}
                                    onChange={(e) => setProfileData({...profileData, favoriteGenre: e.target.value})}
                                    data-testid="favorite-genre-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    placeholder="Your age"
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                                    min="1"
                                    max="120"
                                    data-testid="age-input"
                                />
                            </div>
                            
                            {error && <p className="error-message" data-testid="profile-edit-error">{error}</p>}
                            
                            <div className="form-actions">
                                <button type="submit" disabled={isLoading} className="save-button" data-testid="save-profile-button">
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