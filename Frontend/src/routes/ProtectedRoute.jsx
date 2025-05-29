import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginContext } from '../context/login/LoginContext';

const ProtectedRoute = ({ element, role }) => {
    const { auth, isLoggedOut, isTokenValid } = useContext(LoginContext);
    const location = useLocation();
    const [isValidating, setIsValidating] = useState(isTokenValid === null);

    useEffect(() => {
        if (isTokenValid !== null) {
            setIsValidating(false);
        }
    }, [isTokenValid]);

    if (isValidating) {
        return <div>Cargando...</div>;
    }

    if (!auth || isLoggedOut || isTokenValid === false) {
        if (location.pathname !== '/login') {
            return <Navigate to="/login" replace />;
        }
        return element;
    }

    if (role && auth !== role) {
        return <Navigate to="/homeuser" replace />;
    }

    return element;
};

export default ProtectedRoute;