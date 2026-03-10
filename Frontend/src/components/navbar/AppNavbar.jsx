import React, { useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { LoginContext } from '../../context/login/LoginContext';
import { FaUserCircle, FaUserCog, FaCog, FaChevronDown } from 'react-icons/fa';
import './navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const AppNavbar = ({ setIsMenuOpen, isMenuOpen }) => {
  const { logout, userData, auth } = useContext(LoginContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = useRef(null);

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileNode = profileRef.current;
      const eventTarget = event?.target;
      const canCheckOutside =
        profileNode &&
        typeof profileNode.contains === 'function' &&
        eventTarget instanceof Node;

      if (isProfileOpen && canCheckOutside && !profileNode.contains(eventTarget)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleDropdownItemClick = (route, action) => {
    navigate(route);
    setIsProfileOpen(false);
  };

  return (
    <Navbar expand="sm" className="app-navbar" fixed="top">
      <Container fluid className="px-0 ">
        <div className="opciones">
          <button
            type="button"
            className="navbar-toggler me-2 border-0 shadow-none"
            onClick={handleMenuToggle}
            aria-label="Abrir o cerrar sidebar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        
          <div className="profile-container" ref={profileRef}>
            <div
              className="profile-container-inner d-inline-flex"
              onClick={handleProfileClick}
            >
              <FaUserCircle className="profile-icon" />
              <span className="profile-greeting">
                Hola, {userData?.name || 'Usuario'}
              </span>
              <FaChevronDown className={`arrow-icon ${isProfileOpen ? 'rotated' : ''}`} />
            </div>
            {isProfileOpen && (
              <div className="profile-menu">
                <div
                  className="menu-option"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropdownItemClick('/user', 'Mi Perfil');
                  }}
                >
                  <FaUserCog className="option-icon" /> Mi Perfil
                </div>
                <div
                  className="menu-option"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropdownItemClick('/settings', 'Configuración');
                  }}
                >
                  <FaCog className="option-icon" /> Configuración
                </div>
                <div className="menu-separator" />
                <div
                  className="menu-option logout-option"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropdownItemClick('/login', 'Cerrar Sesión');
                    handleLogout();
                  }}
                >
                  <FaUserCircle className="option-icon" /> Cerrar Sesión
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;