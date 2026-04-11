const config = {
    // API_BASE_URL: 'http://localhost:5000'
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://martbridge-backend.onrender.com' // Placeholder for production
};

export default config;
