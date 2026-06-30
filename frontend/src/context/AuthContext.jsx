import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            // No token stored — go straight to login
            setLoading(false);
            return;
        }

        // Validate the stored token against the backend
        api.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then((res) => {
            setToken(storedToken);
            setUser(res.data);
        })
        .catch(() => {
            // Token is invalid or expired — clear it
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (updateData) => {
        const res = await api.put('/auth/me', updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
