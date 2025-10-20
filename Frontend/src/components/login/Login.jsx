import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { LoginContext } from '../../context/login/LoginContext';
import { FaExclamationTriangle, FaTimesCircle, FaWifi } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';
import logo from "../../assets/logoyoclaudio.png";

const Login = () => {
    const { login, auth, isOffline } = useContext(LoginContext); // Agregado: isOffline del contexto
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (auth) {
            if (auth === 'admin') {
                navigate('/');
            } else {
                navigate('/homeuser');
            }
        }
    }, [auth, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const role = await login(email, password);
            if (role === 'admin') {
                navigate('/');
            } else {
                navigate('/homeuser');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || err || 'Error al iniciar sesión'); // Captura el mensaje específico de offline o error
        }
    };

    // Componente para alert personalizado
    const CustomAlert = ({ type, message, icon }) => (
        <div className={`login-alert login-alert-${type}`}>
            <span className="login-alert-icon">{icon}</span>
            {message}
        </div>
    );

    return (
        <div className="login-page-container">
            <div className="login-page-form-wrapper">
                <div className="login-page-logo-container">
                    <img src={logo} alt="Logo" className="login-page-logo" />
                </div>

                <div className="login-page-title-container">
                    <h2 className="login-page-title">Bienvenido</h2>
                </div>

                <Form onSubmit={handleSubmit} className="login-page-form">
                    <Form.Group className="login-page-form-input" controlId="emailInput">
                        <Form.Label className="login-page-form-label">Usuario</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder=""
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="login-page-form-input" controlId="passwordInput">
                        <Form.Label className="login-page-form-label">Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            className="mb-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* Alerts personalizados */}
                    {error && (
                        <CustomAlert 
                            type="error" 
                            message={error} 
                            icon={<FaTimesCircle />} 
                        />
                    )}
                    
                    {isOffline && (
                        <CustomAlert 
                            type="warning" 
                            message="Sin conexión a internet. Verifica tu conexión e inténtalo de nuevo." 
                            icon={<FaWifi />} 
                        />
                    )}

                    <div className="login-page-button-container">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="login-page-submit-button"
                            disabled={isOffline} // Deshabilita si está offline
                        >
                            Iniciar sesión
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Login;