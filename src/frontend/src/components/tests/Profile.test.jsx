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

        test('displays error when email is unavailable during signup', async () => {
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
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });
        });

        test('displays error when username is unavailable during signup', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'takenusername' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });
        });

        test('clears error when available email is entered', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true })
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            // First enter a taken email
            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            // Then enter an available email
            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'available@example.com' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });
        });

        test('clears error when available username is entered', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true })
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            // First enter a taken username
            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'takenuser' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            // Then enter an available username
            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'availableuser' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });
        });

        test('disables signup button when email is unavailable', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            const signupButton = screen.getByTestId('signup-submit-button');
            expect(signupButton).not.toBeDisabled(); // Initially enabled

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            expect(signupButton).toBeDisabled();
        });

        test('disables signup button when username is unavailable', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            const signupButton = screen.getByTestId('signup-submit-button');
            expect(signupButton).not.toBeDisabled(); // Initially enabled

            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'takenuser' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            expect(signupButton).toBeDisabled();
        });

        test('enables signup button when both email and username are available', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Email unavailable
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Email available
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            // First make email unavailable
            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            const signupButton = screen.getByTestId('signup-submit-button');
            expect(signupButton).toBeDisabled();

            // Then make email available
            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'available@example.com' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            expect(signupButton).not.toBeDisabled();
        });

        test('keeps signup button disabled if email is available but username is not', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Email available
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Username unavailable
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'available@example.com' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'takenuser' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            const signupButton = screen.getByTestId('signup-submit-button');
            expect(signupButton).toBeDisabled();
        });

        test('keeps signup button disabled if username is available but email is not', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Email unavailable
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Username available
                });

            render(<Profile onLogin={mockOnLogin} />);
            fireEvent.click(screen.getByTestId('switch-to-signup'));

            fireEvent.change(screen.getByTestId('signup-email-input'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('signup-username-input'), {
                target: { value: 'availableuser' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });

            const signupButton = screen.getByTestId('signup-submit-button');
            expect(signupButton).toBeDisabled();
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
                expect(screen.getByTestId('bio-textarea')).toBeInTheDocument();
            });

            const bioInput = screen.getByTestId('bio-textarea');
            fireEvent.change(bioInput, { target: { value: 'New bio' } });

            const animeInput = screen.getByTestId('favorite-anime-input');
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

        test('successfully updates username when available', async () => {
            const initialProfile = {
                username: 'oldusername',
                emailAddress: 'test@example.com',
                bio: 'Test bio',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            const updatedProfile = {
                ...initialProfile,
                username: 'newusername'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByText('oldusername')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock username as available
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            const usernameInput = screen.getByTestId('username-input');
            fireEvent.change(usernameInput, { target: { value: 'newusername' } });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });

            // Mock successful profile update
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
                    method: 'PUT',
                    body: expect.stringContaining('newusername')
                }));
            });

            await waitFor(() => {
                expect(screen.getByText('newusername')).toBeInTheDocument();
            });
        });

        test('successfully updates email when available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'old@example.com',
                bio: 'Test bio',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            const updatedProfile = {
                ...initialProfile,
                emailAddress: 'new@example.com'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            // Mock email as available
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            const emailInput = screen.getByTestId('email-textarea');
            fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            // Mock successful profile update
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
                    method: 'PUT',
                    body: expect.stringContaining('new@example.com')
                }));
            });
        });

        test('reverts to original values when cancel is clicked', async () => {
            const initialProfile = {
                username: 'originaluser',
                emailAddress: 'original@example.com',
                bio: 'Original bio',
                avatarUrl: '',
                favoriteAnime: 'Original Anime',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByText('originaluser')).toBeInTheDocument();
                expect(screen.getByText('Original bio')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Change multiple fields
            const usernameInput = screen.getByTestId('username-input');
            const bioInput = screen.getByTestId('bio-textarea');
            const animeInput = screen.getByTestId('favorite-anime-input');

            fireEvent.change(usernameInput, { target: { value: 'modifieduser' } });
            fireEvent.change(bioInput, { target: { value: 'Modified bio' } });
            fireEvent.change(animeInput, { target: { value: 'Modified Anime' } });

            // Verify changes are in the input fields
            expect(usernameInput.value).toBe('modifieduser');
            expect(bioInput.value).toBe('Modified bio');
            expect(animeInput.value).toBe('Modified Anime');

            // Click cancel
            fireEvent.click(screen.getByTestId('cancel-edit-button'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            // Verify original values are still displayed
            expect(screen.getByText('originaluser')).toBeInTheDocument();
            expect(screen.getByText('Original bio')).toBeInTheDocument();
            expect(screen.getByText('Original Anime')).toBeInTheDocument();
        });

        test('reverts username to original after modification when cancel is clicked', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock username availability check
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            const usernameInput = screen.getByTestId('username-input');
            fireEvent.change(usernameInput, { target: { value: 'changedusername' } });

            expect(usernameInput.value).toBe('changedusername');

            // Cancel the edit
            fireEvent.click(screen.getByTestId('cancel-edit-button'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            // Original username should still be displayed
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.queryByText('changedusername')).not.toBeInTheDocument();

            // Re-open edit to verify original value is restored in the input
            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            const usernameInputAfterReopen = screen.getByTestId('username-input');
            expect(usernameInputAfterReopen.value).toBe('testuser');
        });

        test('reverts email to original after modification when cancel is clicked', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'original@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByText('original@example.com')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            // Mock email availability check
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            const emailInput = screen.getByTestId('email-textarea');
            fireEvent.change(emailInput, { target: { value: 'modified@example.com' } });

            expect(emailInput.value).toBe('modified@example.com');

            // Cancel the edit
            fireEvent.click(screen.getByTestId('cancel-edit-button'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            // Original email should still be displayed
            expect(screen.getByText('original@example.com')).toBeInTheDocument();
            expect(screen.queryByText('modified@example.com')).not.toBeInTheDocument();

            // Re-open edit to verify original value is restored in the input
            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            const emailInputAfterReopen = screen.getByTestId('email-textarea');
            expect(emailInputAfterReopen.value).toBe('original@example.com');
        });

        test('disables save button when username is not available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock username as unavailable
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            const usernameInput = screen.getByTestId('username-input');
            fireEvent.change(usernameInput, { target: { value: 'takenusername' } });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('disables save button when email is not available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            // Mock email as unavailable
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            const emailInput = screen.getByTestId('email-textarea');
            fireEvent.change(emailInput, { target: { value: 'taken@example.com' } });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('does not check availability when username matches original', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            const usernameInput = screen.getByTestId('username-input');
            
            // Clear and re-enter the same username
            fireEvent.change(usernameInput, { target: { value: '' } });
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });

            // Wait a bit to ensure no fetch call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Should only have one fetch call (the initial profile load)
            expect(fetch).toHaveBeenCalledTimes(1);

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).not.toBeDisabled();
        });

        test('does not check availability when email matches original', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            const emailInput = screen.getByTestId('email-textarea');
            
            // Clear and re-enter the same email
            fireEvent.change(emailInput, { target: { value: '' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            // Wait a bit to ensure no fetch call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Should only have one fetch call (the initial profile load)
            expect(fetch).toHaveBeenCalledTimes(1);

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).not.toBeDisabled();
        });

        test('enables save button when username becomes available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // First mock username as unavailable
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            const usernameInput = screen.getByTestId('username-input');
            fireEvent.change(usernameInput, { target: { value: 'takenusername' } });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            let saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();

            // Then mock username as available
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            fireEvent.change(usernameInput, { target: { value: 'availableusername' } });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });

            saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).not.toBeDisabled();
        });

        test('enables save button when email becomes available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('email-textarea')).toBeInTheDocument();
            });

            // First mock email as unavailable
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: false })
            });

            const emailInput = screen.getByTestId('email-textarea');
            fireEvent.change(emailInput, { target: { value: 'taken@example.com' } });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            let saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();

            // Then mock email as available
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ available: true })
            });

            fireEvent.change(emailInput, { target: { value: 'available@example.com' } });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).not.toBeDisabled();
        });

        test('handles availability check errors gracefully during edit', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock network error
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const usernameInput = screen.getByTestId('username-input');
            fireEvent.change(usernameInput, { target: { value: 'newusername' } });

            // Wait a bit for the error handling
            await new Promise(resolve => setTimeout(resolve, 100));

            // Save button should be disabled on error
            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('keeps save button disabled when both username and email are unavailable', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock both as unavailable
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Username unavailable
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Email unavailable
                });

            fireEvent.change(screen.getByTestId('username-input'), {
                target: { value: 'takenusername' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('email-textarea'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('keeps save button disabled if only username is available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock username available but email unavailable
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Username available
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Email unavailable
                });

            fireEvent.change(screen.getByTestId('username-input'), {
                target: { value: 'availableusername' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('email-textarea'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('keeps save button disabled if only email is available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // Mock email available but username unavailable
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Username unavailable
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Email available
                });

            fireEvent.change(screen.getByTestId('username-input'), {
                target: { value: 'takenusername' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('email-textarea'), {
                target: { value: 'available@example.com' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();
        });

        test('enables save button when both username and email become available', async () => {
            const initialProfile = {
                username: 'testuser',
                emailAddress: 'test@example.com',
                bio: '',
                avatarUrl: '',
                favoriteAnime: '',
                favoriteManga: '',
                favoriteGenre: '',
                age: 25
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => initialProfile
            });

            render(<Profile onLogin={mockOnLogin} />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('edit-profile-button'));

            await waitFor(() => {
                expect(screen.getByTestId('username-input')).toBeInTheDocument();
            });

            // First make both unavailable
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Username unavailable
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: false }) // Email unavailable
                });

            fireEvent.change(screen.getByTestId('username-input'), {
                target: { value: 'takenusername' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Username is already taken/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('email-textarea'), {
                target: { value: 'taken@example.com' }
            });

            await waitFor(() => {
                expect(screen.getByText(/Email address is already being used/i)).toBeInTheDocument();
            });

            let saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).toBeDisabled();

            // Then make both available
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Username available
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ available: true }) // Email available
                });

            fireEvent.change(screen.getByTestId('username-input'), {
                target: { value: 'availableusername' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Username is already taken/i)).not.toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('email-textarea'), {
                target: { value: 'available@example.com' }
            });

            await waitFor(() => {
                expect(screen.queryByText(/Email address is already being used/i)).not.toBeInTheDocument();
            });

            saveButton = screen.getByTestId('save-profile-button');
            expect(saveButton).not.toBeDisabled();
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
