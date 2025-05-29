import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [auth, setAuth] = useState(localStorage.getItem('authRole') || null);
    const [userData, setUserData] = useState(localStorage.getItem('authName') ? { name: localStorage.getItem('authName') } : null);
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(null);
    const navigate = useNavigate();

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error) => {
        failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve();
            }
        });
        failedQueue = [];
    };

    const validateToken = useCallback(async () => {
        if (isLoggedOut || isTokenValid === true) {
            return isTokenValid !== false;
        }
        try {
            await axios.get('/api/auth/verify', { withCredentials: true });
            setIsTokenValid(true);
            return true;
        } catch (error) {
            console.error('Error al validar token:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                try {
                    await refreshAccessToken();
                    setIsTokenValid(true);
                    return true;
                } catch (refreshError) {
                    console.error('Fallo al renovar token:', refreshError);
                    setIsTokenValid(false);
                    logout();
                    return false;
                }
            }
            setIsTokenValid(false);
            return false;
        }
    }, [isLoggedOut, isTokenValid]);

    const login = async (mail, password) => {
        try {
            const response = await axios.post('/api/auth/login', { mail, password }, { withCredentials: true });
            const { role, name } = response.data.user;
            setAuth(role);
            setUserData({ name });
            setIsTokenValid(true);
            localStorage.setItem('authRole', role);
            localStorage.setItem('authName', name);
            setIsLoggedOut(false);
            return role;
        } catch (error) {
            console.error('Error en login:', error.response?.data || error.message);
            throw error.response?.data?.message || 'Error al iniciar sesión';
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Error en logout:', error);
        }
        setAuth(null);
        setUserData(null);
        setIsTokenValid(false);
        setIsLoggedOut(true);
        localStorage.removeItem('authRole');
        localStorage.removeItem('authName');
        processQueue(new Error('Sesión cerrada'));
        navigate('/login');
    };

    const refreshAccessToken = async () => {
        if (isLoggedOut) {
            throw new Error('Usuario ha cerrado sesión, no se puede renovar el token');
        }
        try {
            const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
            setIsTokenValid(true);
            return response.data;
        } catch (error) {
            console.error('Error al renovar token:', error.response?.data || error.message);
            throw error;
        }
    };

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !isLoggedOut &&
                    originalRequest.url !== '/api/auth/refresh'
                ) {
                    originalRequest._retry = true;

                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                            .then(() => axios(originalRequest))
                            .catch((err) => Promise.reject(err));
                    }

                    isRefreshing = true;
                    try {
                        await refreshAccessToken();
                        processQueue(null);
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Fallo al renovar el token:', refreshError);
                        processQueue(refreshError);
                        logout();
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                } else if (error.response?.status === 429) {
                    console.error('Demasiadas solicitudes:', error.response.data);
                    return Promise.reject(error.response.data.message || 'Too many requests, please try again later');
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [isLoggedOut]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (auth && !isLoggedOut && isTokenValid) {
                try {
                    await refreshAccessToken();
                } catch (error) {
                    console.error('Error al renovar token automáticamente:', error);
                    logout();
                }
            }
        }, 10 * 60 * 1000); // Cada 10 minutos
        return () => clearInterval(interval);
    }, [auth, isLoggedOut, isTokenValid]);

    useEffect(() => {
        if (auth && !isLoggedOut && isTokenValid === null) {
            validateToken();
        }
    }, [auth, isLoggedOut, validateToken]);

    return (
        <LoginContext.Provider value={{ auth, userData, login, logout, isLoggedOut, isTokenValid, validateToken }}>
            {children}
        </LoginContext.Provider>
    );
};