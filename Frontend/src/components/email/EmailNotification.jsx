import React, { useState, useEffect, useContext } from 'react';
import { StudentsContext } from '../../context/student/StudentContext';
import { SharesContext } from '../../context/share/ShareContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt,
  FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaSearch, FaArrowLeft, FaTimes, FaCheck, FaTrash
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './emailNotification.css';

const EmailNotification = () => {
  const { estudiantes, obtenerEstudiantes } = useContext(StudentsContext);
  const { cuotas, obtenerCuotas } = useContext(SharesContext);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
    { name: 'Volver Atrás', route: null, action: () => navigate(-1), icon: <FaArrowLeft /> },
  ];

  useEffect(() => {
    obtenerEstudiantes();
    obtenerCuotas();
    console.log('Cuotas cargadas:', cuotas); // Para depurar
  }, []);

  useEffect(() => {
    const filtered = estudiantes.filter(student => {
      const fullName = `${student.name} ${student.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) && !selectedStudents.some(s => s._id === student._id);
    });
    setFilteredStudents(filtered);
  }, [searchTerm, estudiantes, selectedStudents]);

  const handleSelectStudent = (student) => {
    if (student.state === 'Inactivo') {
      Swal.fire('Error', 'No se puede seleccionar un estudiante inactivo.', 'error');
      return;
    }
    setSelectedStudents([...selectedStudents, student]);
    setSearchTerm('');
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
  };

  const handleSelectAll = () => {
    const activeStudents = estudiantes.filter(s => s.state === 'Activo' && s.mail);
    setSelectedStudents(activeStudents);
    setSearchTerm('');
  };

  const handleCancel = () => {
    setSelectedStudents([]);
    setSubject('');
    setMessage('');
    setSearchTerm('');
  };

  const handleClearEmail = () => {
    setSubject('');
    setMessage('');
  };

  const sendEmail = async (recipients) => {
    if (!recipients.length || !subject || !message) {
      Swal.fire('Error', 'Selecciona al menos un estudiante, un asunto y un mensaje.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/email/send', { recipients, subject, message }, { withCredentials: true });
      Swal.fire('¡Éxito!', `Correo(s) enviado(s) a ${recipients.length} destinatario(s)`, 'success');
      handleCancel();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo enviar el correo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendIndividualEmail = () => {
    if (selectedStudents.length !== 1) {
      Swal.fire('Error', 'Selecciona exactamente un estudiante para esta opción.', 'error');
      return;
    }
    sendEmail([selectedStudents[0].mail]);
  };

  const handleSendToAll = () => {
    const recipients = selectedStudents.map(s => s.mail);
    sendEmail(recipients);
  };

  const generateDebtMessage = () => {
    if (selectedStudents.length !== 1) {
      Swal.fire('Error', 'Selecciona un solo estudiante para este mensaje.', 'error');
      return;
    }
    const student = selectedStudents[0];
  
    if (!Array.isArray(cuotas) || cuotas.length === 0) {
      Swal.fire('Advertencia', 'No hay cuotas cargadas en el sistema.', 'warning');
      return;
    }
  
    const studentCuotas = cuotas.filter(c => c.student && c.student._id && c.student._id.toString() === student._id.toString());
  
    if (studentCuotas.length === 0) {
      setSubject(`Estado de cuotas de ${student.name} ${student.lastName} ⚽`);
      setMessage(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estado de Cuotas</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 10px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                  <tr>
                    <td style="padding: 10px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <h1 style="color: #D83D8D; font-size: 20px; font-weight: bold; margin: 0;">
                              Estado de cuotas de ${student.name} ${student.lastName}
                            </h1>
                          </td>
                          <td align="right">
                            <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo Yo Claudio" style="width: 100px; height: auto;" />
                          </td>
                        </tr>
                      </table>
                      <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                        No encontramos cuotas asociadas a ${student.name} ${student.lastName} en el sistema. Esto puede deberse a un error o a que no tiene cuotas registradas.
                      </p>
                      <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                        Saludos cordiales.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `);
      return;
    }
  
    const vencidas = studentCuotas.filter(c => c.state === 'Vencido');
    if (vencidas.length === 0) {
      setSubject(`Estado de cuotas de ${student.name} ${student.lastName} ⚽`);
      setMessage(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estado de Cuotas</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 10px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                  <tr>
                    <td style="padding: 10px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <h1 style="color: #D83D8D; font-size: 20px; font-weight: bold; margin: 0;">
                              Estado de cuotas de ${student.name} ${student.lastName}
                            </h1>
                          </td>
                          <td align="right">
                            <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo Yo Claudio" style="width: 100px; height: auto;" />
                          </td>
                        </tr>
                      </table>
                      <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                        ${student.name} ${student.lastName} no tiene cuotas vencidas actualmente 🎉.<br>
                        Puede haber cuotas pendientes o pagadas, pero ninguna en estado de deuda.
                      </p>
                      <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                        Saludos cordiales.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `);
      return;
    }
  
    const totalDeuda = vencidas.reduce((sum, c) => sum + c.amount, 0);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const deudaDetallada = vencidas
      .map(c => {
        const date = new Date(c.date);
        if (isNaN(date.getTime())) {
          return `Fecha inválida: $${c.amount.toLocaleString('es-ES')}`;
        }
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}: $${c.amount.toLocaleString('es-ES')}`;
      })
      .join('<br>');
  
    setSubject(`Recordatorio de cuotas vencidas - ${student.name} ${student.lastName} ⚽`);
    setMessage(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Cuotas</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                <tr>
                  <td style="padding: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h1 style="color: #D83D8D; font-size: 20px; font-weight: bold; margin: 0;">
                            Recordatorio de cuotas vencidas - ${student.name} ${student.lastName}
                          </h1>
                        </td>
                        <td align="right">
                          <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo Yo Claudio" style="width: 100px; height: auto;" />
                        </td>
                      </tr>
                    </table>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      ${student.name} ${student.lastName} tiene ${vencidas.length} cuota(s) vencida(s):
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2;">
                      ${deudaDetallada}
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      <strong>Total adeudado:</strong> $${totalDeuda.toLocaleString('es-ES')}
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      Por favor, regularice la situación.
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      Saludos cordiales.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `);
  };
  const generateEventMessage = () => {
    const student = selectedStudents.length === 1 ? selectedStudents[0] : null;
    setSubject(
      selectedStudents.length === 1
        ? `Invitación a evento - ${student.name} ${student.lastName} ⚽`
        : 'Invitación a evento para todos ⚽'
    );
    setMessage(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación a Evento</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                <tr>
                  <td style="padding: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h1 style="color: #D83D8D; font-size: 20px; font-weight: bold; margin: 0;">
                            ${selectedStudents.length === 1
                              ? `Invitación a evento - ${student.name} ${student.lastName}`
                              : 'Invitación a evento para todos'}
                          </h1>
                        </td>
                        <td align="right">
                          <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo Yo Claudio" style="width: 100px; height: auto;" />
                        </td>
                      </tr>
                    </table>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      Le invitamos a nuestro próximo evento: "Reunión de Padres" el viernes a las 18:00 hs.<br>
                      Esperamos contar con su presencia ⚽.
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      Saludos cordiales.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `);
  };

  const generateBirthdayMessage = () => {
    if (selectedStudents.length !== 1) {
      Swal.fire('Error', 'Selecciona un solo estudiante para este mensaje.', 'error');
      return;
    }
    const student = selectedStudents[0];
    const birthDate = new Date(student.birthDate);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
    setSubject(`¡Feliz cumpleaños, ${student.name}! 🎂`);
    setMessage(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feliz Cumpleaños</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                <tr>
                  <td style="padding: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h1 style="color: #D83D8D; font-size: 20px; font-weight: bold; margin: 0;">
                            ¡Feliz cumpleaños, ${student.name}! 🎉🎂
                          </h1>
                        </td>
                        <td align="right">
                          <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo Yo Claudio" style="width: 100px; height: auto;" />
                        </td>
                      </tr>
                    </table>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      ¡Queremos desearle un muy feliz cumpleaños a ${student.name} ${student.lastName} en su día especial, el ${birthDate.getDate()} de ${monthNames[birthDate.getMonth()]}! Que tenga un año lleno de alegría y éxitos.
                    </p>
                    <p style="color: #333333; font-size: 14px; line-height: 1.2; margin-top: 10px;">
                      Saludos cordiales.
                    </p>
                    <!-- Foto del alumno -->
                    <div style="text-align: center; margin-top: 10px;">
                      <img src="${student.profileImage || 'https://via.placeholder.com/150'}" alt="Foto de ${student.name}" style="width: 150px; height: 150px; border-radius: 8px; object-fit: cover;" />
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `);
  };

  return (
    <div className="email-notification-container">
      <div className={`sidebar ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </div>
        {menuItems.map((item, index) => (
          <div key={index} className="sidebar-item" onClick={() => item.action ? item.action() : navigate(item.route)}>
            <span className="icon">{item.icon}</span>
            <span className="text">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="email-notification-content">
        <h1 className="email-notification-title">Enviar Correos</h1>

        <div className="student-selection-card">
          <h3>Seleccionar Estudiantes</h3>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="student-search-input"
            />
            <FaSearch className="search-icon" />
            {searchTerm && (
              <ul className="student-search-results">
                {filteredStudents.length ? (
                  filteredStudents.map(student => (
                    <li key={student._id} onClick={() => handleSelectStudent(student)}>
                      <FaCheck className="check-icon" /> {student.name} {student.lastName} ({student.mail || 'Sin correo'}) {student.state === 'Inactivo' && '[Inactivo]'}
                    </li>
                  ))
                ) : (
                  <li>No hay coincidencias</li>
                )}
              </ul>
            )}
          </div>

          <div className="selected-students">
            {selectedStudents.map(student => (
              <div key={student._id} className="selected-student-chip">
                {student.name} {student.lastName}
                <FaTimes className="remove-icon" onClick={() => handleRemoveStudent(student._id)} />
              </div>
            ))}
          </div>

          <div className="selection-actions">
            <button onClick={handleSelectAll} disabled={loading} className="select-all-btn">Todos Activos</button>
            <button onClick={handleCancel} disabled={loading} className="cancel-btn">Cancelar</button>
          </div>
        </div>

        <div className="email-composer-card">
          <h3>Componer Correo</h3>
          <input
            type="text"
            placeholder="Asunto"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="email-subject"
          />
          <textarea
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="email-message"
          />
          <div className="email-actions">
            {selectedStudents.length === 1 && (
              <>
                <button onClick={generateDebtMessage} disabled={loading}>Deuda</button>
                <button onClick={generateBirthdayMessage} disabled={loading}>Cumpleaños</button>
              </>
            )}
            <button onClick={generateEventMessage} disabled={loading}>Evento</button>
            <button onClick={handleClearEmail} disabled={loading} className="clear-btn">
              <FaTrash /> Borrar
            </button>
            {selectedStudents.length === 1 && (
              <button onClick={handleSendIndividualEmail} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar a Seleccionado'}
              </button>
            )}
            <button onClick={handleSendToAll} disabled={loading}>
              {loading ? 'Enviando...' : `Enviar a ${selectedStudents.length} Seleccionado(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotification;