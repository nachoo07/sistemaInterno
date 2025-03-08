import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {FaSearch, FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt,FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft, FaEdit, FaTrash, FaMoneyBillWave } from 'react-icons/fa';
import { SharesContext } from "../../context/share/ShareContext";
import { StudentsContext } from "../../context/student/StudentContext";
import { Button, Table, Alert } from 'react-bootstrap';
import axios from "axios";
import "./share.css";

const Share = () => {
  const { cuotas, obtenerCuotasPorEstudiante, addCuota, updateCuota, deleteCuota, loading: loadingCuotas } = useContext(SharesContext);
  const { estudiantes, obtenerEstudiantes, loading: loadingEstudiantes } = useContext(StudentsContext);
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsWithStatus, setStudentsWithStatus] = useState([]);
  const [filterCuotaState, setFilterCuotaState] = useState("");
  const studentsPerPage = 10;
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const availableYears = [2025, 2026, 2027, 2028];

  useEffect(() => {
    obtenerEstudiantes();
    fetchStudentsWithStatus();
  }, []);

  useEffect(() => {
    if (studentId) {
      const student = estudiantes.find((est) => est._id === studentId);
      if (student) {
        setSelectedStudent(student);
        obtenerCuotasPorEstudiante(studentId);
      }
    }
  }, [studentId, estudiantes]);

  useEffect(() => {
    filterData();
  }, [cuotas, selectedYear]);

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

  const fetchStudentsWithStatus = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/shares/students-status", {
        withCredentials: true,
      });
      setStudentsWithStatus(response.data);
    } catch (error) {
      console.error("Error al obtener estados de estudiantes:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    obtenerCuotasPorEstudiante(student._id);
  };

  const filterData = () => {
    if (!selectedStudent || !Array.isArray(cuotas)) {
      setFilteredData([]);
      return;
    }
    const filtered = cuotas
      .filter((cuota) => cuota.student?._id === selectedStudent?._id && new Date(cuota.date).getFullYear() === selectedYear)
      .sort((a, b) => new Date(a.date).getMonth() - new Date(b.date).getMonth());
    setFilteredData(filtered);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!date || !amount || selectedMonth === "") {
      setAlertMessage("Por favor completa todos los campos.");
      setShowAlert(true);
      return;
    }

    if (selectedStudent.state === "Inactivo") {
      setAlertMessage("No se puede crear ni actualizar cuotas para un estudiante inactivo.");
      setShowAlert(true);
      return;
    }

    const cuotaDate = new Date(selectedYear, parseInt(selectedMonth), 1);

    const cuotaData = {
      student: selectedStudent._id,
      amount: parseFloat(amount),
      date: cuotaDate,
      paymentmethod: paymentMethod,
      paymentdate: date,
    };

    if (selectedCuota) {
      updateCuota({ ...cuotaData, _id: selectedCuota._id });
    } else {
      addCuota(cuotaData);
    }
    setAmount("");
    setDate("");
    setPaymentMethod("");
    setSelectedMonth("");
    setSelectedCuota(null);
    setIsEditing(false);
    fetchStudentsWithStatus();
  };

  const handleEditClick = (cuota) => {
    setSelectedCuota(cuota);
    setAmount(cuota.amount);
    setDate(formatDate(cuota.paymentdate));
    setPaymentMethod(cuota.paymentmethod);
    setSelectedMonth(new Date(cuota.date).getMonth().toString()); // Seteamos el índice del mes
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedCuota(null);
    setAmount("");
    setDate("");
    setPaymentMethod("");
    setSelectedMonth("");
    setIsEditing(false);
  };

  const handleDelete = (id) => {
    deleteCuota(id);
    fetchStudentsWithStatus();
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split("T")[0] : "";
  const formatMonth = (dateString) => months[new Date(dateString).getMonth()];

  const usedMonths = filteredData.map((cuota) => new Date(cuota.date).getMonth() + 1);
  const availableMonths = months.filter((_, index) => !usedMonths.includes(index + 1));

  const filteredStudents = studentsWithStatus.filter((student) => {
    const fullName = `${student.name} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesCuotaState = filterCuotaState === "" || student.status === filterCuotaState;
    return matchesSearch && matchesCuotaState;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard-container-share">
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
      <div className="content-share">
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
        {!selectedStudent ? (
          <div className="students-view">
            <h1 className="title">Panel de Cuotas</h1>
            <div className="share-header">
            <div className="search-bar">
              <input className="search-input"
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FaSearch className="search-icon" />
            </div>
            <div className="cuota-filter">
              <label>Estado de Cuota:</label>
              <select
                value={filterCuotaState}
                onChange={(e) => setFilterCuotaState(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Vencido">Vencido</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
            </div>
            {loadingEstudiantes ? (
              <p className="loading">Cargando estudiantes...</p>
            ) : (
              <>
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
                    {currentStudents.map((student, index) => (
                      <tr key={student._id}>
                        <td>{indexOfFirstStudent + index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.lastName}</td>
                        <td>{student.status}</td>
                        <td>
                          <Button
                            className="action-btn"
                            onClick={() => handleStudentSelect(student)}
                          >
                            Ver Cuotas
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
              </>
            )}
          </div>
        ) : (
          <>
            <div className="cuotas-view">
              <div className="cuotas-header">
                <h1 className="title">Cuotas de {selectedStudent.name} {selectedStudent.lastName}</h1>
              </div>
              <div className="year-filter">
                <div className="filter">
                <label className="label-ano">Año:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                </div>
                <Button className="back-btn" onClick={() => setSelectedStudent(null)}>Volver</Button>
              </div>
              <Table className="cuotas-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Monto</th>
                    <th className="metodo-pago">Método de Pago</th>
                    <th>Fecha de Pago</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((cuota) => (
                      <tr key={cuota._id} className={`state-${cuota.state.toLowerCase()}`}>
                        <td>{formatMonth(cuota.date)}</td>
                        <td>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(cuota.amount)}</td>
                        <td className="metodo-pago">{cuota.paymentmethod || "-"}</td>
                        <td>{cuota.paymentdate ? formatDate(cuota.paymentdate) : "-"}</td>
                        <td>{cuota.state}</td>
                        <td className="botones-acciones">
                          <Button
                            className="action-btn edit"
                            onClick={() => handleEditClick(cuota)}
                          >
                                        <span className="btn-text">{cuota.paymentmethod && cuota.paymentdate ? "Editar" : "Pagar"}</span>
                                        <span className="btn-icon">{cuota.paymentmethod && cuota.paymentdate ? <FaEdit /> : <FaMoneyBillWave />}</span>
                          </Button>
                          <Button className="action-btn delete" onClick={() => handleDelete(cuota._id)}>
                          <span className="btn-text">Eliminar</span>
                          <span className="btn-icon"><FaTrash /></span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6">No hay cuotas registradas.</td></tr>
                  )}
                </tbody>
              </Table>
              <div className="cuota-form">
                <div className="form-row">
                  {isEditing ? (
                    <select value={selectedMonth} disabled>
                      <option value={selectedMonth}>{months[parseInt(selectedMonth)]}</option>
                    </select>
                  ) : (
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                      <option value="">Mes</option>
                      {availableMonths.map((month, index) => (
                        <option key={index} value={months.indexOf(month)}>{month}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="number"
                    min="0"
                    placeholder="Monto"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <input
                    type="date"
                    max={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Método de Pago</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div className="form-actions">
                  <Button className="save-btn" onClick={handleSave}>Guardar</Button>
                  {isEditing && <Button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</Button>}
                </div>
              </div>
              {loadingCuotas && <p className="loading">Cargando cuotas...</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Share;