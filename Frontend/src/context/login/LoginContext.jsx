import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // Función mejorada para verificar cookies
    const checkCookies = () => {
        try {
            const cookiesArray = document.cookie
                .split(';')
                .map(cookie => cookie.trim())
                .filter(cookie => cookie !== '');

            const cookiesObject = {};
            cookiesArray.forEach(cookie => {
                const [key, value] = cookie.split('=');
                if (key && value) {
                    cookiesObject[key.trim()] = value;
                }
            });

            console.log('Cookies detectadas:', cookiesObject);
            return cookiesObject;
        } catch (error) {
            console.error('Error al verificar cookies:', error);
            return {};
        }
    };

    // Función para establecer cookies
    const setCookie = (name, value, days = 7) => {
        try {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            const cookieValue = `${name}=${value}; ${expires}; path=/; secure; SameSite=None; domain=.sistemainterno.onrender.com`;
            document.cookie = cookieValue;
            console.log(`Cookie establecida: ${cookieValue}`);
        } catch (error) {
            console.error('Error al establecer cookie:', error);
        }
    };

    // Función para eliminar cookies
    const deleteCookie = (name) => {
        try {
            const domains = ['', '.sistemainterno.onrender.com', 'sistemainterno.onrender.com'];
            const paths = ['/', '/api'];
            
            domains.forEach(domain => {
                paths.forEach(path => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; secure; SameSite=None`;
                });
            });
            
            console.log(`Cookie eliminada: ${name}`);
        } catch (error) {
            console.error('Error al eliminar cookie:', error);
        }
    };

    const login = (role, name) => {
        if (!role || !name) {
            console.error('Role o Name no definidos:', { role, name });
            return;
        }

        setAuth(role);
        setUserData({ name });

        localStorage.setItem('authRole', role);
        localStorage.setItem('authName', name);
        
        // Establecer cookies de autenticación
        setCookie('session', 'active', 1); // 1 día
        
        console.log('Login exitoso:', { role, name });
        console.log('Cookies después del login:', checkCookies());
    };

    const logout = async () => {
        try {
            console.log('Cookies antes del logout:', checkCookies());

            const response = await fetch('https://sistemainterno.onrender.com/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            // Limpiar todo independientemente de la respuesta del servidor
            setAuth(null);
            setUserData(null);
            localStorage.clear();
            
            // Limpiar todas las cookies conocidas
            ['token', 'refreshToken', 'session', 'authRole'].forEach(cookieName => {
                deleteCookie(cookieName);
            });

            console.log('Cookies después del logout:', checkCookies());

            // Redirigir al login
            window.location.href = '/login';
        } catch (error) {
            console.error('Error durante el logout:', error);
            // Limpiar todo incluso si hay error
            setAuth(null);
            setUserData(null);
            localStorage.clear();
            ['token', 'refreshToken', 'session', 'authRole'].forEach(cookieName => {
                deleteCookie(cookieName);
            });
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('authRole');
        const name = localStorage.getItem('authName');
        const cookies = checkCookies();
        
        console.log('Estado inicial:', { role, name, cookies });

        if (role && role !== 'undefined' && cookies.session === 'active') {
            setAuth(role);
            if (name && name !== 'undefined') {
                setUserData({ name });
            }
        } else {
            setAuth(null);
            setUserData(null);
            localStorage.clear();
            ['token', 'refreshToken', 'session', 'authRole'].forEach(cookieName => {
                deleteCookie(cookieName);
            });
        }
    }, []);

    return (
        <LoginContext.Provider value={{ auth, login, logout, userData }}>
            {children}
        </LoginContext.Provider>
    );
};