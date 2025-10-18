// Backend API Configuration
const API_BASE_URL = 'http://localhost:8085'; // Change this to your deployed backend URL

// API endpoints
const API = {
    shows: `${API_BASE_URL}/api/shows`,
    showDetails: (showId) => `${API_BASE_URL}/api/shows/${showId}`,
    stream: (videoId) => `${API_BASE_URL}/api/stream/${videoId}`
};
