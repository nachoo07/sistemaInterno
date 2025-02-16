import React, { useState, useContext,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { LoginContext } from '../../context/login/LoginContext'; // Asegúrate de importar el contexto
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import logo from '../../assets/logo.png';
const Login = () => {

  const { login, auth, logout} = useContext(LoginContext); // Accede al método login del contexto
  const navigate = useNavigate(); // Hook para redirigir
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Para manejar errores


  // Si el usuario ya está logueado, lo redirigimos a la página principal
  useEffect(() => {
    if (auth) {
      logout(); // Cerrar sesión automáticamente
      navigate('/login'); // Redirigir al login después de cerrar sesión
    }
  }, [auth, logout, navigate]); // Dependencias

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpia errores anteriores
  
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mail: email, password }), // Cambiado correo por mail
        credentials: 'include', // Incluye cookies
      });
  
      if (!response.ok) {
        const { message } = await response.json();
        setError(message || 'Error al iniciar sesión');
        return;
      }
  
      const data = await response.json();
      const { role, name } = data.user;
      login(role, name); // Almacena la información en el contexto
      
  // Redirige según el rol del usuario
  if (role === 'admin') {
    navigate('/'); // Ruta para administradores
  } else {
    navigate('/homeuser'); // Ruta para usuarios comunes
  }
    } catch (error) {
      setError('Error de red o del servidor');
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="form-wrapper">
        <img src={logo} alt="Descripción de la imagen" className="login-image" />
         
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 formulario" controlId="exampleForm.ControlInput1">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Label  htmlFor="inputPassword5">Contraseña</Form.Label>
            <Form.Control
              type="password"
              id="inputPassword5"
              className="mb-3 formulario"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="button-container">
              <Button variant="primary" type="submit" className="custom-button">
                Iniciar sesión
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;