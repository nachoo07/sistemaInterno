import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentsContext } from '../../context/student/StudentContext';
import { LoginContext } from '../../context/login/LoginContext';
import axios from 'axios';
import { FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt, 
  FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft, FaTimes } from 'react-icons/fa'; // Agregamos FaTimes
import Swal from 'sweetalert2';
import './notification.css';

const Notifications = () => {
  const { estudiantes, obtenerEstudiantes } = useContext(StudentsContext);
  const { auth } = useContext(LoginContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(null);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventMessage, setNewEventMessage] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    obtenerEstudiantes();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/notifications', { withCredentials: true });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
    }
  };

  const fullMenuItems = [
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

  const userMenuItems = fullMenuItems.filter(item =>
    ['Inicio', 'Notificaciones', 'Asistencia'].includes(item.name)
  );

  const menuItems = auth === 'admin' ? fullMenuItems : userMenuItems;

  const handleCreateNotification = async (type) => {
    if (type === 'event' && (!newEventDate || !newEventMessage)) {
      Swal.fire('Error', 'Por favor completa la fecha y el mensaje del evento.', 'error');
      return;
    }
    if (type === 'reminder' && (!newReminderDate || !newReminderMessage)) {
      Swal.fire('Error', 'Por favor completa la fecha y el mensaje del recordatorio.', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/notifications/create', {
        type,
        message: type === 'event' ? newEventMessage : newReminderMessage,
        date: type === 'event' ? newEventDate : newReminderDate,
      }, { withCredentials: true });
      Swal.fire('¡Éxito!', `${type === 'event' ? 'Evento' : 'Recordatorio'} creado correctamente`, 'success');
      setShowCreateModal(null);
      setNewEventDate('');
      setNewEventMessage('');
      setNewReminderDate('');
      setNewReminderMessage('');
      fetchNotifications();
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear la notificación', 'error');
    }
  };

  const handleDeleteNotification = async (id) => {
    const confirmation = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la notificación permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/notifications/delete/${id}`, { withCredentials: true });
        Swal.fire('¡Eliminada!', 'La notificación ha sido eliminada correctamente.', 'success');
        setNotifications(notifications.filter(n => n._id !== id)); // Actualizar estado localmente
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la notificación.', 'error');
        console.error('Error eliminando notificación:', error);
      }
    }
  };

  const getBirthdayNotifications = () => {
    const today = new Date();
    const birthdays = estudiantes
      .filter(student => {
        if (!student.birthDate) return false;
        const birthDate = new Date(student.birthDate);
        const isValidDate = !isNaN(birthDate.getTime());
        if (!isValidDate) return false;
        const todayDay = today.getUTCDate();
        const todayMonth = today.getUTCMonth();
        const birthDay = birthDate.getUTCDate();
        const birthMonth = birthDate.getUTCMonth();
        return birthDay === todayDay && birthMonth === todayMonth;
      })
      .map(student => ({
        type: 'birthday',
        student: { _id: student._id, name: student.name, lastName: student.lastName, mail: student.mail, birthDate: student.birthDate },
        message: `¡Feliz cumpleaños, ${student.name} ${student.lastName}! 🎉`,
      }));
    return birthdays;
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const displayNotifications = filter === 'birthday'
    ? getBirthdayNotifications()
    : filter === 'all'
    ? [...filteredNotifications, ...getBirthdayNotifications()]
    : filteredNotifications;

  return (
    <div className="dashboard-container-notification">
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
      <div className="notifications-content">
        <h1 className="notifications-title">Notificaciones</h1>
        <div className="filter-buttons">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Todo</button>
          <button onClick={() => setFilter('birthday')} className={filter === 'birthday' ? 'active' : ''}>Cumpleaños</button>
          <button onClick={() => setFilter('event')} className={filter === 'event' ? 'active' : ''}>Eventos</button>
          <button onClick={() => setFilter('reminder')} className={filter === 'reminder' ? 'active' : ''}>Recordatorios</button>
        </div>
        {auth === 'admin' && (
          <div className="create-buttons">
            <button onClick={() => setShowCreateModal('event')}>Crear Evento</button>
            <button onClick={() => setShowCreateModal('reminder')}>Crear Recordatorio</button>
          </div>
        )}
        <div className="notifications-list">
          {displayNotifications.map((notification, index) => (
            <div
              key={index}
              className="notification-item"
              data-type={notification.type}
            >
              <div className="notification-type">
                {notification.type === 'birthday' && '🎂 Cumpleaños'}
                {notification.type === 'event' && '🎉 Evento'}
                {notification.type === 'reminder' && '⏰ Recordatorio'}
              </div>
              {notification.student && (
                <p className="notification-student">
                  👤 <strong>{notification.student.name} {notification.student.lastName}</strong>
                </p>
              )}
              <p className="notification-message">
                💌 {notification.message}
              </p>
              {notification.date && (
                <p className="notification-date">
                  📅 {new Date(notification.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
              {notification.expirationDate && (
                <p className="notification-date">
                  ⏳ Vence: {new Date(notification.expirationDate).toLocaleDateString('es-ES')}
                </p>
              )}
              {notification.type === 'birthday' && (
                <p className="notification-date">
                  🎈 Fecha de Nacimiento: {new Date(notification.student.birthDate).toUTCString().split(' ')[1] + ' ' + monthNames[new Date(notification.student.birthDate).getUTCMonth()] + ' ' + new Date(notification.student.birthDate).getUTCFullYear()}
                </p>
              )}
              {notification.type !== 'birthday' && auth === 'admin' && (
                <button
                  className="delete-notification-btn"
                  onClick={() => handleDeleteNotification(notification._id)}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
        {showCreateModal && (
          <div className="notification-modal">
            <div className="notification-modal-content">
              <h2>{showCreateModal === 'event' ? 'Crear Evento' : 'Crear Recordatorio'}</h2>
              <input
                type="date"
                value={showCreateModal === 'event' ? newEventDate : newReminderDate}
                onChange={e => showCreateModal === 'event' ? setNewEventDate(e.target.value) : setNewReminderDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <textarea
                placeholder="Escribe el mensaje aquí..."
                value={showCreateModal === 'event' ? newEventMessage : newReminderMessage}
                onChange={e => showCreateModal === 'event' ? setNewEventMessage(e.target.value) : setNewReminderMessage(e.target.value)}
              />
              <div className="notification-modal-actions">
                <button onClick={() => handleCreateNotification(showCreateModal)}>Crear</button>
                <button onClick={() => setShowCreateModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;