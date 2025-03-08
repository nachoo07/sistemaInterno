import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LoginContext = createContext();
export const LoginProvider = ({ children }) => {
    const [auth, setAuth] = useState(localStorage.getItem('authRole') || null);
    const [userData, setUserData] = useState(localStorage.getItem('authName') ? { name: localStorage.getItem('authName') } : null);
    const navigate = useNavigate();

    // Login
    const login = async (mail, password) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', { mail, password }, { withCredentials: true });
            const { role, name } = response.data.user;
            setAuth(role);
            setUserData({ name });
            localStorage.setItem('authRole', role);
            localStorage.setItem('authName', name);
            return role; // Devolver el rol para usarlo en Login.js
        } catch (error) {
            console.error('Error en login:', error.response?.data || error.message);
            throw error.response?.data?.message || 'Error al iniciar sesión';
        }
    };
    // Logout
    const logout = async () => {
        try {
            await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
            setAuth(null);
            setUserData(null);
            localStorage.removeItem('authRole');
            localStorage.removeItem('authName');
            navigate('/login');
        } catch (error) {
            console.error('Error en logout:', error);
        }
    };
    // Renovar token
    const refreshAccessToken = async () => {
        try {
            await axios.post('http://localhost:4000/api/auth/refresh', {}, { withCredentials: true });
        } catch (error) {
            console.error('Error al renovar token:', error.response?.data || error.message);
            logout(); // Si falla la renovación, cerrar sesión
            throw error;
        }
    };
    // Interceptor para manejar errores 401
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await refreshAccessToken();
                        return axios(originalRequest); // Reintentar la solicitud original
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // Renovación proactiva del token cada 90 minutos
    useEffect(() => {
        const interval = setInterval(() => {
            if (auth) {
                refreshAccessToken();
            }
        }, 90 * 60 * 1000); // 90 minutos (antes de las 2 horas)
        return () => clearInterval(interval);
    }, [auth]);

    return (
        <LoginContext.Provider value={{ auth, userData, login, logout }}>
            {children}
        </LoginContext.Provider>
    );
};