
import React, {useState, useEffect, useRef} from "react";
import '../css/profile.css';
import { makeAuthenticatedRequest, parseErrorResponse, refreshAccessToken } from '../utils/authHelper';
import UserProfile from "./UserProfile";

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

const Profile = ({ Login, Logout }) => {
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
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
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
        // favoriteAnime: '',
        // favoriteManga: '',
        favoriteGenres: [],
        // age: '',
        usersFollowing: [],
        usersFollowedBy: [],
        usersWantToFollow: [],
        usersRequestedToFollow: []
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
    const [isSavingWatchedItem, setIsSavingWatchedItem] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editedProfileData, setEditedProfileData] = useState({
        bio: '',
        avatarUrl: '',
        emailAddress: '',
        username: '',
        // favoriteAnime: '',
        // favoriteManga: '',
        favoriteGenres: [],
        animeRankingOrder: [],
        mangaRankingOrder: []
        // age: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
    const toastTimerRef = useRef(null);

    // Drag-and-drop ranking state for all watched titles
    const [animeRankingOrder, setAnimeRankingOrder] = useState([]);
    const [mangaRankingOrder, setMangaRankingOrder] = useState([]);
    const [draggingAnimeIndex, setDraggingAnimeIndex] = useState(null);
    const [draggingMangaIndex, setDraggingMangaIndex] = useState(null);
    const [dragOverAnimeIndex, setDragOverAnimeIndex] = useState(null);
    const [dragOverMangaIndex, setDragOverMangaIndex] = useState(null);
    
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
        setEditedProfileData(prev => ({
            ...prev,
            animeRankingOrder: savedAnimeOrder,
            mangaRankingOrder: savedMangaOrder
        }));
    }, [watchedItems]);

    // Modal state for followers/following/requests
    const [showUserModal, setShowUserModal] = useState(false);
    const [userModalType, setUserModalType] = useState(null); // 'followers', 'following', 'requests'
    const [userModalList, setUserModalList] = useState([]);
    const [userModalTitle, setUserModalTitle] = useState('');
    const [savedType, setSavedType] = useState(null); // 'followers', 'following', 'requests'

    // Helper to open modal with correct list
    const openUserModal = async (type) => {
        setIsLoadingFollowers(true);
        setShowUserModal(true);

        let list = [];
        let title = '';
        if (type === 'followers') {
            list = profileData.usersFollowedBy || [];
            title = 'Followers';
            
            try {
                // Fetch follower details
                const response = await makeAuthenticatedRequest('/api/profile/safe/by-ids', {
                    method: 'PUT',
                    body: JSON.stringify(list.map(f => f.followerId))
                });
                const data = response.ok ? await response.json() : [];
                setUserModalList(data);
            } catch (err) {
                console.error('Error fetching follower details:', err);
            }
        } else if (type === 'following') {
            list = profileData.usersFollowing || [];
            title = 'Following';

            try {
                // Fetch followee details
                const response = await makeAuthenticatedRequest('/api/profile/safe/by-ids', {
                    method: 'PUT',
                    body: JSON.stringify(list.map(f => f.followeeId))
                });
                const data = response.ok ? await response.json() : [];
                setUserModalList(data);
            } catch (err) {
                console.error('Error fetching followee details:', err);
            }
        } else if (type === 'requests') {
            list = profileData.usersWantToFollow || [];
            title = 'Follow Requests';

            try {
                // Fetch follower details
                const response = await makeAuthenticatedRequest('/api/profile/safe/by-ids', {
                    method: 'PUT',
                    body: JSON.stringify(list.map(f => f.followerId))
                });
                const data = response.ok ? await response.json() : [];
                setUserModalList(data);
            } catch (err) {
                console.error('Error fetching requester details:', err);
            }
        }
        setUserModalType(type);
        setUserModalTitle(title);
        setIsLoadingFollowers(false);
    };

    // Helper to close modal
    const closeUserModal = () => {
        setShowUserModal(false);
        setUserModalType(null);
        setUserModalList([]);
        setUserModalTitle('');
        handleGetFollowStatuses(id);
    };

    const reorderArray = (arr, fromIndex, toIndex) => {
        if (fromIndex === null || toIndex === null || fromIndex === toIndex) return arr;
        const next = arr.slice();
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
    };

    const handleAnimeDragOver = (e, index) => {
        e.preventDefault();
        if (draggingAnimeIndex !== null && draggingAnimeIndex !== index) {
            setDragOverAnimeIndex(index);
            // Real-time visual reordering
            setAnimeRankingOrder(prev => reorderArray(prev, draggingAnimeIndex, index));
            setDraggingAnimeIndex(index);
        }
    };

    const handleAnimeDrop = (toIndex) => {
        if (draggingAnimeIndex !== null) {
            localStorage.setItem('animeRankingOrder', JSON.stringify(animeRankingOrder));
            const updatedData = {
                ...profileData,
                animeRankingOrder: animeRankingOrder
            };
            setEditedProfileData(updatedData);
            handleProfileUpdate(null, updatedData);
        }
        setDraggingAnimeIndex(null);
        setDragOverAnimeIndex(null);
    };

    // Touch event handlers for mobile anime rankings
    const handleAnimeTouchStart = (index) => {
        setDraggingAnimeIndex(index);
    };

    const handleAnimeTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling while dragging
        // Detect which item is under the touch point
        const touch = e.touches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const rankingItem = elementAtPoint?.closest('.ranking-item');
        if (rankingItem) {
            const items = Array.from(rankingItem.parentElement.children);
            const index = items.indexOf(rankingItem);
            if (index !== -1 && index !== draggingAnimeIndex) {
                setDragOverAnimeIndex(index);
                setAnimeRankingOrder(prev => reorderArray(prev, draggingAnimeIndex, index));
                setDraggingAnimeIndex(index);
            }
        }
    };

    const handleAnimeTouchEnd = (e, toIndex) => {
        e.preventDefault();
        if (draggingAnimeIndex !== null) {
            localStorage.setItem('animeRankingOrder', JSON.stringify(animeRankingOrder));
            const updatedData = {
                ...profileData,
                animeRankingOrder: animeRankingOrder
            };
            setEditedProfileData(updatedData);
            handleProfileUpdate(null, updatedData);
        }
        setDraggingAnimeIndex(null);
        setDragOverAnimeIndex(null);
    };

    const handleMangaDragOver = (e, index) => {
        e.preventDefault();
        if (draggingMangaIndex !== null && draggingMangaIndex !== index) {
            setDragOverMangaIndex(index);
            // Real-time visual reordering
            setMangaRankingOrder(prev => reorderArray(prev, draggingMangaIndex, index));
            setDraggingMangaIndex(index);
        }
    };

    const handleMangaDrop = (toIndex) => {
        if (draggingMangaIndex !== null) {
            localStorage.setItem('mangaRankingOrder', JSON.stringify(mangaRankingOrder));
            const updatedData = {
                ...profileData,
                mangaRankingOrder: mangaRankingOrder
            };
            setEditedProfileData(updatedData);
            handleProfileUpdate(null, updatedData);
        }
        setDraggingMangaIndex(null);
        setDragOverMangaIndex(null);
    };

    // Touch event handlers for mobile manga rankings
    const handleMangaTouchStart = (index) => {
        setDraggingMangaIndex(index);
    };

    const handleMangaTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling while dragging
        // Detect which item is under the touch point
        const touch = e.touches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const rankingItem = elementAtPoint?.closest('.ranking-item');
        if (rankingItem) {
            const items = Array.from(rankingItem.parentElement.children);
            const index = items.indexOf(rankingItem);
            if (index !== -1 && index !== draggingMangaIndex) {
                setDragOverMangaIndex(index);
                setMangaRankingOrder(prev => reorderArray(prev, draggingMangaIndex, index));
                setDraggingMangaIndex(index);
            }
        }
    };

    const handleMangaTouchEnd = (e, toIndex) => {
        e.preventDefault();
        if (draggingMangaIndex !== null) {
            localStorage.setItem('mangaRankingOrder', JSON.stringify(mangaRankingOrder));
            const updatedData = {
                ...profileData,
                mangaRankingOrder: mangaRankingOrder
            };
            setEditedProfileData(updatedData);
            handleProfileUpdate(null, updatedData);
        }
        setDraggingMangaIndex(null);
        setDragOverMangaIndex(null);
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

    const handleRequestUser = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await makeAuthenticatedRequest(`/api/user/${userId}/request/${selectedUser.id}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to request user');
            }
            setProfileData(prev => ({
                ...prev,
                usersWantToFollow: [...prev.usersWantToFollow, selectedUser.id]
            }));
            showToast("Successfully sent follow request!");
            // Only try to parse JSON if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
            showToast("Error requesting user");
            return null;
        }
    };

    const handleFollowUser = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await makeAuthenticatedRequest(`/api/user/${userId}/follow/${selectedUser.id}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to follow user');
            }
            setProfileData(prev => ({
                ...prev,
                usersFollowing: [...prev.usersFollowing, selectedUser.id]
            }));
            showToast("Successfully followed user!");
            return await response.json();
        } catch (err) {
            showToast("Error following user");
            return null;
        }
    };

    const handleUnfollowUser = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await makeAuthenticatedRequest(`/api/user/${userId}/unfollow/${selectedUser.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to unfollow user');
            }
            setProfileData(prev => ({
                ...prev,
                usersFollowedBy: prev.usersFollowedBy.filter(f => f !== selectedUser.id)
            }));
            showToast("Successfully unfollowed user!");
            // Only try to parse JSON if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
            showToast("Error unfollowing user");
            return null;
        }
    };

    useEffect(() => {
        // Check if user is already logged in on mount
        if (accessToken && localStorage.getItem('userId') != null) {
            const storedUserId = parseInt(localStorage.getItem('userId'), 10);
            handleGetProfile(storedUserId);
            setId(storedUserId);
            Login(null);
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
        setIsSavingWatchedItem(true);
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
        } finally {
            setIsSavingWatchedItem(false);
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
            
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setLoggedIn(true);
            setId(data.userId);
            Login(data);

            // Fetch full profile data
            handleGetProfile(data.userId);
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
        setIsLoading(true);

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
                    setUserList(prev => new Set([...prev, item.id]));
                } else {
                    showToast('Failed to add item to list.', 'error');
                }
            });
        } catch (error) {
            console.error('Error adding item to list:', error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
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
        setIsLoading(true);
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
                    setUserList(prev => {
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
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetFollowStatuses = async (userId) => {
        setIsLoadingProfile(true);
        try {
            const safeId = encodeURIComponent(userId);
            const response = await makeAuthenticatedRequest(`/api/user/${safeId}/followStatuses`, {
                headers: {
                    'X-Refresh-Token': localStorage.getItem('refreshToken') || ''
                }
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch follow statuses');
            }
            const data = await response.json();
            const usersFollowing = data.filter(follow => follow.followerId == userId && follow.status == 'FOLLOWING');
            const usersFollowedBy = data.filter(follow => follow.followeeId == userId && follow.status == 'FOLLOWING');
            const usersWantToFollow = data.filter(follow => follow.followeeId == userId && follow.status == 'REQUESTED');
            const usersRequestedToFollow = data.filter(follow => follow.followerId == userId && follow.status == 'REQUESTED');
            setProfileData(prev => ({
                ...prev,
                usersFollowing: usersFollowing || [],
                usersFollowedBy: usersFollowedBy || [],   
                usersWantToFollow: usersWantToFollow || [],
                usersRequestedToFollow: usersRequestedToFollow || []
            }));
        } catch (err) {
            console.error('Error fetching follow statuses:', err);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleGetProfile = async (userId) => {
        setIsLoadingProfile(true);
        setError(null);

        try {
            // // Load watched items directly (without state updates) so we can get top rated anime/manga
            // const animeData = await fetchWatchedItemsData('ANIME');
            // const mangaData = await fetchWatchedItemsData('MANGA');
            
            // // Get top anime from the fetched data
            // const animeRankingOrder = JSON.parse(localStorage.getItem('animeRankingOrder') || '[]');
            // const topAnime = animeRankingOrder.length > 0 
            //     ? animeData.find(i => i.id === animeRankingOrder[0])
            //     : animeData[0];
            
            // // Get top manga from the fetched data
            // const mangaRankingOrder = JSON.parse(localStorage.getItem('mangaRankingOrder') || '[]');
            // const topManga = mangaRankingOrder.length > 0 
            //     ? mangaData.find(i => i.id === mangaRankingOrder[0])
            //     : mangaData[0];

            await handleGetFollowStatuses(userId);

            setIsLoadingProfile(true);
            
            const safeId = encodeURIComponent(userId);
            const response = await makeAuthenticatedRequest(`/api/profile/${safeId}`, {
                headers: {
                    'X-Refresh-Token': localStorage.getItem('refreshToken') || ''
                }
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to fetch profile');
            }
            const data = await response.json();
            setProfileData({
                ...profileData,
                bio: data.bio || '',
                avatarUrl: data.avatarUrl || '',
                emailAddress: data.emailAddress || '',
                username: data.username || '',
                // favoriteAnime: topAnime?.title || '',
                // favoriteManga: topManga?.title || '',
                favoriteGenres: data.favoriteGenres || [],
                // age: data.age || '',
                users
            });
            setOriginalUsername(data.username || '');
            setOriginalEmail(data.emailAddress || '');
            setIsUsernameAvailable(true);
            setIsEmailAvailable(true);
            setLoggedIn(true);
        } catch (err) {
            handleLogout();
            setError(err.message);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleProfileUpdate = async (e, updatedData = null) => {
        e?.preventDefault();
        setIsLoadingProfile(true);
        setIsSavingProfile(true);
        setError(null);

        const dataToSend = updatedData || editedProfileData;

        try {
            const safeId = localStorage.getItem('userId');
            const response = await makeAuthenticatedRequest(`/api/profile/${safeId}`, {
                method: 'PUT',
                headers: {
                    'X-Refresh-Token': localStorage.getItem('refreshToken') || ''
                },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to update profile');
            }
            const data = await response.json();

            setIsEditing(false);
            handleGetProfile(id);
            setIsSavingProfile(false);
        } catch (err) {
            setError(err.message);
            setIsLoadingProfile(false);
            setIsSavingProfile(false); 
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
            // favoriteAnime: '',
            // favoriteManga: '',
            favoriteGenres: [],
            // age: ''
        });
        setEditedProfileData({
            bio: '',
            avatarUrl: '',
            emailAddress: '',
            username: '',
            // favoriteAnime: '',
            // favoriteManga: '',
            favoriteGenres: [],
            // age: ''
        });
        setIsEditing(false);
        setId(null);
        setAccessToken(null);
        setRefreshToken(null);
        setOriginalEmail('');
        setOriginalUsername('');
        
        Logout();
    };

    const handleAcceptFollowRequest = async (requestingUserId) => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await makeAuthenticatedRequest(`/api/user/${userId}/accept-request/${requestingUserId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to accept follow request');
            }
            setProfileData(prev => ({
                ...prev,
                usersFollowedBy: [...prev.usersFollowedBy, requestingUserId],
                usersWantToFollow: prev.usersWantToFollow.filter(r => r !== requestingUserId)
            }));
            setUserModalList(prev => prev.filter(u => u.id !== requestingUserId));
            showToast("Successfully accepted follow request!");
            return await response.json();
        } catch (err) {
            showToast("Error accepting follow request");
            return null;
        }
    };

    const handleDenyFollowRequest = async (requestingUserId) => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await makeAuthenticatedRequest(`/api/user/${userId}/decline-request/${requestingUserId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.error || 'Failed to decline follow request');
            }
            setProfileData(prev => ({
                ...prev,
                usersWantToFollow: prev.usersWantToFollow.filter(r => r !== requestingUserId)
            }));
            setUserModalList(prev => prev.filter(u => u.id !== requestingUserId));
            showToast("Successfully declined follow request!");
            return await response.json();
        } catch (err) {
            showToast("Error declining follow request");
            return null;
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

    return (
        !LoggedIn && !isLoadingProfile ? (
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
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-testid="login-password-input"
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={signupUsername}
                            onChange={(e) => { setSignupUsername(e.target.value);  checkUsernameAvailability(e.target.value); }}
                            required
                            data-testid="signup-username-input"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            data-testid="signup-password-input"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                            data-testid="signup-confirm-password-input"
                            disabled={isLoading}
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
            selectedUser ? (
                <UserProfile
                    selectedItem={selectedUser}
                    onBack={() => setSelectedUser(null)}
                    inProgressItems={watchedItems}
                    addedItems={userList}
                    onAddToList={handleAddToList}
                    onRemoveFromList={handleRemoveFromList}
                    onAddToInProgress={handleAddListItemToInProgress}
                    accessToken={localStorage.getItem('authToken')}
                    usersFollowing={profileData.usersFollowing.map(r => r.followeeId)}
                    usersFollowers={profileData.usersFollowedBy.map(r => r.followerId)}
                    usersRequested={profileData.usersRequestedToFollow.map(r => r.followeeId)}
                    onHandleFollow={handleFollowUser}
                    onHandleUnfollow={handleUnfollowUser}
                    onHandleFollowRequest={handleRequestUser}
                />
            ) : (
                showUserModal ? (
                    <div className="modal-overlay" onClick={closeUserModal} style={{ zIndex: 1000 }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 320, maxWidth: 400, margin: 'auto' }}>
                            <button onClick={closeUserModal} className="modal-close" style={{ float: 'right', fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                            <h2 style={{ margin: '12px 0 20px 0', textAlign: 'center' }}>{userModalTitle}</h2>
                            {isLoadingFollowers ? (
                                <Spinner />
                            ) : userModalList.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888' }}>No users found.</p>
                            ) : (
                                <ul className="user-modal-list">
                                    {userModalList.map((user, idx) => (
                                        <li
                                            key={user.id || idx}
                                            className="user-modal-list-item"
                                            tabIndex={0}
                                            role="button"
                                            onClick={() => setSelectedUser(user)}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedUser(user); }}
                                        >
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.username} className="user-modal-avatar" />
                                            ) : (
                                                <div className="user-modal-avatar-placeholder">
                                                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            )}
                                            <span className="user-modal-username">{user.username || 'Unknown'}</span>
                                            <div className="user-request-buttons">  
                                                {savedType === 'requests' && (
                                                    <>
                                                        <button
                                                            className="approve-request-button"
                                                            onClick={(e) => {handleAcceptFollowRequest(user.id); e.stopPropagation();}}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="deny-request-button"
                                                            onClick={(e) => {handleDenyFollowRequest(user.id); e.stopPropagation();}}
                                                        >
                                                            Deny
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
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
                                                    <option value="PLAN_TO_WATCH">Planning to Watch Next</option>
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
                                                            className={`ranking-item ${draggingAnimeIndex === index ? 'dragging' : ''}`}
                                                            draggable
                                                            onDragStart={() => setDraggingAnimeIndex(index)}
                                                            onDragOver={(e) => handleAnimeDragOver(e, index)}
                                                            onDrop={() => handleAnimeDrop(index)}
                                                            onDragEnd={() => handleAnimeDrop(index)}
                                                            onTouchStart={() => handleAnimeTouchStart(index)}
                                                            onTouchMove={handleAnimeTouchMove}
                                                            onTouchEnd={(e) => handleAnimeTouchEnd(e, index)}
                                                            style={{ 
                                                                cursor: 'move', 
                                                                touchAction: 'none',
                                                                opacity: draggingAnimeIndex === index ? 0.5 : 1,
                                                                transform: draggingAnimeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: draggingAnimeIndex === index ? '0 8px 16px rgba(102, 126, 234, 0.4)' : 'none'
                                                            }}
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
                                                                <option value="PLAN_TO_WATCH">Planning to Watch Next</option>
                                                            </select>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Episodes Watched</label>
                                                            <div className="progress-input-group">
                                                                <input 
                                                                    type="number"
                                                                    step="1" 
                                                                    max={(!editWatchedData.totalEpisodes || editWatchedData.totalEpisodes === 0) ? 9999 : editWatchedData.totalEpisodes}
                                                                    value={editWatchedData.episodesWatched}
                                                                    onChange={(e) => setEditWatchedData({...editWatchedData, episodesWatched: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                />
                                                                <span className="progress-separator">/</span>
                                                                <input 
                                                                    type="number" 
                                                                    step="1"
                                                                    min="0"
                                                                    value={editWatchedData.totalEpisodes}
                                                                    onChange={(e) => setEditWatchedData({...editWatchedData, totalEpisodes: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                                                                    placeholder="Total"
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Rating (0-10)</label>
                                                            <input 
                                                                type="number" 
                                                                min="0" 
                                                                max="10"
                                                                value={editWatchedData.rating}
                                                                onChange={(e) => setEditWatchedData({...editWatchedData, rating: e.target.value === '' ? '' : parseFloat(e.target.value) || 0})}
                                                                placeholder="Rate this anime"
                                                                step="0.1"
                                                                onWheel={(e) => e.currentTarget.blur()}
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
                                                                disabled={isSavingWatchedItem}
                                                            >
                                                                {isSavingWatchedItem ? 'Saving...' : 'Save Changes'}
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
                                                    <option value="PLAN_TO_READ">Planning to Read Next</option>
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
                                                            className={`ranking-item ${draggingMangaIndex === index ? 'dragging' : ''}`}
                                                            draggable
                                                            onDragStart={() => setDraggingMangaIndex(index)}
                                                            onDragOver={(e) => handleMangaDragOver(e, index)}
                                                            onDrop={() => handleMangaDrop(index)}
                                                            onDragEnd={() => handleMangaDrop(index)}
                                                            onTouchStart={() => handleMangaTouchStart(index)}
                                                            onTouchMove={handleMangaTouchMove}
                                                            onTouchEnd={(e) => handleMangaTouchEnd(e, index)}
                                                            style={{ 
                                                                cursor: 'move', 
                                                                touchAction: 'none',
                                                                opacity: draggingMangaIndex === index ? 0.5 : 1,
                                                                transform: draggingMangaIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: draggingMangaIndex === index ? '0 8px 16px rgba(102, 126, 234, 0.4)' : 'none'
                                                            }}
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
                                                                <option value="PLAN_TO_READ">Planning to Read Next</option>
                                                            </select>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Chapters Read</label>
                                                            <div className="progress-input-group">
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    max={(editWatchedData.totalChapters || editWatchedData.totalChapters == 0) ? 9999 : editWatchedData.totalChapters}
                                                                    value={editWatchedData.chaptersRead}
                                                                    onChange={(e) => setEditWatchedData({...editWatchedData, chaptersRead: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                />
                                                                <span className="progress-separator">/</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    value={editWatchedData.totalChapters}
                                                                    onChange={(e) => setEditWatchedData({...editWatchedData, totalChapters: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                                                                    placeholder="Total"
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Rating (0-10)</label>
                                                            <input 
                                                                type="number" 
                                                                min="0" 
                                                                max="10"
                                                                value={editWatchedData.rating}
                                                                onChange={(e) => setEditWatchedData({...editWatchedData, rating: e.target.value === '' ? '' : parseFloat(e.target.value) || 0})}
                                                                placeholder="Rate this manga"
                                                                step="0.1"
                                                                onWheel={(e) => e.currentTarget.blur()}
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
                                                                onClick={() => { setIsSavingWatchedItem(true); handleUpdateWatchedItem(selectedWatchedItem.id, editWatchedData); }}
                                                                className="save-button"
                                                                disabled={isSavingWatchedItem}
                                                            >
                                                                {isSavingWatchedItem ? 'Saving...' : 'Save Changes'}
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
                                    isLoadingProfile ? (
                                        <Spinner />
                                    ) : (
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
                                                    {/* Followers/Following/Requests Buttons in header */}
                                                    <div className="profile-follow-bar" style={{ display: 'flex', gap: '16px', marginBottom: 0, marginTop: 8, justifyContent: 'center' }}>
                                                        <button className="follow-count-btn" onClick={() => { openUserModal('followers'); setSavedType('followers'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ fontWeight: 600 }}>{profileData.usersFollowedBy?.length || 0}</span> Followers
                                                        </button>
                                                        <button className="follow-count-btn" onClick={() => { openUserModal('following'); setSavedType('following'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ fontWeight: 600 }}>{profileData.usersFollowing?.length || 0}</span> Following
                                                        </button>
                                                        <button className="follow-count-btn" onClick={() => { openUserModal('requests'); setSavedType('requests'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ fontWeight: 600 }}>{profileData.usersWantToFollow?.length || 0}</span> Requests
                                                        </button>
                                                    </div>
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
                                                
                                                {/* <div className="profile-section">
                                                    <h3>Favorite Anime</h3>
                                                    <p>{profileData.favoriteAnime || 'Your #1 rated anime from the rankings tab will appear here'}</p>
                                                </div>

                                                <div className="profile-section">
                                                    <h3>Favorite Manga</h3>
                                                    <p>{profileData.favoriteManga || 'Your #1 rated manga from the rankings tab will appear here'}</p>
                                                </div> */}
                                                
                                                <div className="profile-section">
                                                    <h3>Favorite Genres</h3>
                                                    <p>{Array.isArray(profileData.favoriteGenres) && profileData.favoriteGenres.length > 0 
                                                        ? profileData.favoriteGenres.join(', ')
                                                        : (profileData.favoriteGenres || 'Not specified')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
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
                                                <button type="submit" disabled={isSavingProfile || !isUsernameAvailable || !isEmailAvailable} className="save-button" data-testid="save-profile-button">
                                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
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
            )
        )
    );
}

export default Profile;