// Backend API Configuration
// In production with nginx, use relative URLs (empty string)
// In development, use the backend URL directly
const IS_DEVELOPMENT = window.location.hostname === 'localhost' && window.location.port === '3000';
const API_BASE_URL = IS_DEVELOPMENT ? 'http://localhost:8087' : '';

// API endpoints
const API = {
    // Shows
    shows: `${API_BASE_URL}/api/shows`,
    showDetails: (showId) => `${API_BASE_URL}/api/shows/${showId}`,
    stream: (videoId) => `${API_BASE_URL}/api/stream/${videoId}`,
    
    // Movies
    movies: `${API_BASE_URL}/api/movies`,
    movieDetails: (movieId) => `${API_BASE_URL}/api/movies/${movieId}`,
    movieStream: (movieId) => `${API_BASE_URL}/api/movies/stream/${movieId}`,

    // Subtitles
    subtitles: (id) => `${API_BASE_URL}/api/subtitles/${id}`,
    
    // Authentication
    auth: {
        register: `${API_BASE_URL}/api/auth/register`,
        login: `${API_BASE_URL}/api/auth/login`,
        logout: `${API_BASE_URL}/api/auth/logout`,
        me: `${API_BASE_URL}/api/auth/me`,
        check: `${API_BASE_URL}/api/auth/check`
    },
    
    // User data
    user: {
        watchProgress: `${API_BASE_URL}/api/user/watch-progress`,
        continueWatching: `${API_BASE_URL}/api/user/continue-watching`,
        watchHistory: `${API_BASE_URL}/api/user/watch-history`,
        lastEpisodePerShow: `${API_BASE_URL}/api/user/last-episode-per-show`
    }
};

// Auth helper functions
const Auth = {
    getToken: () => localStorage.getItem('authToken'),
    
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    isLoggedIn: () => !!localStorage.getItem('authToken'),
    
    logout: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch(API.auth.logout, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => {});
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },
    
    // Get headers with auth token
    getHeaders: () => {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },
    
    // Fetch wrapper with auth
    fetch: async (url, options = {}) => {
        const token = localStorage.getItem('authToken');
        const headers = { ...(options.headers || {}) };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    },
    
    // Check if token is valid, redirect to login if not
    requireAuth: async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login.html';
            return false;
        }
        
        try {
            const response = await fetch(API.auth.check, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            return true; // Don't redirect on network error, let them try
        }
    }
};
