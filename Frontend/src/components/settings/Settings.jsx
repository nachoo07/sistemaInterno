import React, { useState, useEffect, useContext } from 'react';
import { SharesContext } from '../../context/share/ShareContext';
import { LoginContext } from '../../context/login/LoginContext'; // Añadimos LoginContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaBars, FaUsers, FaMoneyBill, FaChartBar, FaExchangeAlt, FaCalendarCheck,
  FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft, FaInfoCircle, FaUserCircle,
  FaChevronDown, FaTimes, FaSearch, FaTimes as FaTimesClear
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './settings.css';
import logo from '../../assets/logo.png';
import AppNavbar from '../navbar/AppNavbar';

const Settings = () => {
  const { obtenerCuotas } = useContext(SharesContext);
  const { waitForAuth } = useContext(LoginContext); // Añadimos waitForAuth
  const [cuotaBase, setCuotaBase] = useState(30000);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 768);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome /> },
    { name: 'Alumnos', route: '/student', icon: <FaUsers /> },
    { name: 'Cuotas', route: '/share', icon: <FaMoneyBill /> },
    { name: 'Reportes', route: '/report', icon: <FaChartBar /> },
    { name: 'Movimientos', route: '/motion', icon: <FaExchangeAlt /> },
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck /> },
    { name: 'Usuarios', route: '/user', icon: <FaUserCog /> },
    { name: 'Ajustes', route: '/settings', icon: <FaCog /> },
    { name: 'Envios de Mail', route: '/email-notifications', icon: <FaEnvelope /> },
    { name: 'Volver Atrás', route: null, action: () => navigate(-1), icon: <FaArrowLeft /> }
  ];

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth < 768) {
        setIsMenuOpen(false);
      } else {
        setIsMenuOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await waitForAuth(); // Espera a que la autenticación esté lista
        await fetchCuotaBase();
      } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los datos iniciales.', 'error');
      }
    };
    fetchData();
  }, [waitForAuth]); // Añadimos waitForAuth como dependencia

  const fetchCuotaBase = async () => {
    try {
      const response = await axios.get('/api/config/cuotaBase', { withCredentials: true });
      setCuotaBase(response.data.value || 30000);
    } catch (error) {
      console.error('Error al obtener cuota base:', error);
    }
  };

  const handleSaveCuotaBase = async () => {
    setLoading(true);
    try {
      await axios.post('/api/config/set', {
        key: 'cuotaBase',
        value: parseFloat(cuotaBase),
      }, { withCredentials: true });
      Swal.fire('¡Éxito!', 'Monto base actualizado para el próximo mes', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el monto base', 'error');
      console.error('Error al guardar cuota base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePendingCuotas = async () => {
    setLoading(true);
    try {
      const response = await axios.put('/api/shares/update-pending', {}, { withCredentials: true });
      if (response.status === 400) {
        Swal.fire('Error', response.data.message, 'error');
      } else {
        await obtenerCuotas();
        Swal.fire('¡Éxito!', 'Cuotas pendientes actualizadas con el nuevo monto base', 'success');
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudieron actualizar las cuotas', 'error');
      console.error('Error al actualizar cuotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const infoMessage = `
  Cómo Usar los Ajustes de Cuotas
  1. Monto Base de Cuota: Este es el precio que tendrán las cuotas del próximo mes. Por ejemplo, si hoy (6 de marzo) cambias el monto de $40.000 a $45.000 y hacés clic en "Guardar Monto Base", las cuotas del 1 de abril serán $45.000. Las de este mes no cambian.  
  2. Actualizar Cuotas Pendientes: Si se te olvidó actualizar antes y las cuotas de este mes (por ejemplo, abril) siguen en $40.000, poné $45.000 en el monto base, guardalo y hacé clic en "Actualizar Cuotas". Esto cambia las cuotas no pagadas a $45.000, pero solo funciona del 1 al 10 de cada mes.  
`;

  return (
    <div className="app-container">
      {windowWidth <= 576 && (
        <AppNavbar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
      {windowWidth > 576 && (
        <header className="desktop-nav-header">
          <div className="header-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Valladares Fútbol" className="logo-image" />
          </div>
          <div className="nav-right-section">
            <div
              className="profile-container"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FaUserCircle className="profile-icon" />
              <span className="profile-greeting">
                Hola, {'Usuario'}
              </span>
              <FaChevronDown className={`arrow-icon ${isProfileOpen ? 'rotated' : ''}`} />
              {isProfileOpen && (
                <div className="profile-menu">
                  <div
                    className="menu-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/user');
                      setIsProfileOpen(false);
                    }}
                  >
                    <FaUserCog className="option-icon" /> Mi Perfil
                  </div>
                  <div
                    className="menu-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                  >
                    <FaCog className="option-icon" /> Configuración
                  </div>
                  <div className="menu-separator"></div>
                  <div
                    className="menu-option logout-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                  >
                    <FaUserCircle className="option-icon" /> Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <div className="dashboard-layout">
        <aside className={`sidebar ${isMenuOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            <div className="sidebar-section">
              <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
              <ul className="sidebar-menu">
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    className={`sidebar-menu-item ${item.route === '/settings' ? 'active' : ''}`}
                    onClick={() => item.action ? item.action() : navigate(item.route)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>
        <main className={`main-content ${!isMenuOpen ? 'expanded' : ''}`}>
          <section className="dashboard-welcome">
            <div className="welcome-text">
              <h1>Ajustes de Cuotas</h1>
            </div>
          </section>
          {windowWidth > 576 && (
            <section className="search-section">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar ajustes..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    <FaTimesClear />
                  </button>
                )}
              </div>
            </section>
          )}
          <div className="cards-setting">
            <div className="settings-card">
              <h3>Monto Base de Cuota</h3>
              <p>Define el precio de las cuotas para el próximo mes.</p>
              <div className="input-group">
                <input
                  type="number"
                  value={cuotaBase}
                  onChange={(e) => setCuotaBase(e.target.value)}
                  className="cuota-input"
                  min="0"
                  placeholder="Ingrese monto"
                />
                <button
                  onClick={handleSaveCuotaBase}
                  disabled={loading}
                  className="action-button save-button"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
            <div className="settings-card">
              <h3>Actualizar Cuotas Pendientes</h3>
              <p>Cambia las cuotas no pagadas al monto base actual (días 1-10).</p>
              <button
                onClick={handleUpdatePendingCuotas}
                disabled={loading}
                className="action-button update-button"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          <div className="info-section">
            <FaInfoCircle className="info-icon" />
            <pre className="info-text">{infoMessage}</pre>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;