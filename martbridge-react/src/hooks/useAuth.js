import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (key, redirectPath = '/') => {
    const [userId, setUserId] = useState(() => {
        try {
            return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
        } catch (e) {
            return null;
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId && redirectPath) {
            navigate(redirectPath);
        }
    }, [userId, navigate, redirectPath]);

    const login = (id) => {
        localStorage.setItem(key, id);
        setUserId(id);
    };

    const logout = () => {
        localStorage.removeItem(key);
        setUserId(null);
        navigate('/');
    };

    return { userId, login, logout };
};
