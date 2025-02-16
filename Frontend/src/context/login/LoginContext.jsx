import React, { createContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [auth, setAuth] = useState(null); // Guarda el rol del usuario
    const [userData, setUserData] = useState(null); // Guarda el nombre del usuario

    const navigate = useNavigate();

    
    useEffect(() => {
        // Al cargar el componente, revisamos si hay información almacenada en el localStorage
        const role = localStorage.getItem('authRole');
        const name = localStorage.getItem('authName');
        console.log('LocalStorage obtenido en el frontend:', { role, name });

        // Solo actualizar el estado si los valores no están vacíos
        if (role && role !== 'undefined') {
            setAuth(role);
        }

        if (name && name !== 'undefined') {
            setUserData({ name });
        }
    }, []); // Dependencias vacías para que se ejecute solo una vez al montar el componente

    const login = (role, name) => {
        if (!role || !name) {
            console.error('Role o Name no definidos:', { role, name });
            return;
        }

        setAuth(role);
        setUserData({ name }); // Guarda el nombre del usuario en el estado

        // Almacena los datos en localStorage
        localStorage.setItem('authRole', role);
        localStorage.setItem('authName', name);
        console.log('LocalStorage configurado en el frontend:', { role, name });
    };

    const logout = async () => {
        try {
            // Realizar la solicitud al backend para eliminar las cookies
            const response = await fetch('http://localhost:4000/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Asegura que las cookies se envíen en la solicitud
            });

            if (response.status === 200) {
                setAuth(null);
                setUserData(null); // Limpia el nombre del usuario al hacer logout

                // Elimina los datos de localStorage
                localStorage.removeItem('authRole');
                localStorage.removeItem('authName');
                console.log('LocalStorage eliminado en el frontend');
                
                // Redirigir a la página de login o inicio
                window.location.href = '/login'; // O la página que desees
            } else {
                console.error('Error al hacer logout:', response);
            }
        } catch (error) {
            console.error('Error al hacer logout:', error);
        }
    };
    // Función para obtener un nuevo access token
    /*const refreshToken = async () => {
        try {
            const response = await api.post('/auth/refresh');
    
            console.log("Respuesta completa del backend:", response);  // 🔥 Muestra todo el objeto de respuesta
            console.log("Nuevo accessToken recibido:", response.data.accessToken);
            
            return response.data.accessToken;
        } catch (error) {
            console.error("Error al refrescar el token", error.response?.data || error.message);
            return null;
        }
    };*/

    return (
        <LoginContext.Provider value={{ auth, login, logout , userData }}>
            {children}
        </LoginContext.Provider>
    );
};