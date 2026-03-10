import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/axios'; 

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => localStorage.getItem('authRole') || null);
  const [userData, setUserData] = useState(() => 
    localStorage.getItem('authName')
      ? {
          id: localStorage.getItem('authUserId') || null,
          name: localStorage.getItem('authName'),
          mail: localStorage.getItem('authMail') || null,
        }
      : null
  );
  
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const navigate = useNavigate();

  // --- 1. VERIFICACIÓN INICIAL (Check Auth) ---
  const checkAuth = async () => {
    if (isOffline) {
      setLoading(false);
      setAuthReady(true);
      return;
    }

    const storedRole = localStorage.getItem('authRole');
    const storedName = localStorage.getItem('authName');
    const storedMail = localStorage.getItem('authMail');
    const storedId = localStorage.getItem('authUserId');

    // Si no hay sesión local, no intentamos refresh en pantalla de login.
    if (!storedRole || !storedName) {
      setAuth(null);
      setUserData(null);
      setLoading(false);
      setAuthReady(true);
      return;
    }

    try {
      setLoading(true);
      // Usamos 'client' que ya tiene las credenciales configuradas
      await client.post('/auth/refresh');
      
      // Si pasa, validamos lo que tenemos en localStorage
      if (storedRole && storedName) {
        setAuth(storedRole);
        setUserData({ id: storedId || null, name: storedName, mail: storedMail || null });
      } else {
        // Inconsistencia: Cookie válida pero sin datos locales -> Limpiar
        logout(false);
      }
    } catch (error) {
      // Si falla el refresh inicial, limpiamos todo
      handleSessionExpired(); 
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  };

  // --- 2. LOGIN ---
  const login = async (mail, password) => {
    if (isOffline) throw new Error('Sin conexión.');

    try {
      // El client gestiona las cookies automáticamente
      const response = await client.post('/auth/login', { mail, password });
      const payload = response?.data?.user ?? response?.data ?? {};
      const role = payload.role || null;
      const name = payload.name || null;
      const userMail = payload.mail || null;
      const id = payload.id || payload._id || null;

      if (!role || !name) {
        throw new Error('Respuesta de login inválida');
      }
      
      setAuth(role);
      setUserData({ id, name, mail: userMail });
      
      localStorage.setItem('authRole', role);
      localStorage.setItem('authName', name);
      if (userMail) localStorage.setItem('authMail', userMail);
      else localStorage.removeItem('authMail');
      if (id) localStorage.setItem('authUserId', id);
      else localStorage.removeItem('authUserId');
      
      navigate(role === 'admin' ? '/' : '/homeuser', { replace: true });
      return role;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  // --- 3. LOGOUT ---
  const logout = async (callBackend = true) => {
    // Limpieza de estado Local
    setAuth(null);
    setUserData(null);
    localStorage.removeItem('authRole');
    localStorage.removeItem('authName');
    localStorage.removeItem('authMail');
    localStorage.removeItem('authUserId');
    
    if (callBackend && !isOffline) {
      try {
        await client.post('/auth/logout');
      } catch (error) {
        console.error('Error silencioso en logout:', error);
      }
    }
    navigate('/login', { replace: true });
  };

  // --- 4. MANEJO DE EXPIRACIÓN (Evento desde Axios) ---
  const handleSessionExpired = () => {
    setAuth(null);
    setUserData(null);
    localStorage.removeItem('authRole');
    localStorage.removeItem('authName');
    localStorage.removeItem('authMail');
    localStorage.removeItem('authUserId');
    // No llamamos al backend porque asumimos que la sesión ya murió ahí
    if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
    }
  };

  // --- EFECTOS ---
  
  // A. Inicialización y Conectividad
  useEffect(() => {
    checkAuth();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // B. Escuchar al Cliente Axios (Comunicación Modulo -> React)
  useEffect(() => {
      // Escuchamos el evento personalizado que dispara axiosClient.js
      window.addEventListener('SESSION_EXPIRED', handleSessionExpired);
      
      return () => {
          window.removeEventListener('SESSION_EXPIRED', handleSessionExpired);
      };
  }, []);

  return (
    <LoginContext.Provider value={{ 
        auth, 
        userData, 
        login, 
        logout, 
        loading, 
        authReady, 
        isOffline 
    }}>
      {children}
    </LoginContext.Provider>
  );
};
