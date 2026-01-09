import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Profile';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Profile Component', () => {
    const mockOnLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        fetch.mockClear();
    });

    describe('Login View', () => {
        test('renders login form when not logged in', () => {
            render(<Profile onLogin={mockOnLogin} />);
            
            expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
            expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
            expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
        });

        test('handles successful login', async () => {
            const mockLoginResponse = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                userId: 123
            };

            const mockProfileResponse = {
                bio: 'Test bio',
                avatarUrl: 'https://example.com/avatar.jpg',
                emailAddress: 'test@example.com',
                username: 'testuser',
                favoriteAnime: 'One Piece',
                favoriteManga: 'Naruto',
                favoriteGenre: 'Action',
                age: 25
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockLoginResponse
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockProfileResponse
                });

            render(<Profile onLogin={mockOnLogin} />);

            fireEvent.change(screen.getByTestId('login-email-input'), {
                target: { value: 'testuser' }
            });
            fireEvent.change(screen.getByTestId('login-password-input'), {
                target: { value: 'password123' }
            });
            fireEvent.click(screen.getByTestId('login-submit-button'));

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ emailOrUsername: 'testuser', password: 'password123' })
                }));
            });

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
                expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
                expect(localStorage.getItem('userId')).toBe('123');
                expect(mockOnLogin).toHaveBeenCalledWith(123);
            });
        });

        test('displays error message on failed login', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => JSON.stringify({ error: 'Invalid credentials' })
            });

            render(<Profile onLogin={mockOnLogin} />);

            fireEvent.change(screen.getByTestId('login-email-input'), {
                target: { value: 'wronguser' }
            });
            fireEvent.change(screen.getByTestId('login-password-input'), {
                target: { value: 'wrongpass' }
            });
            fireEvent.click(screen.getByTestId('login-submit-button'));

            await waitFor(() => {
                expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
            });
        });

        test('switches to signup view when signup button clicked', () => {
            render(<Profile onLogin={mockOnLogin} />);

            fireEvent.click(screen.getByTestId('switch-to-signup'));

            expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
            expect(screen.getByTestId('signup-username-input')).toBeInTheDocument();
            expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument();
        });
    });

    describe('Signup View', () => {
        test('renders signup form', () => {
            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
            expect(screen.getByTestId('signup-username-input')).toBeInTheDocument();
            expect(screen.getByTestId('signup-confirm-password-input')).toBeInTheDocument();
            expect(screen.getByTestId('signup-age-input')).toBeInTheDocument();
        });

        test('checks email availability on input', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    '/api/register/check-email?emailAddress=taken%40example.com'
                );
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });
        });

        test('checks username availability on input', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'takenuser' }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    '/api/register/check-username?username=takenuser'
                );
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });
        });

        test('displays error when passwords do not match', async () => {
            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'testuser' }
            });
            fireEvent.change(screen.getByTestId('signup-password-input'), {
                target: { value: 'password123' }
            });
            fireEvent.change(screen.getByTestId('signup-confirm-password-input'), {
                target: { value: 'differentpassword' }
            });
            fireEvent.change(screen.getByTestId('signup-age-input'), {
                target: { value: '25' }
            });

            fireEvent.click(screen.getByTestId('signup-submit-button'));

            await waitFor(() => {
                expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
            });
        });

        test('handles successful signup', async () => {
            window.alert = jest.fn();
            
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true })  // Email availability check
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true })  // Username availability check
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ message: 'Registration successful' })  // Signup
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'newuser@example.com' }
            });
            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'newuser' }
            });
            fireEvent.change(screen.getByTestId('signup-password-input'), {
                target: { value: 'Password123!' }
            });
            fireEvent.change(screen.getByTestId('signup-confirm-password-input'), {
                target: { value: 'Password123!' }
            });
            fireEvent.change(screen.getByTestId('signup-age-input'), {
                target: { value: '25' }
            });

            fireEvent.click(screen.getByTestId('signup-submit-button'));

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/register', expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        emailAddress: 'newuser@example.com',
                        username: 'newuser',
                        password: 'Password123!',
                        age: 25
                    })
                }));
            });

            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('Registration successful! You can now log in.');
            });
        });

        test('switches back to login view when back button clicked', () => {
            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));
            
            expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('back-to-login'));

            expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
        });
    });

    describe('Profile View (Logged In)', () => {
        beforeEach(() => {
            localStorage.setItem('accessToken', 'mock-token');
            localStorage.setItem('refreshToken', 'mock-refresh');
            localStorage.setItem('userId', '123');
        });

        test('loads profile data on mount when logged in', async () => {
            const mockProfileData = {
                bio: 'Test bio',
                avatarUrl: '',
                emailAddress: 'test@example.com',
                username: 'testuser',
                favoriteAnime: 'One Piece',
                favoriteManga: 'Naruto',
                favoriteGenre: 'Action',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProfileData
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/profile/123', expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token'
                    })
                }));
            });

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
                expect(screen.getByText('Age: 25')).toBeInTheDocument();
                expect(screen.getByText('One Piece')).toBeInTheDocument();
            });
        });

        test('displays edit profile button', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    username: 'testuser',
                    emailAddress: 'test@example.com',
                    bio: '',
                    avatarUrl: '',
                    favoriteAnime: '',
                    favoriteManga: '',
                    favoriteGenre: '',
                    age: 25
                })
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });
        });

        test('handles logout', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    username: 'testuser',
                    emailAddress: 'test@example.com'
                })
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('logout-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('logout-button'));

            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
            expect(localStorage.getItem('userId')).toBeNull();
            expect(mockOnLogin).toHaveBeenCalledWith(null);

            // Should return to login view
            await waitFor(() => {
                expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
            });
        });
    });

    describe('Profile Edit', () => {
        beforeEach(() => {
            localStorage.setItem('accessToken', 'mock-token');
            localStorage.setItem('refreshToken', 'mock-refresh');
            localStorage.setItem('userId', '123');
        });

        test('switches to edit mode when edit button clicked', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    username: 'testuser',
                    emailAddress: 'test@example.com',
                    bio: 'My bio',
                    avatarUrl: '',
                    favoriteAnime: '',
                    favoriteManga: '',
                    favoriteGenre: '',
                    age: 25
                })
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByText('Save Changes')).toBeInTheDocument();
                expect(screen.getByText('Cancel')).toBeInTheDocument();
            });
        });

        test('updates profile data on save', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: 'Old bio',
                avatarUrl: '',
                favoriteAnime: 'Old anime',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            const updatedProfile = {
                ...initialProfile,
                bio: 'New bio',
                favoriteAnime: 'New anime'
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => initialProfile
                });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByDisplayValue('Old bio')).toBeInTheDocument();
            });

            const bioInput = screen.getByDisplayValue('Old bio');
            fireEvent.change(bioInput, { target: { value: 'New bio' } });

            const animeInput = screen.getByDisplayValue('Old anime');
            fireEvent.change(animeInput, { target: { value: 'New anime' } });

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => updatedProfile
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => updatedProfile
                });

            fireEvent.click(screen.getByTestId('save-profile-button'));

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/profile/123', expect.objectContaining({
                    method: 'PUT'
                }));
            });
        });

        test('cancels edit without saving', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    username: 'testuser',
                    emailAddress: 'test@example.com',
                    bio: 'Original bio',
                    avatarUrl: '',
                    favoriteAnime: '',
                    favoriteManga: '',
                    favoriteGenre: '',
                    age: 25
                })
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByText('Cancel')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('cancel-edit-button'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });
        });
    });

    describe('Token Refresh', () => {
        beforeEach(() => {
            localStorage.setItem('accessToken', 'old-token');
            localStorage.setItem('refreshToken', 'refresh-token');
            localStorage.setItem('userId', '123');
        });

        test('refreshes access token on 401 response', async () => {
            const newAccessToken = 'new-access-token';

            fetch
                // First call to get profile - returns 401
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401
                })
                // Refresh token call
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ accessToken: newAccessToken })
                })
                // Retry profile call with new token
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        username: 'testuser',
                        emailAddress: 'test@example.com',
                        bio: '',
                        avatarUrl: '',
                        favoriteAnime: '',
                        favoriteManga: '',
                        favoriteGenre: '',
                        age: 25
                    })
                });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/refresh', expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ refreshToken: 'refresh-token' })
                }));
            });

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBe(newAccessToken);
            });
        });

        test('logs out when token refresh fails', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401
                });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBeNull();
                expect(mockOnLogin).toHaveBeenCalledWith(null);
            });
        });
    });
});
