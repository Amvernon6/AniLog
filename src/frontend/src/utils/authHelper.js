/**
 * Centralized authentication helper for making API requests with automatic token refresh
 */

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        handleSessionExpired();
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

        // Update token in storage
        localStorage.setItem('accessToken', newAccessToken);

        return newAccessToken;
    } catch (err) {
        console.error('Token refresh failed:', err);
        handleSessionExpired();
        return null;
    }
};

/**
 * Makes an authenticated API request with automatic token refresh on 401
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        handleSessionExpired();
        return null;
    }


    // For GET/HEAD, do not include body
    const isGetOrHead = (options.method || 'GET').toUpperCase() === 'GET' || (options.method || '').toUpperCase() === 'HEAD';
    const { body, ...restOptions } = options;
    const requestOptions = {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`
        }
    };
    if (!isGetOrHead && body !== undefined) {
        requestOptions.body = body;
    }

    let response = await fetch(url, requestOptions);

    // If 401 Unauthorized, try to refresh token and retry once
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                accessToken = newToken;
                requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, requestOptions);
            } else {
                // Refresh failed, session expired
                handleSessionExpired();
                return response;
            }
        } else {
            handleSessionExpired();
            return response;
        }
        // handleSessionExpired();
        return response;
    }

    return response;
};

/**
 * Handle session expiration by clearing tokens and redirecting to login
 */
const handleSessionExpired = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
};

/**
 * Parse error response from API
 * @param {Response} response - The fetch response
 * @returns {Promise<object>} - Parsed error data
 */
export const parseErrorResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        return { error: text || response.statusText || 'Request failed' };
    }
};
