import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch } from 'react-icons/fa'; // Importa el icono de lupa
import { SharesContext } from "../../context/share/ShareContext"; // Contexto de cuotas
import { StudentsContext } from "../../context/student/StudentContext"; // Contexto de estudiantes
import VerticalMenu from "../verticalMenu/VerticalMenu";
import { Button, Table } from 'react-bootstrap';
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
  const [errorMessage, setErrorMessage] = useState("");  // Mensaje de error
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 15;

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const availableYears = [2025, 2026, 2027, 2028];

  useEffect(() => {
    obtenerEstudiantes();
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
      .filter((cuota) =>
        cuota.student?._id === selectedStudent?._id &&
        new Date(cuota.date).getFullYear() === selectedYear // Filtrar por año seleccionado
      )
      .sort((a, b) => new Date(a.date).getMonth() - new Date(b.date).getMonth());
    setFilteredData(filtered);
  };

  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!date || !amount || selectedMonth === "") {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }
  
    // Crear la fecha con el mes y año seleccionados
    const cuotaDate = new Date(selectedYear, selectedMonth, 1); // Día 1 del mes seleccionado
  
    const cuotaData = {
      student: selectedStudent._id,
      amount: parseFloat(amount),
      date: cuotaDate, // Asignamos correctamente la fecha con el mes seleccionado
      paymentmethod: paymentMethod,
      paymentdate: date,
    };
  
    if (selectedCuota) {
      updateCuota({ ...cuotaData, _id: selectedCuota._id });
    } else {
      addCuota(cuotaData);
    }
  
    // Resetear inputs y estado de edición
    setAmount("");
    setDate("");
    setPaymentMethod("");
    setSelectedMonth("");
    setSelectedCuota(null);
    setIsEditing(false);
  };

  const handleEditClick = (cuota) => {
    setSelectedCuota(cuota);
    setAmount(cuota.amount);
    setDate(formatDate(cuota.paymentdate));
    setPaymentMethod(cuota.paymentmethod);
    setSelectedMonth(months[new Date(cuota.date).getMonth()]); // Convertir el número a nombre del mes
    setIsEditing(true); // Activar modo edición
  };

  const closeErrorMessage = () => {
    setErrorMessage("");  // Cerrar el alert
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
  };

  // Función para formatear la fecha a YYYY-MM-DD sin desfase
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return months[date.getMonth()];
  };

  // Calcular meses disponibles (excluir meses ya seleccionados)
  const usedMonths = filteredData.map((cuota) => new Date(cuota.date).getMonth() + 1);
  const availableMonths = months.filter((_, index) => !usedMonths.includes(index + 1));

  // Filtrar estudiantes según el término de búsqueda
  const filteredStudents = estudiantes.filter((student) => {
    const fullName = (student.name + " " + student.lastName).toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Calcular los estudiantes a mostrar en la página actual
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <VerticalMenu>
      <div className="share-container">
        {!selectedStudent ? (
          <div className="search-filter">
            <h1 className="panel-cuota-titulo">Panel de Cuotas</h1>
            <div className="search-input-wrapper">
              <input type="text" placeholder="Buscar estudiante..." value={searchTerm} onChange={handleSearchChange} />
              <FaSearch className="search-icon" />
            </div>
            <div className="search-results">
              {loadingEstudiantes ? (
                <p>Cargando estudiantes...</p>
              ) : (
                <>
                  <Table striped bordered hover>
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
                        <tr key={index}>
                          <td>{indexOfFirstStudent + index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.lastName}</td>
                          <td>{/* Aquí puedes agregar el estado de la cuota si lo tienes disponible */}</td>
                          <td>
                            <Button className="boton-ver-mas" onClick={() => handleStudentSelect(student)}>Ver más</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <nav aria-label="Page navigation example">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" aria-label="Previous" onClick={() => currentPage > 1 && paginate(currentPage - 1)}>
                          <span aria-hidden="true">&laquo;</span>
                        </a>
                      </li>
                      {[...Array(Math.ceil(filteredStudents.length / studentsPerPage)).keys()].map(number => (
                        <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                          <a className="page-link" href="#" onClick={() => paginate(number + 1)}>
                            {number + 1}
                          </a>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === Math.ceil(filteredStudents.length / studentsPerPage) ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" aria-label="Next" onClick={() => currentPage < Math.ceil(filteredStudents.length / studentsPerPage) && paginate(currentPage + 1)}>
                          <span aria-hidden="true">&raquo;</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <h1 className="detalle-cuota">Cuotas de {selectedStudent.name} {selectedStudent.lastName}</h1>
            <div className="year-filter">
              <label className="filtro" htmlFor="year">Filtrar por año: </label>
              <select className="select" id="year" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Monto</th>
                  <th>Método de Pago</th>
                  <th>Fecha de Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((cuota, index) => (
                    <tr key={index}>
                      <td>{formatMonth(cuota.date)}</td>
                      <td>
                        {new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          minimumFractionDigits: 0,
                        }).format(cuota.amount)}
                      </td>
                      <td>{cuota.paymentmethod || ""}</td>
                      <td>{cuota.paymentdate ? formatDate(cuota.paymentdate) : ""}</td>
                      <td>{cuota.state}</td>
                      <td>
                        <Button className="boton-pagar" onClick={() => handleEditClick(cuota)}>Pagar</Button>
                        <Button className="boton-pagar" onClick={() => handleDelete(cuota._id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6">No hay pagos registrados.</td></tr>
                )}
              </tbody>
            </table>
            <div className="input-group">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="">Seleccionar mes</option>
                {availableMonths.map((month, index) => (
                  <option key={index} value={months.indexOf(month)}>{month}</option>
                ))}
              </select>
              <input type="number" min="0" placeholder="Ingresar dinero" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Seleccionar método de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <button className="boton-guardar" onClick={handleSave}>Guardar</button>
              {isEditing && (
                <button onClick={handleCancelEdit}>Cancelar Edición</button>
              )}
            </div>
            {errorMessage && (
              <div className="alert-custom">
                <span>{errorMessage}</span>
                <button onClick={closeErrorMessage} className="alert-close-btn">X</button>
              </div>
            )}
          </>
        )}
      </div>

      {loadingCuotas && <p>Cargando cuotas...</p>}
    </VerticalMenu>
  );
};

export default Share;