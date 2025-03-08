import { useState, useContext, useEffect } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt, FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft } from 'react-icons/fa';
import { StudentsContext } from '../../context/student/StudentContext';
import StudentFormModal from '../modal/StudentFormModal';
import './Student.css';

const Student = () => {
  const navigate = useNavigate();
  const { estudiantes, obtenerEstudiantes, addEstudiante } = useContext(StudentsContext);

  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [formData, setFormData] = useState({
    name: '', lastName: '', cuil: '', birthDate: '', address: '', mail: '', category: '',
    motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', profileImage: null,
    comment: '', state: 'Activo', fee: 'pendiente'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const studentsPerPage = 10;
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
    { name: 'Volver Atrás', route: null, action: () => navigate(-1), icon: <FaArrowLeft /> } // Nueva opción
  ];

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const filteredStudents = estudiantes.filter((estudiante) => {
    const fullName = `${estudiante.name} ${estudiante.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || estudiante.cuil?.includes(searchTerm);
    const matchesState = filterState === '' || estudiante.state === filterState;
    return matchesSearch && matchesState;
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleShow = () => {
    setFormData({
      name: '', lastName: '', cuil: '', birthDate: '', address: '', mail: '', category: '',
      motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', profileImage: null,
      comment: '', state: 'Activo', fee: 'pendiente'
    });
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cuil) {
      setAlertMessage("El CUIL es obligatorio");
      setShowAlert(true);
      return;
    }
    await addEstudiante(formData);
    setShow(false);
  };

  return (
    <div className="dashboard-container-student">
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
      <div className="content-student">
        {showAlert && (
          <Alert
            variant="warning"
            onClose={() => setShowAlert(false)}
            dismissible
            className="custom-alert"
          >
            <Alert.Heading>¡Atención!</Alert.Heading>
            <p>{alertMessage}</p>
          </Alert>
        )}
        <div className="students-view">
          <h1 className="title">Panel de Alumnos</h1>
          <div className='students-header'>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o CUIL..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FaSearch className="search-icon" />
            </div>
            <div className="filter-actions">
              <div className="state-filter">
                <label className='estado'>Estado:</label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="actions">
                <Button className="add-btn" onClick={handleShow}>Agregar Alumno</Button>
              </div>
            </div>
          </div>
          <Table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((estudiante, index) => (
                <tr key={estudiante._id} className={`state-${estudiante.state.toLowerCase()}`}>
                  <td>{indexOfFirstStudent + index + 1}</td>
                  <td>{estudiante.name}</td>
                  <td>{estudiante.lastName}</td>
                  <td>{estudiante.state}</td>
                  <td>
                    <Button
                      className="action-btn"
                      onClick={() => navigate(`/detailstudent/${estudiante._id}`)}
                    >
                      Ver Más
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="pagination">
            <Button
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
              className="pagination-btn"
            >
              «
            </Button>
            {[...Array(Math.ceil(filteredStudents.length / studentsPerPage)).keys()].map((number) => (
              <Button
                key={number + 1}
                className={`pagination-btn ${currentPage === number + 1 ? 'active' : ''}`}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Button>
            ))}
            <Button
              disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
              onClick={() => paginate(currentPage + 1)}
              className="pagination-btn"
            >
              »
            </Button>
          </div>
        </div>
        <StudentFormModal
          show={show}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          formData={formData}
        />
      </div>
    </div>
  );
};

export default Student;