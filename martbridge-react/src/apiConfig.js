const config = {
    API_BASE_URL: import.meta.env.DEV
        ? '' // Let Vite proxy handle local requests (bypasses Windows Firewall on port 5000)
        : 'https://powerful-solace-production-4309.up.railway.app' 
};

export const API_BASE_URL = config.API_BASE_URL;
export default config;
