import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUsers, FaSearch, FaList, FaClipboardList, FaMoneyBill, FaExchangeAlt, FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft, FaUserCircle, FaChevronDown, FaTimes as FaTimesClear } from 'react-icons/fa';
import { StudentsContext } from "../../context/student/StudentContext";
import { LoginContext } from "../../context/login/LoginContext";
import "./detailStudent.css";
import AppNavbar from '../navbar/AppNavbar';
import logo from '../../assets/logoyoclaudio.png';

const StudentDetail = () => {
  const { obtenerEstudiantePorId, selectedStudent, loading } = useContext(StudentsContext);
  const { logout, userData } = useContext(LoginContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome />, category: 'principal' },
    { name: 'Alumnos', route: '/student', icon: <FaUsers />, category: 'principal' },
    { name: 'Cuotas', route: '/share', icon: <FaMoneyBill />, category: 'finanzas' },
    { name: 'Movimientos', route: '/motion', icon: <FaExchangeAlt />, category: 'finanzas' },
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck />, category: 'principal' },
    { name: 'Usuarios', route: '/user', icon: <FaUserCog />, category: 'configuracion' },
    { name: 'Ajustes', route: '/settings', icon: <FaCog />, category: 'configuracion' },
    { name: 'Envíos de Mail', route: '/email-notifications', icon: <FaEnvelope />, category: 'comunicacion' },
    { name: 'Listado de Alumnos', route: '/liststudent', icon: <FaClipboardList />, category: 'informes' },
    { name: 'Lista de Movimientos', route: '/listeconomic', icon: <FaList />, category: 'finanzas' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth <= 576) {
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
    obtenerEstudiantePorId(id);
  }, [id, obtenerEstudiantePorId]);

  const formatDate = (date) => {
    if (!date) return '';
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return adjustedDate.toLocaleDateString('es-ES', options);
  };

  const handleViewShares = () => {
    const queryString = location.search;
    navigate(`/share/${id}${queryString}`);
  };

  const handleViewPayments = () => {
    const queryString = location.search;
    navigate(`/paymentstudent/${id}${queryString}`);
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg';
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBack = () => {

    navigate(`/student${location.search}`);
  };

  if (loading) {
    return <div className="loading-text">Cargando...</div>;
  }

  if (!selectedStudent || selectedStudent._id !== id) {
    return <div className="loading-text">Estudiante no encontrado</div>;
  }

  return (
    <div className={`app-container ${windowWidth <= 576 ? 'mobile-view' : ''}`}>
      {windowWidth <= 576 && (
        <AppNavbar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
        />
      )}
      {windowWidth > 576 && (
        <header className="desktop-nav-header">
          <div className="header-logo-setting" onClick={() => navigate('/')}>
            <img src={logo} alt="Valladares Fútbol" className="logo-image" />
          </div>
          <div className="nav-right-section">
            <div
              className="profile-container"
              ref={profileRef}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FaUserCircle className="profile-icon" />
              <span className="profile-greeting">
                Hola, {userData?.name || 'Usuario'}
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
              <button className="menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
              <ul className="sidebar-menu">
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    className={`sidebar-menu-item ${item.route === '/student' ? 'active' : ''}`}
                    onClick={() => item.route && navigate(item.route)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>
        <main className="main-content">
          <div className="perfil-container">
            <div className="perfil-header">
              <div className="perfil-avatar">
                <img
                  src={selectedStudent.profileImage}
                  alt="Perfil"
                  onError={handleImageError}
                  className="avatar-img"
                />
              </div>
              <div className="perfil-info">
                <h2>{selectedStudent.name} {selectedStudent.lastName}</h2>
                <p className="perfil-status">Estado: <span className={`state-${selectedStudent.state.toLowerCase()}`}>{selectedStudent.state}</span></p>
                <div className="perfil-buttons">
                  <button className="action-btn-header" onClick={handleViewShares}>
                    Cuotas
                  </button>
                  <button className="action-btn-header" onClick={handleViewPayments}>
                    Pagos
                  </button>
                  <button className="action-btn-header" onClick={handleBack}>
                    <FaArrowLeft /> Volver Atrás
                  </button>
                </div>
              </div>
            </div>
            <div className="perfil-details">
              <div className="details-section">
                <h3>Información Personal</h3>
                <div className="details-row">
                  <div className="form-group">
                    <label className="label-text">DNI</label>
                    <input type="text" value={selectedStudent.cuil || ''} readOnly className="form-control-custom" />
                  </div>
                  <div className="form-group">
                    <label className="label-text">Fecha de Nacimiento</label>
                    <input type="text" value={formatDate(selectedStudent.birthDate)} readOnly className="form-control-custom" />
                  </div>
                  <div className="form-group">
                    <label className="label-text">Dirección</label>
                    <input type="text" value={selectedStudent.address || ''} readOnly className="form-control-custom" />
                  </div>
                </div>
              </div>
              <div className="details-section">
                <h3>Información de Contacto</h3>
                <div className="details-row">
                  <div className="form-group">
                    <label className="label-text">Email</label>
                    <input type="text" value={selectedStudent.mail || ''} readOnly className="form-control-custom" />
                  </div>
                  <div className="form-group">
                    <label className="label-text">Nombre del Tutor</label>
                    <input type="text" value={selectedStudent.guardianName || ''} readOnly className="form-control-custom" />
                  </div>
                  <div className="form-group">
                    <label className="label-text">Teléfono del Tutor</label>
                    <input type="text" value={selectedStudent.guardianPhone || ''} readOnly className="form-control-custom" />
                  </div>
                </div>
              </div>
              <div className="details-container">
                <div className="details-section">
                  <h3>Otros Datos</h3>
                  <div className="details-row">
                    <div className="form-group">
                      <label className="label-text">Categoría</label>
                      <input type="text" value={selectedStudent.category || ''} readOnly className="form-control-custom" />
                    </div>
                    <div className="form-group">
                      <label className="label-text">Liga</label>
                      <input
                        type="text"
                        value={selectedStudent.league === 'Si' ? 'Si' : selectedStudent.league === 'No' ? 'No' : 'No especificado'}
                        readOnly
                        className="form-control-custom"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label-text">Descuento por Hermanos</label>
                      <input type="text" value={selectedStudent.hasSiblingDiscount ? 'Sí' : 'No'} readOnly className="form-control-custom" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetail;