
import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaDownload, FaList, FaFilePdf, FaBars, FaTimes, FaClipboardList, FaUserCircle, FaChevronDown, FaHome, FaUsers, FaMoneyBill, FaExchangeAlt, FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaColumns } from 'react-icons/fa';
import { StudentsContext } from '../../context/student/StudentContext';
import { PaymentContext } from '../../context/payment/PaymentContext';
import { LoginContext } from '../../context/login/LoginContext';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import AppNavbar from '../navbar/AppNavbar';
import './listStudent.css';
import logo from "../../assets/logoyoclaudio.png";

const ListStudent = () => {
  const navigate = useNavigate();
  const { estudiantes, loading: studentsLoading } = useContext(StudentsContext);
  const { payments, concepts, fetchConcepts, fetchAllPayments, fetchPaymentsByDateRange, loadingPayments } = useContext(PaymentContext);
  const { auth, logout, userData } = useContext(LoginContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');
  const [conceptFilter, setConceptFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(['nombre', 'fechaNacimiento', 'categoria']);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const itemsPerPage = 20;
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 576);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const profileRef = useRef(null);

  const availableColumns = [
    { key: 'nombre', label: 'Nombre Completo', visibleByDefault: true },
    { key: 'fechaNacimiento', label: 'Fecha de Nacimiento', visibleByDefault: true },
    { key: 'categoria', label: 'Categoría', visibleByDefault: true },
  ];

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome />, category: 'principal' },
    { name: 'Alumnos', route: '/student', icon: <FaUsers />, category: 'principal' },
    { name: 'Cuotas', route: '/share', icon: <FaMoneyBill />, category: 'finanzas' },
    { name: 'Movimientos', route: '/motion', icon: <FaExchangeAlt />, category: 'finanzas' },
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck />, category: 'principal' },
    { name: 'Usuarios', route: '/user', icon: <FaUserCog />, category: 'configuracion' },
    { name: 'Ajustes', route: '/settings', icon: <FaCog />, category: 'configuracion' },
    { name: 'Envios de Mail', route: '/email-notifications', icon: <FaEnvelope />, category: 'comunicacion' },
    { name: 'Listado de Alumnos', route: '/liststudent', icon: <FaClipboardList />, category: 'informes' },
    { name: 'Lista de Movimientos', route: '/listeconomic', icon: <FaList />, category: 'finanzas' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth <= 576) setIsMenuOpen(false);
      else setIsMenuOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (auth === 'admin') {
      fetchConcepts();
      fetchAllPayments();
    }
  }, [auth, fetchConcepts, fetchAllPayments]);

  useEffect(() => {
    if (conceptFilter) {
      if (!selectedColumns.includes('montoConcepto')) {
        setSelectedColumns(prev => [...prev, 'montoConcepto']);
      }
    } else {
      setSelectedColumns(prev => prev.filter(k => k !== 'montoConcepto'));
      setStartDate('');
      setEndDate('');
    }
  }, [conceptFilter]);

  useEffect(() => {
    setHasAppliedFilters(!!conceptFilter && !!startDate && !!endDate);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, leagueFilter, conceptFilter, startDate, endDate]);

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate < startDate) {
      Swal.fire('¡Error!', 'La fecha de fin no puede ser anterior a la fecha de inicio.', 'error');
      return;
    }
    setEndDate(newEndDate);
    setCurrentPage(1);
  };

  const paymentsMap = useMemo(() => {
    const map = new Map();
    payments.forEach(p => {
      if (!map.has(p.studentId)) map.set(p.studentId, new Map());
      const conceptMap = map.get(p.studentId);
      const conceptLower = p.concept.toLowerCase();
      if (!conceptMap.has(conceptLower)) conceptMap.set(conceptLower, []);
      conceptMap.get(conceptLower).push(p);
    });

    const processedMap = new Map();
    map.forEach((conceptMap, studentId) => {
      processedMap.set(studentId, new Map());
      conceptMap.forEach((paymentList, concept) => {
        if (conceptFilter && startDate && endDate) {
          const filteredPayments = paymentList.filter(p => {
            const paymentDate = new Date(p.paymentDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return paymentDate >= start && paymentDate <= end;
          });
          const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
          processedMap.get(studentId).set(concept, totalAmount || null);
        }
      });
    });

    return processedMap;
  }, [payments, conceptFilter, startDate, endDate]);

  const hasAnyPaymentForConcept = (studentId, conceptLower) => {
    const studentPayments = payments.filter(p => p.studentId === studentId && p.concept.toLowerCase() === conceptLower);
    return studentPayments.length > 0;
  };

  const processedStudents = useMemo(() => {
    if (!estudiantes || estudiantes.length === 0) return [];

    let filtered = [...estudiantes];

    if (searchTerm) {
      const searchNormalized = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      filtered = filtered.filter((student) => {
        const nameNormalized = `${student.name} ${student.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cuilSearch = student.cuil?.toLowerCase().includes(searchNormalized);
        return nameNormalized.includes(searchNormalized) || cuilSearch;
      });
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((student) => new Date(student.birthDate).getFullYear() === parseInt(categoryFilter));
    }

    if (leagueFilter) {
      filtered = filtered.filter((student) => {
        const leagueNorm = String(student.league || '').toLowerCase();
        if (leagueFilter === 'No especificado') return !leagueNorm || leagueNorm === '';
        if (leagueFilter === 'Sí') return leagueNorm === 'si' || leagueNorm === 'true';
        if (leagueFilter === 'No') return leagueNorm === 'no' || leagueNorm === 'false';
        return false;
      });
    }

    if (conceptFilter && startDate && endDate) {
      const conceptLower = conceptFilter.toLowerCase();
      filtered = filtered.filter(s => {
        const studentPayments = paymentsMap.get(s._id);
        const hasPaymentInRange = studentPayments && studentPayments.has(conceptLower) && studentPayments.get(conceptLower) > 0;
        const hasNoPayments = !hasAnyPaymentForConcept(s._id, conceptLower);
        // Incluir alumnos con pagos en el rango o sin pagos registrados
        // Excluir alumnos con pagos fuera del rango
        if (conceptLower === 'liga') {
          const isLeaguePlayer = String(s.league || '').toLowerCase() === 'si' || s.league === true;
          return (hasPaymentInRange || (hasNoPayments && isLeaguePlayer));
        }
        return hasPaymentInRange || hasNoPayments;
      });
    } else {
      return [];
    }

    return filtered.map(student => {
      let montoConcepto = 'Pendiente';
      if (conceptFilter) {
        const studentPayments = paymentsMap.get(student._id);
        const totalAmount = studentPayments ? studentPayments.get(conceptFilter.toLowerCase()) : null;
        if (totalAmount > 0) {
          montoConcepto = totalAmount;
        }
      }
      return { ...student, montoConcepto };
    });
  }, [estudiantes, searchTerm, categoryFilter, leagueFilter, conceptFilter, startDate, endDate, paymentsMap]);

  const totalPages = Math.ceil(processedStudents.length / itemsPerPage);
  const paginatedStudents = processedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleColumnToggle = (key) => {
    setSelectedColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDownloadExcel = () => {
    if (processedStudents.length === 0 || !hasAppliedFilters) return;

    const headers = availableColumns
      .filter(col => selectedColumns.includes(col.key))
      .map(col => col.label);
    if (conceptFilter) {
      headers.push(`Monto ${conceptFilter.charAt(0).toUpperCase() + conceptFilter.slice(1)}`);
    }

    const data = processedStudents.map(student => {
      const row = [];
      availableColumns.forEach(col => {
        if (selectedColumns.includes(col.key)) {
          switch (col.key) {
            case 'nombre': row.push(`${student.name} ${student.lastName}`); break;
            case 'fechaNacimiento': row.push(formatDate(student.birthDate)); break;
            case 'categoria': row.push(new Date(student.birthDate).getFullYear()); break;
            default: row.push('');
          }
        }
      });
      if (conceptFilter) {
        row.push(student.montoConcepto === 'Pendiente' ? 'Pendiente' : `$${Number(student.montoConcepto).toLocaleString('es-ES')}`);
      }
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');
    const dateRange = startDate && endDate ? `${startDate}_to_${endDate}` : 'all';
    XLSX.writeFile(wb, `Lista_Alumnos_${dateRange}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (processedStudents.length === 0 || !hasAppliedFilters) return;
    const doc = new jsPDF();
    doc.text('Lista de Alumnos', 14, 20);
    const headers = availableColumns
      .filter(col => selectedColumns.includes(col.key))
      .map(col => col.label);
    if (conceptFilter) {
      headers.push(`Monto ${conceptFilter.charAt(0).toUpperCase() + conceptFilter.slice(1)}`);
    }
    const data = processedStudents.map(student => {
      const row = [];
      availableColumns.forEach(col => {
        if (selectedColumns.includes(col.key)) {
          switch (col.key) {
            case 'nombre': row.push(`${student.name} ${student.lastName}`); break;
            case 'fechaNacimiento': row.push(formatDate(student.birthDate)); break;
            case 'categoria': row.push(new Date(student.birthDate).getFullYear().toString()); break;
            default: row.push('');
          }
        }
      });
      if (conceptFilter) {
        row.push(student.montoConcepto === 'Pendiente' ? 'Pendiente' : `$${Number(student.montoConcepto).toLocaleString('es-ES')}`);
      }
      return row;
    });
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
    });
    const dateRange = startDate && endDate ? `${startDate}_to_${endDate}` : 'all';
    doc.save(`Lista_Alumnos_${dateRange}.pdf`);
  };

  const handleLogout = async () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const uniqueBirthYears = [...new Set(estudiantes.map(s => new Date(s.birthDate).getFullYear()))].sort((a, b) => b - a);

  const getEmptyMessage = () => {
    if (!conceptFilter) return 'Por favor, selecciona un concepto para ver los resultados.';
    if (!startDate || !endDate) return 'Por favor, selecciona un rango de fechas.';
    if (leagueFilter === 'Sí') return 'No hay alumnos que jueguen liga con los filtros seleccionados.';
    if (leagueFilter === 'No') return 'No hay alumnos que no jueguen liga con los filtros seleccionados.';
    return 'No se encontraron alumnos con pagos o pendientes para el concepto y rango de fechas seleccionados.';
  };

  if (studentsLoading || loadingPayments) {
    return <div className="loading">Cargando datos...</div>;
  }

  if (auth !== 'admin') {
    return <div className="error-message">No tienes permisos para ver esta lista.</div>;
  }

  return (
    <div className={`app-container ${windowWidth <= 576 ? 'mobile-view' : ''}`}>
      {windowWidth <= 576 && <AppNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
      {windowWidth > 576 && (
        <header className="desktop-nav-header">
          <div className="header-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Valladares Fútbol" className="logo-image" />
          </div>
          <div className="search-box">
            <FaSearch className="search-symbol" />
            <input
              type="text"
              placeholder="Buscar alumnos..."
              className="search-field"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="nav-right-section">
            <div className="profile-container" ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <FaUserCircle className="profile-icon" />
              <span className="profile-greeting">Hola, {userData?.name || 'Usuario'}</span>
              <FaChevronDown className={`arrow-icon ${isProfileOpen ? 'rotated' : ''}`} />
              {isProfileOpen && (
                <div className="profile-menu">
                  <div className="menu-option" onClick={(e) => { e.stopPropagation(); navigate('/user'); setIsProfileOpen(false); }}>
                    <FaUserCog className="option-icon" /> Mi Perfil
                  </div>
                  <div className="menu-option" onClick={(e) => { e.stopPropagation(); navigate('/settings'); setIsProfileOpen(false); }}>
                    <FaCog className="option-icon" /> Configuración
                  </div>
                  <div className="menu-separator"></div>
                  <div className="menu-option logout-option" onClick={(e) => { e.stopPropagation(); handleLogout(); setIsProfileOpen(false); }}>
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
                    className={`sidebar-menu-item ${item.route === '/liststudent' ? 'active' : ''}`}
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
        <main className="main-content">
          <section className="dashboard-welcome">
            <div className="welcome-text">
              <h1>Lista de Alumnos Personalizada</h1>
              {hasAppliedFilters && <p>Total filtrados: {processedStudents.length}</p>}
            </div>
          </section>

          <section className="columns-selector">
            <button className="columns-toggle" onClick={() => setIsColumnsOpen(!isColumnsOpen)}>
              <FaColumns /> Seleccionar Columnas {isColumnsOpen ? '↑' : '↓'}
            </button>
            {isColumnsOpen && (
              <div className="columns-list">
                {availableColumns.map(col => (
                  <label key={col.key} className="columns-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => handleColumnToggle(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="students-filter">
            <div className="filter-actions list">
              <div className="filter-group">
                <label><FaSearch /> Buscar:</label>
                <input
                  type="text"
                  placeholder="Nombre, apellido o CUIL..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Categoría:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                >
                  <option value="">Seleccionar</option>
                  <option value="all">Todas las categorías</option>
                  {uniqueBirthYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Liga:</label>
                <select
                  value={leagueFilter}
                  onChange={(e) => { setLeagueFilter(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                >
                  <option value="">Seleccionar</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No especificado">No especificado</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Concepto:</label>
                <select
                  value={conceptFilter}
                  onChange={(e) => { setConceptFilter(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                  title="Selecciona un concepto para habilitar los filtros de fecha"
                >
                  <option value="">Seleccionar</option>
                  {concepts.map(c => (
                    <option key={c._id} value={c.name}>
                      {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {conceptFilter && (
                <>
                  <div className="filter-group">
                    <label>Fecha Inicio:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                      className="filter-input"
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label>Fecha Fin:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="filter-input"
                      required
                    />
                  </div>
                </>
              )}
              <div className="download-actions">
                <button className="download-btn" onClick={handleDownloadExcel} disabled={processedStudents.length === 0 || !hasAppliedFilters}>
                  <FaDownload /> Excel
                </button>
                <button className="download-btn pdf-btn" onClick={handleDownloadPDF} disabled={processedStudents.length === 0 || !hasAppliedFilters}>
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>
          </section>

          {hasAppliedFilters && (
            <section className="students-table-payment animate-fade-in">
              <div className="table-wrapper">
                <table className="students-payment">
                  <thead>
                    <tr>
                      <th>#</th>
                      {availableColumns
                        .filter(col => selectedColumns.includes(col.key))
                        .map(col => <th key={col.key}>{col.label}</th>)}
                      {conceptFilter && (
                        <th>Monto {conceptFilter.charAt(0).toUpperCase() + conceptFilter.slice(1)}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student, index) => (
                        <tr key={student._id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          {availableColumns
                            .filter(col => selectedColumns.includes(col.key))
                            .map(col => (
                              <td key={col.key}>
                                {(() => {
                                  switch (col.key) {
                                    case 'nombre': return `${student.name} ${student.lastName}`;
                                    case 'fechaNacimiento': return formatDate(student.birthDate);
                                    case 'categoria': return new Date(student.birthDate).getFullYear();
                                    default: return '';
                                  }
                                })()}
                              </td>
                            ))}
                          {conceptFilter && (
                            <td>
                              {student.montoConcepto === 'Pendiente' 
                                ? 'Pendiente' 
                                : `$${Number(student.montoConcepto).toLocaleString('es-ES')}`}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={selectedColumns.length + (conceptFilter ? 2 : 1)} className="empty-table-message">
                          {getEmptyMessage()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ListStudent;

