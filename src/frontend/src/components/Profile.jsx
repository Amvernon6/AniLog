import React, {useState, useEffect} from "react";
import '../css/profile.css';

const Profile = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupAge, setSignupAge] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupButtonClicked, setSignupButtonClicked] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
            const data = await response.json();
            onLogin(data); // Pass user data to parent component
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
        setUsername('');
        setPassword('');
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

    return (
        !signupButtonClicked ? (
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLoginSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value)}}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button id="login-button" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <button className="signup-switch-button" onClick={() => { switchToSignup(); setError(null); }}>
                    Sign Up
                </button>
            </div>
        ) : (
            <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignupSubmit} className="signup-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={signupUsername}
                    onChange={(e) => { setSignupUsername(e.target.value);  checkUsernameAvailability(e.target.value); }}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
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
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={signupAge}
                    onChange={(e) => setSignupAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                />
                {/* <text className="age-note">Used to provide age-appropriate content.</text> */}
                <button id="signup-button" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
                {error && <p className="error-message">{error}</p>}
                <button className="signup-switch-button" onClick={() => { switchToLogin(); setError(null); }}>
                    Back to Login
                </button>
            </form>
        </div>
        )
    );
}

export default Profile;