import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserGraduate,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaBell,
  FaChartBar,
  FaUsers,
  FaClipboard,
  FaHome,
  FaArrowLeft,
} from 'react-icons/fa';
import './Vertical.css';
import logo from '../../assets/logo.png';

const VerticalMenu = ({ children }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Inicio', icon: <FaHome className="nav-icon" />, route: '/' },
    { name: 'Alumnos', icon: <FaUserGraduate className="nav-icon" />, route: '/student' },
    { name: 'Asistencia', icon: <FaClipboard className="nav-icon" />, route: '/attendance' },
    { name: 'Cuotas', icon: <FaMoneyBillWave className="nav-icon" />, route: '/share' },
    { name: 'Notificaciones', icon: <FaBell className="nav-icon" />, route: '/notification' },
    { name: 'Movimientos', icon: <FaExchangeAlt className="nav-icon" />, route: '/motion' },
    { name: 'Reporte', icon: <FaChartBar className="nav-icon" />, route: '/report' },
    { name: 'Usuarios', icon: <FaUsers className="nav-icon" />, route: '/user' }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <div className="vertical-nav">
        <div className="nav-logo">
          <img src={logo} 
          width="100"
          height="70" />
          <h1>Yo Claudio</h1>
        </div>
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className="nav-item"
              onClick={() => navigate(item.route)}
            >
              {item.icon} {item.name}
            </li>
          ))}
        </ul>
        <ul className="nav-list nav-footer">
          <li
            className="nav-item"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="nav-icon" /> Volver
          </li>
        </ul>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default VerticalMenu;