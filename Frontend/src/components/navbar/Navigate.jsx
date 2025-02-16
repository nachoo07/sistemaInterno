import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import './navbar.css';
import { useNavigate} from 'react-router-dom';
import { LoginContext } from '../../context/login/LoginContext';
import { useContext } from 'react';
import logo from '../../assets/logo.png';
const Navigate = () => {

  const { auth, logout, userData } = useContext(LoginContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login'); // Redirige a la página de login después de cerrar sesión
  };
  return (
    <>
       <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand onClick={() => navigate("/")}>
            <img
              src={logo}
              width="100"
              height="60"
              className="d-inline-block align-top"
              alt="Logo"
            />
          </Navbar.Brand>
          <Nav className="ml-auto align-items-center justify-content-end">
            <FaBell className="notification-icon" />
            <span className="navbar-text">
              Hola, {userData?.name || 'Usuario'}
            </span>
          <Button className='boton-cerrar-sesion' onClick={handleLogout}>Cerrar Sesión</Button>
          </Nav>
        </Container>
      </Navbar>
    </>
  )
}

export default Navigate