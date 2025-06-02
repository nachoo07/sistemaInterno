import { useState, useEffect, useContext } from 'react';
import { StudentsContext } from '../../context/student/StudentContext';
import { SharesContext } from '../../context/share/ShareContext';
import { EmailContext } from '../../context/email/EmailContext';
import { LoginContext } from '../../context/login/LoginContext'; // Añadimos LoginContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, FaUsers, FaMoneyBill, FaChartBar, FaExchangeAlt, FaCalendarCheck, 
  FaUserCog, FaCog, FaEnvelope, FaHome, FaSearch, FaArrowLeft, FaTimes, FaCheck, FaTrash,
  FaUserCircle, FaChevronDown, FaTimes as FaTimesClear
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './emailNotification.css';
import AppNavbar from '../navbar/AppNavbar';

const EmailNotification = () => {
  const { estudiantes, obtenerEstudiantes } = useContext(StudentsContext);
  const { cuotas, obtenerCuotas } = useContext(SharesContext);
  const { sendMultipleEmails } = useContext(EmailContext);
  const { waitForAuth } = useContext(LoginContext); // Añadimos waitForAuth
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [displayMessage, setDisplayMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isOverdueMode, setIsOverdueMode] = useState(false);
  const [cuotaBase, setCuotaBase] = useState(30000);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
      if (newWidth < 576) {
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
    const loadData = async () => {
      setDataLoading(true);
      try {
        await waitForAuth(); // Espera a que la autenticación esté lista
        await Promise.all([obtenerEstudiantes(), obtenerCuotas(), fetchCuotaBase()]);
      } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los datos iniciales.', 'error');
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [obtenerEstudiantes, obtenerCuotas, waitForAuth]); // Añadimos waitForAuth como dependencia

  const fetchCuotaBase = async () => {
    try {
      const response = await axios.get('/api/config/cuotaBase', { withCredentials: true });
      setCuotaBase(response.data.value || 30000);
    } catch (error) {
      console.error('Error al obtener cuota base:', error);
      setCuotaBase(30000);
    }
  };

  useEffect(() => {
    const filtered = estudiantes.filter(student => {
      const searchNormalized = globalSearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const nameNormalized = student.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const lastNameNormalized = student.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const fullName = `${nameNormalized} ${lastNameNormalized}`;
      return fullName.includes(searchNormalized);
    }).filter(student => !selectedStudents.some(s => s._id === student._id));
    setFilteredStudents(filtered);
  }, [globalSearchTerm, estudiantes, selectedStudents]);

  const handleSelectStudent = (student) => {
    if (student.state === 'Inactivo') {
      Swal.fire('Error', 'No se puede seleccionar un estudiante inactivo.', 'error');
      return;
    }
    if (!student.mail) {
      Swal.fire('Error', 'El estudiante no tiene un correo registrado.', 'error');
      return;
    }
    setSelectedStudents([...selectedStudents, student]);
    setSearchTerm('');
    setIsOverdueMode(false);
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
    if (isOverdueMode) {
      generateOverdueMessages(selectedStudents.filter(s => s._id !== studentId));
    }
  };

  const handleSelectAll = () => {
    const activeStudents = estudiantes.filter(s => s.state === 'Activo' && s.mail);
    if (activeStudents.length === 0) {
      Swal.fire('Advertencia', 'No hay estudiantes activos con correo registrado.', 'warning');
      return;
    }
    setSelectedStudents(activeStudents);
    setSearchTerm('');
    setIsOverdueMode(false);
    setSubject('');
    setDisplayMessage('');
  };

  const generateOverdueMessages = (students) => {
    if (students.length === 0) {
      setSubject('');
      setDisplayMessage('');
      return [];
    }
    const emails = [];
    let summary = '';

    students.forEach(student => {
      const studentCuotas = cuotas.filter(
        c => c.student && c.student._id && c.student._id.toString() === student._id.toString() && c.state === 'Vencido'
      );
      if (studentCuotas.length > 0) {
        const cuotaDetails = studentCuotas.map(cuota => {
          const cuotaDate = new Date(cuota.date);
          return `- ${monthNames[cuotaDate.getMonth()]} ${cuotaDate.getFullYear()}: $${cuota.amount.toLocaleString('es-ES')}`;
        }).join('\n');

        const totalAmount = studentCuotas.reduce((sum, c) => sum + c.amount, 0);

        const emailContent = `
          <h2>Recordatorio de cuotas vencidas - ${student.name} ${student.lastName}</h2>
          <p>Estimado/a Padre/Madre</p>
          <p>Le informamos que las siguientes cuotas se encuentran vencidas:</p>
          <p>${cuotaDetails}</p>
          <p>Total adeudado: $${totalAmount.toLocaleString('es-ES')}</p>
          <p>Por favor, regularice la situación a la brevedad. Contáctenos si necesita más información.</p>
          <p>Saludos cordiales,<br>Equipo Yo Claudio</p>
        `;

        emails.push({
          recipient: student.mail,
          subject: `Recordatorio de cuotas vencidas - ${student.name} ${student.lastName}`,
          message: emailContent,
        });

        summary += `Cuotas vencidas para ${student.name} ${student.lastName}:\n${studentCuotas.map(cuota => {
          const cuotaDate = new Date(cuota.date);
          return `- ${monthNames[cuotaDate.getMonth()]} ${cuotaDate.getFullYear()}: $${cuota.amount.toLocaleString('es-ES')}`;
        }).join('\n')}\nTotal adeudado: $${totalAmount.toLocaleString('es-ES')}\n\n`;
      }
    });

    setSubject('Recordatorio de cuotas vencidas');
    setDisplayMessage(summary.trim());
    return emails;
  };

  const handleSelectOverdue = async () => {
    if (!Array.isArray(cuotas) || cuotas.length === 0) {
      Swal.fire('Advertencia', 'No hay cuotas cargadas en el sistema.', 'warning');
      return;
    }
    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      Swal.fire('Advertencia', 'No hay estudiantes cargados en el sistema.', 'warning');
      return;
    }

    const studentsWithOverdue = [];
    const processedStudents = new Set();

    cuotas.forEach(cuota => {
      if (cuota.state === 'Vencido' && cuota.student && cuota.student._id) {
        const studentId = cuota.student._id.toString();
        if (!processedStudents.has(studentId)) {
          const student = estudiantes.find(s => s._id.toString() === studentId && s.mail && s.state === 'Activo');
          if (student) {
            studentsWithOverdue.push(student);
            processedStudents.add(studentId);
          }
        }
      }
    });

    if (studentsWithOverdue.length === 0) {
      Swal.fire('Información', 'No hay estudiantes con cuotas vencidas y correo registrado.', 'info');
      return;
    }

    setSelectedStudents(studentsWithOverdue);
    setSearchTerm('');
    setIsOverdueMode(true);
    generateOverdueMessages(studentsWithOverdue);
  };

  const handleCancel = () => {
    setSelectedStudents([]);
    setSubject('');
    setDisplayMessage('');
    setSearchTerm('');
    setGlobalSearchTerm('');
    setIsOverdueMode(false);
  };

  const handleClearEmail = () => {
    setSubject('');
    setDisplayMessage('');
  };

  const handleSendToAll = async () => {
    if (selectedStudents.length === 0) {
      Swal.fire('Error', 'Selecciona al menos un estudiante.', 'error');
      return;
    }

    const emails = isOverdueMode ? generateOverdueMessages(selectedStudents) : [{
      recipient: selectedStudents.map(s => s.mail).join(','),
      subject,
      message: displayMessage || 'Mensaje no especificado',
    }];

    if (emails.length === 0) {
      Swal.fire('Error', 'No hay mensajes válidos para enviar. Verifica que los estudiantes seleccionados tengan cuotas vencidas.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Confirmar envío?',
      text: `Se enviarán ${emails.length} correos personalizados a los estudiantes seleccionados.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      await sendMultipleEmails(emails);
      Swal.fire('¡Éxito!', `Se enviaron ${emails.length} correos correctamente.`, 'success');
      handleCancel();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

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
          <div className="nav-left-section"></div>
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
                    className={`sidebar-menu-item ${item.route === '/email-notifications' ? 'active' : ''}`}
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
              <h1>Enviar Correos</h1>
            </div>
          </section>
          {windowWidth > 576 && (
            <section className="search-section">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  className="search-input"
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                />
                {globalSearchTerm && (
                  <button
                    className="search-clear"
                    onClick={() => setGlobalSearchTerm('')}
                  >
                    <FaTimesClear />
                  </button>
                )}
              </div>
            </section>
          )}
          {dataLoading && <p>Cargando datos...</p>}
          <section className="student-selection">
            <h2>Seleccionar Estudiantes</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="student-search-input"
              disabled={loading || dataLoading}
              placeholder="Buscar estudiante..."
            />
            {searchTerm && (
              <div className="student-dropdown">
                {filteredStudents.length ? (
                  filteredStudents.map(student => (
                    <div
                      key={student._id}
                      className="student-option"
                      onClick={() => handleSelectStudent(student)}
                    >
                      {student.name} {student.lastName} ({student.mail || 'Sin correo'}) {student.state === 'Inactivo' && '[Inactivo]'}
                    </div>
                  ))
                ) : (
                  <div className="student-option">No hay coincidencias</div>
                )}
              </div>
            )}
            <div className="selected-students">
              {selectedStudents.map(student => (
                <div key={student._id} className="selected-student">
                  {student.name} {student.lastName}
                  <FaTimes onClick={() => handleRemoveStudent(student._id)} />
                </div>
              ))}
            </div>
            <div className="selection-actions">
              <button onClick={handleSelectAll} disabled={loading || dataLoading}>Todos Activos</button>
              <button onClick={handleSelectOverdue} disabled={loading || dataLoading}>Cuotas Vencidas</button>
              <button onClick={handleCancel} disabled={loading || dataLoading}>Cancelar</button>
            </div>
          </section>
          <section className="email-composition">
            <h2>Componer Correo</h2>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="email-subject"
              disabled={loading || dataLoading || isOverdueMode}
              placeholder="Asunto..."
            />
            <textarea
              value={displayMessage}
              onChange={(e) => setDisplayMessage(e.target.value)}
              className="email-message"
              disabled={loading || dataLoading || isOverdueMode}
              placeholder="Mensaje..."
            />
            <div className="email-actions">
              <button onClick={handleClearEmail} disabled={loading || dataLoading || isOverdueMode}>Borrar</button>
              <button onClick={handleSendToAll} disabled={loading || dataLoading}>
                {loading ? 'Enviando...' : `Enviar a ${selectedStudents.length} Seleccionado(s)`}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmailNotification;