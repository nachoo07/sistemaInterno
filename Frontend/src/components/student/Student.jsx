import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaPlus, FaTimes as FaTimesClear } from "react-icons/fa";
import { FiUser, FiCreditCard, FiEdit3, FiTrash2 } from "react-icons/fi";
import { StudentsContext } from "../../context/student/StudentContext";
import { LoginContext } from "../../context/login/LoginContext";
import StudentFormModal from "../modal/StudentFormModal";
import { showErrorAlert, showSuccessToast } from "../../utils/alerts/Alerts";
import "./student.css";
import AppNavbar from '../navbar/AppNavbar';
import logo from "../../assets/logoyoclaudio.png";
import DesktopNavbar from '../navbar/DesktopNavbar';
import Sidebar from '../sidebar/Sidebar';
import Pagination from '../pagination/Pagination';

const Student = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { estudiantes, obtenerEstudiantes, addEstudiante, updateEstudiante, deleteEstudiante, loading } = useContext(StudentsContext);
  const { auth, authReady } = useContext(LoginContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [filterState, setFilterState] = useState("todos");
  const [formData, setFormData] = useState({
    name: "", lastName: "", cuil: "", birthDate: "", address: "", mail: "", category: "", guardianName: "", guardianPhone: "", profileImage: null, state: "Activo", hasSiblingDiscount: false, league: 'Sin especificar',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 576);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const studentsPerPage = 10;
  const FILTER_OPTIONS = ["todos", "activo", "inactivo"];

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    if (!auth || (auth !== 'admin' && auth !== 'user')) {
      navigate('/login');
      return;
    }
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page')) || 1;
    const search = queryParams.get('search') || "";
    const state = queryParams.get('state') || "todos";

    setCurrentPage(page);
    setSearchTerm(search);
    setFilterState(state);

    const fetchData = async () => {
      try {
        await obtenerEstudiantes();
      } catch (error) {
        console.error('Student: Error fetching students:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          showErrorAlert('¡Error!', 'No se encontraron estudiantes.');
        } else {
          showErrorAlert('¡Error!', error.response?.data?.message || 'No se pudieron cargar los estudiantes.');
        }
      }
    };
    fetchData();

    setIsInitialMount(false);
  }, [auth, authReady, navigate, location.search, obtenerEstudiantes]);

  useEffect(() => {
    if (isInitialMount) return;

    const queryParams = new URLSearchParams();
    if (currentPage !== 1) queryParams.set('page', currentPage);
    if (searchTerm) queryParams.set('search', searchTerm);
    if (filterState !== 'todos') queryParams.set('state', filterState);

    const queryString = queryParams.toString();
    const newUrl = queryString ? `/student?${queryString}` : '/student';

    if (location.pathname + location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [currentPage, searchTerm, filterState, navigate, location.pathname, location.search, isInitialMount]);

  const handleViewPayments = (estudianteId) => {
    const queryParams = new URLSearchParams();
    if (currentPage !== 1) queryParams.set('page', currentPage);
    if (searchTerm) queryParams.set('search', searchTerm);
    if (filterState !== 'todos') queryParams.set('state', filterState);

    const queryString = queryParams.toString();
    navigate(`/paymentstudent/${estudianteId}${queryString ? `?${queryString}` : ''}`);
  };

  const normalizeText = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const studentsCountByState = useMemo(() => {
    return estudiantes.reduce(
      (acc, estudiante) => {
        const normalizedState = normalizeText(estudiante.state);
        if (normalizedState === "activo") acc.activo += 1;
        if (normalizedState === "inactivo") acc.inactivo += 1;
        acc.todos += 1;
        return acc;
      },
      { todos: 0, activo: 0, inactivo: 0 }
    );
  }, [estudiantes]);

  const filteredStudents = useMemo(() => {
    const searchNormalized = normalizeText(searchTerm);

    return estudiantes.filter((estudiante) => {
      const nameNormalized = normalizeText(estudiante.name);
      const lastNameNormalized = normalizeText(estudiante.lastName);
      const fullName = `${nameNormalized} ${lastNameNormalized}`;

      const cuilSearch = estudiante.cuil
        ? estudiante.cuil.toString().toLowerCase().includes(searchNormalized)
        : false;

      const matchesSearch = fullName.includes(searchNormalized) || cuilSearch;
      const studentState = normalizeText(estudiante.state);
      const matchesState = filterState === "todos" || studentState === filterState;

      return matchesSearch && matchesState;
    });
  }, [estudiantes, searchTerm, filterState]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShow = (student = null) => {
    setFormErrors({});
    if (student) {
      setEditStudent(student);
      const dateInputValue = student.birthDate || '';
      setFormData({
        ...student,
        birthDate: dateInputValue,
        dateInputValue,
        profileImage: student.profileImage,
        hasSiblingDiscount: student.hasSiblingDiscount || false,
        league: student.league || 'Sin especificar',
      });
    } else {
      setEditStudent(null);
      setFormData({
        name: '',
        lastName: '',
        cuil: '',
        birthDate: '',
        dateInputValue: '',
        address: '',
        mail: '',
        category: '',
        guardianName: '',
        guardianPhone: '',
        profileImage: null,
        state: 'Activo',
        hasSiblingDiscount: undefined,
        league: 'Sin especificar',
      });
    }
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'dateInputValue') {
      setFormData({
        ...formData,
        birthDate: value,
        dateInputValue: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.profileImage instanceof File) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/gif'];
        if (!validImageTypes.includes(formData.profileImage.type)) {
          showErrorAlert('¡Error!', 'La imagen de perfil debe ser un archivo JPEG, PNG, HEIC, WEBP o GIF.');
          return;
        }
        if (formData.profileImage.size > 5 * 1024 * 1024) {
          showErrorAlert('¡Error!', 'La imagen de perfil no debe exceder los 5MB.');
          return;
        }
      }

      const formattedData = {
        ...formData,
        birthDate: formData.dateInputValue,
        league: formData.league || 'Sin especificar',
      };

      let result;
      if (editStudent) {
        result = await updateEstudiante(formattedData);
        if (result.success) {
          showSuccessToast('El perfil del estudiante ha sido actualizado correctamente.');
        } else {
          throw new Error(result.message);
        }
      } else {
        result = await addEstudiante(formattedData);
        if (result.success) {
          showSuccessToast('El estudiante ha sido agregado correctamente.');
        } else {
          throw new Error(result.message);
        }
      }
      setShow(false);
    } catch (error) {
      console.error('handleSubmit: Error submitting student:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 400) {
        if (Array.isArray(error.response?.data?.errors)) {
          const mappedErrors = error.response.data.errors.reduce((acc, err) => {
            if (err?.path) acc[err.path] = err.msg;
            return acc;
          }, {});
          setFormErrors(mappedErrors);
        } else {
          showErrorAlert('¡Error!', error.response?.data?.message || 'Los datos del estudiante son inválidos.');
        }
      } else if (error.response?.status === 404) {
        showErrorAlert('¡Error!', 'Estudiante no encontrado.');
      } else {
        showErrorAlert('¡Error!', error.response?.data?.message || (editStudent ? 'No se pudo actualizar el estudiante.' : 'No se pudo agregar el estudiante.'));
      }
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const result = await deleteEstudiante(studentId);
      if (result?.deleted) {
        showSuccessToast('El estudiante ha sido eliminado correctamente.');
      }
    } catch (error) {
      console.error('handleDelete: Error deleting student:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showErrorAlert('¡Error!', error.response?.data?.message || 'No se pudo eliminar el estudiante.');
      }
    }
  };

  const handleFilterChange = (nextFilter) => {
    if (!FILTER_OPTIONS.includes(nextFilter)) {
      return;
    }
    if (nextFilter !== filterState) {
      setFilterState(nextFilter);
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterState("todos");
    setCurrentPage(1);
  };

  const handleViewDetail = (studentId) => {
    const queryParams = new URLSearchParams();
    if (currentPage !== 1) queryParams.set('page', currentPage);
    if (searchTerm) queryParams.set('search', searchTerm);
    if (filterState !== 'todos') queryParams.set('state', filterState);

    const queryString = queryParams.toString();
    navigate(`/detailstudent/${studentId}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className={`app-container ${windowWidth <= 576 ? "mobile-view" : ""}`}>
      {windowWidth <= 576 && (
        <AppNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
      )}
      {windowWidth > 576 && (
        <DesktopNavbar
          logoSrc={logo}
          showSearch={true}
        />
      )}
      <div className="dashboard-layout">
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeRoute="/student"
        />
        <main className="main-content">
          <div className="students-header">
            <div className={`students-search-container ${windowWidth <= 576 ? "mobile-search-container" : "desktop-search-container"}`}>
              <FaSearch className="mobile-search-icon" />
              <input
                type="text"
                placeholder={windowWidth <= 576 ? "Buscar alumnos..." : "Buscar por nombre, apellido o DNI..."}
                className="mobile-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
              />
              {searchTerm && (
                <button
                  className="mobile-search-clear"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <FaTimesClear />
                </button>

              )}
            </div>
              <button className="add-btn-student" onClick={() => handleShow()} disabled={loading}>
                <FaPlus /> Agregar Alumno
              </button>
          </div>
          <section className="students-filter">
            <div className="filter-actions-student">
              <div className="checkbox-filters-student" role="tablist" aria-label="Filtro de estado de estudiantes">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`filter-pill ${filterState === option ? "active" : ""}`}
                    onClick={() => handleFilterChange(option)}
                    aria-pressed={filterState === option}
                    disabled={loading}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    <span className="filter-count">{studentsCountByState[option] || 0}</span>
                  </button>
                ))}
              
              </div>

            </div>
          </section>
          <section className="students-table-section">
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Dni</th>
                    <th className='club'>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map((estudiante, index) => (
                      <tr
                        key={estudiante._id}
                        className={`state-${estudiante.state.toLowerCase()}`}
                      >
                        <td>{indexOfFirstStudent + index + 1}</td>
                        <td>{estudiante.name}</td>
                        <td>{estudiante.lastName}</td>
                        <td>{estudiante.cuil}</td>
                        <td className='club'>{estudiante.state}</td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button
                              className="action-btn-student"
                              onClick={() => handleViewDetail(estudiante._id)}
                              title="Ver Detalle"
                              disabled={loading}
                            >
                              <FiUser />
                            </button>
                            <button
                              className="action-btn-student "
                              onClick={() => handleViewPayments(estudiante._id)}
                              title="Ver Pagos"
                              disabled={loading}
                            >
                              <FiCreditCard />
                            </button>
                            <button
                              className="action-btn-student "
                              onClick={() => handleShow(estudiante)}
                              title="Editar"
                              disabled={loading}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              className="action-btn-student"
                              onClick={() => handleDelete(estudiante._id)}
                              title="Eliminar"
                              disabled={loading}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-table-row">
                      <td colSpan="6" className="empty-table-message">
                        {searchTerm
                          ? `No se encontraron alumnos que coincidan con "${searchTerm}"`
                          : filterState !== "todos"
                            ? `No hay alumnos con estado "${filterState}"`
                            : "No hay alumnos registrados en el sistema"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
              disabled={loading}
            />
          </section>
            <StudentFormModal
              show={show}
              handleClose={handleClose}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              formData={formData}
              formErrors={formErrors}
            />

        </main>
      </div>
    </div>
  );
};

export default Student;
