import { useState, useContext, useEffect } from 'react';
import VerticalMenu from '../verticalMenu/VerticalMenu';
import { Table, Button, FormControl, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { StudentsContext } from '../../context/student/StudentContext';
import StudentFormModal from '../modal/StudentFormModal';
import './Student.css';

const Student = () => {
  const navigate = useNavigate();
  
  const { estudiantes, obtenerEstudiantes, addEstudiante, deleteEstudiante, updateEstudiante } = useContext(StudentsContext);

  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    state: [],
    fee: [],
  });
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    cuil: '',
    birthDate: '',
    address: '',
    mail: '',
    category: '',
    motherName: '',
    motherPhone: '',
    fatherName: '',
    fatherPhone: '',
    profileImage: '',
    comment: '',
    state: 'Activo', // Valor inicial
    fee: 'pendiente', // Valor inicial
  });

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Asegúrate de que estudiantes sea un array vacío por defecto
  const estudiantesArray = Array.isArray(estudiantes) ? estudiantes : [];

  const totalPages = Math.ceil(estudiantesArray.length / studentsPerPage) || 1;

  // Calcular los estudiantes a mostrar en la página actual
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = estudiantesArray.slice(indexOfFirstStudent, indexOfLastStudent);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleClose = () => setShow(false);

  const handleShow = () => {
    resetForm();
    setShow(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Actualiza el campo correspondiente
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cuil) {
      alert("El CUIL es obligatorio");
      return;
    }
    try {
      if (formData._id) {
        await updateEstudiante(formData._id, {
          ...formData,
          state: formData.state === 'Activo', // Convierte el texto en booleano
        });
      } else {
        await addEstudiante({
          ...formData,
          state: formData.state === 'Activo' ? 'Activo' : 'Inactivo',
        });
      }
      resetForm();
      handleClose();
    } catch (error) {
      console.error("Error al crear o actualizar el estudiante:", error);
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      lastName: '',
      cuil: '',
      birthDate: '',
      address: '',
      mail: '',
      category: '',
      motherName: '',
      motherPhone: '',
      fatherName: '',
      fatherPhone: '',
      profileImage: '',
      comment: '',
      state: 'Activo', // Asegura que el estado sea "Activo" al agregar
      fee: 'pendiente', // Asegura que la cuota sea "Pagado" al agregar
    });
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type, value) => {
    setFilterOptions((prevOptions) => {
      const newOptions = { ...prevOptions };
      if (newOptions[type].includes(value)) {
        newOptions[type] = newOptions[type].filter((option) => option !== value);
      } else {
        newOptions[type].push(value);
      }
      return newOptions;
    });
  };

  const filteredStudents = estudiantesArray.filter((estudiante) => {
    const matchesSearchTerm = (estudiante.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (estudiante.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (estudiante.cuil?.includes(searchTerm) || '');

    const matchesState = filterOptions.state.length === 0 || filterOptions.state.includes(estudiante.state);
    const matchesFee = filterOptions.fee.length === 0 || filterOptions.fee.includes(estudiante.fee);

    return matchesSearchTerm && matchesState && matchesFee;
  });

  useEffect(() => {
    obtenerEstudiantes(); // Solo ejecuta la función de obtener estudiantes si es admin
  }, []); // Dependiendo de auth, recargamos los estudiantes si es necesario

  return (
    <div className="student-container">
      <VerticalMenu />
      <div className="table-container">
        <h1 className='titulo-panel-alumnos'>Panel de Alumnos</h1>
        <div className="table-controls">
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Buscar alumno"
              aria-label="Buscar alumno"
              aria-describedby="basic-addon2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button className='lupa' id="button-addon2">
              <FaSearch />
            </Button>
          </InputGroup>
          <DropdownButton id="dropdown-basic-button" title="Filtrar" className="button-filter">
            <Dropdown.Header>Estado</Dropdown.Header>
            <Dropdown.Item onClick={() => handleFilterChange('state', 'Activo')}>
              <input type="checkbox" checked={filterOptions.state.includes('Activo')} readOnly /> Activo
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('state', 'Inactivo')}>
              <input type="checkbox" checked={filterOptions.state.includes('Inactivo')} readOnly /> Inactivo
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Cuota</Dropdown.Header>
            <Dropdown.Item onClick={() => handleFilterChange('fee', 'Pagado')}>
              <input type="checkbox" checked={filterOptions.fee.includes('Pagado')} readOnly /> Pagado
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('fee', 'pendiente')}>
              <input type="checkbox" checked={filterOptions.fee.includes('pendiente')} readOnly /> Pendiente
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('fee', 'Vencido')}>
              <input type="checkbox" checked={filterOptions.fee.includes('Vencido')} readOnly /> Vencido
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setFilterOptions({ state: [], fee: [] })}>
              <input type="checkbox" checked={filterOptions.state.length === 0 && filterOptions.fee.length === 0} readOnly /> Todo
            </Dropdown.Item>
          </DropdownButton>
          <Button className="control-button" onClick={handleShow}>Agregar Alumno</Button>
        </div>
        
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cuota</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent).map((estudiante, index) => (
              <tr key={estudiante._id}>
                <td>{indexOfFirstStudent + index + 1}</td>
                <td>{estudiante.name}</td>
                <td>{estudiante.lastName}</td>
                <td>{estudiante.fee}</td>
                <td>
                  <span className={estudiante.state === 'Activo' ? 'status active' : 'status-inactive inactive'}>
                    {estudiante.state === 'Activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <Button className='boton-ver-mas' onClick={() => navigate(`/detailstudent/${estudiante._id}`)}>Ver más</Button>
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
            {[...Array(totalPages).keys()].map(number => (
              <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                <a className="page-link" href="#" onClick={() => paginate(number + 1)}>
                  {number + 1}
                </a>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <a className="page-link" href="#" aria-label="Next" onClick={() => currentPage < totalPages && paginate(currentPage + 1)}>
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <StudentFormModal
        show={show}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        formData={formData}
      />
    </div>
  );
}

export default Student;