import React, { useState, useEffect, useContext } from 'react';
import { SharesContext } from '../../context/share/ShareContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt, FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './settings.css';

const Settings = () => {
  const { obtenerCuotas } = useContext(SharesContext);
  const [cuotaBase, setCuotaBase] = useState(30000);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome /> },
    { name: 'Alumnos', route: '/student', icon: <FaUsers /> },
    { name: 'Notificaciones', route: '/notification', icon: <FaBell /> },
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
    fetchCuotaBase();
  }, []);

  const fetchCuotaBase = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/config/cuotaBase', { withCredentials: true });
      setCuotaBase(response.data.value || 30000);
    } catch (error) {
      console.error('Error al obtener cuota base:', error);
    }
  };

  const handleSaveCuotaBase = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/config/set', {
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
      const response = await axios.put('http://localhost:4000/api/shares/update-pending', {}, { withCredentials: true });
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

  const infoMessage = `
  Cómo Usar los Ajustes de Cuotas
  1. Monto Base de Cuota: Este es el precio que tendrán las cuotas del próximo mes. Por ejemplo, si hoy (6 de marzo) cambias el monto de $40.000 a $45.000 y hacés clic en "Guardar Monto Base", las cuotas del 1 de abril serán $45.000. Las de este mes no cambian.  
  2. Actualizar Cuotas Pendientes: Si se te olvidó actualizar antes y las cuotas de este mes (por ejemplo, abril) siguen en $40.000, poné $45.000 en el monto base, guardalo y hacé clic en "Actualizar Cuotas". Esto cambia las cuotas no pagadas a $45.000, pero solo funciona del 1 al 10 de cada mes.  
`;
  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </div>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="sidebar-item"
            onClick={() => item.action ? item.action() : navigate(item.route)}
          >
            <span className="icon">{item.icon}</span>
            <span className="text">{item.name}</span>
          </div>
        ))}
      </div>
      <div className={`main-content ${!isMenuOpen ? 'expanded' : ''}`}>
        <h1 className="settings-title">Ajustes de Cuotas</h1>
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
      </div>
    </div>
  );
};

export default Settings;