const config = {
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://powerful-solace-production-4309.up.railway.app' 
};

export const API_BASE_URL = config.API_BASE_URL;
export default config;
