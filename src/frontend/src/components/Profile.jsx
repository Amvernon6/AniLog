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

    const handleSubmit = async (e) => {
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
                throw new Error('Login failed');
            }
            const data = await response.json();
            onLogin(data); // Pass user data to parent component
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        !signupButtonClicked ? (
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                <button className="signup-switch-button" onClick={() => setSignupButtonClicked(true)}>
                    Sign Up
                </button>
            </div>
        ) : (
            <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="signup-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                />
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
                <button className="signup-switch-button" onClick={() => setSignupButtonClicked(false)}>
                    Back to Login
                </button>
            </form>
        </div>
        )
    );
}

export default Profile;