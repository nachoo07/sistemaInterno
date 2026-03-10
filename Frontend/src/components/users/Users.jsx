// Users.js
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaTimes, FaTimes as FaTimesClear } from "react-icons/fa";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { UsersContext } from '../../context/user/UserContext';
import Swal from 'sweetalert2';
import './user.css';
import AppNavbar from '../navbar/AppNavbar';
import { LoginContext } from '../../context/login/LoginContext';
import logo from "../../assets/logoyoclaudio.png";
import DesktopNavbar from '../navbar/DesktopNavbar';
import Sidebar from '../sidebar/Sidebar';

const Users = () => {
  const { usuarios, obtenerUsuarios, addUsuarioAdmin, updateUsuarioAdmin, deleteUsuarioAdmin, isLoading = false } = useContext(UsersContext);
  const { userData, logout, auth } = useContext(LoginContext);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [show, setShow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 576);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('todos');
  const [formData, setFormData] = useState({
    name: '',
    mail: '',
    password: '',
    role: 'user',
    state: 'Activo'
  });
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const usersPerPage = 10;
  const FILTER_OPTIONS = ["todos", "activo", "inactivo"];

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
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleShow = () => {
    setFormErrors({}); // Limpiar errores al abrir el formulario
    setShow(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error del campo al cambiar su valor
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mail.trim()) {
      Swal.fire('Error', 'El nombre y el correo son obligatorios.', 'error');
      return;
    }
    if (!formData._id && !formData.password.trim()) {
      Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios.', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.mail)) {
      Swal.fire('Error', 'El correo no es válido.', 'error');
      return;
    }
    try {
      if (formData._id) {
        await updateUsuarioAdmin(formData._id, {
          name: formData.name,
          mail: formData.mail,
          role: formData.role,
          state: formData.state === 'Activo'
        });
      } else {
        await addUsuarioAdmin({
          name: formData.name,
          mail: formData.mail,
          password: formData.password,
          role: formData.role,
          state: formData.state === 'Activo'
        });
      }
      await obtenerUsuarios(); // Refrescar la lista
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 400 && error.response?.data?.errors) {
        // Mapear errores a los campos correspondientes
        const errors = error.response.data.errors.reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {});
        setFormErrors(errors);
      } else {
        Swal.fire('Error', error.response?.data?.message || 'Error al procesar la solicitud', 'error');
      }
    }
  };

  const usersCountByState = useMemo(() => {
    return usuarios.reduce((acc, usuario) => {
      acc.todos += 1;
      if (usuario.state) {
        acc.activo += 1;
      } else {
        acc.inactivo += 1;
      }
      return acc;
    }, { todos: 0, activo: 0, inactivo: 0 });
  }, [usuarios]);

  const activeAdminsCount = useMemo(
    () => usuarios.filter((u) => u.role === "admin" && !!u.state).length,
    [usuarios]
  );

  const totalUsersCount = useMemo(() => usuarios.length, [usuarios]);

  const resetForm = () => {
    setFormData({
      name: '',
      mail: '',
      password: '',
      role: 'user',
      state: 'Activo'
    });
    setFormErrors({});
  };

  const handleShowAddUser = () => {
    resetForm();
    handleShow();
  };

  const handleEdit = (id) => {
    const usuario = usuarios.find((usuario) => usuario._id === id);
    if (usuario.fixed) {
      Swal.fire('Restricción', 'Este usuario no puede ser editado.', 'warning');
      return;
    }
    setFormData({
      _id: usuario._id,
      name: usuario.name,
      mail: usuario.mail,
      password: '',
      role: usuario.role,
      state: usuario.state ? 'Activo' : 'Inactivo'
    });
    handleShow();
  };

  const handleDelete = async (id) => {
    const usuario = usuarios.find((u) => String(u._id) === String(id));
    if (!usuario) return;

    if (totalUsersCount <= 1) {
      Swal.fire('Restricción', 'Debe quedar al menos un usuario cargado.', 'warning');
      return;
    }

    try {
      await deleteUsuarioAdmin(id);
      await obtenerUsuarios(); // Refrescar la lista
    } catch (error) {
      console.error('Error en handleDelete:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (nextFilter) => {
    setFilterState(nextFilter);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterState('todos');
    setCurrentPage(1);
  };

  const filteredUsers = usuarios.filter((usuario) => {
    const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedName = usuario.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const matchesSearch = normalizedName.includes(normalizedSearch) || usuario.mail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'todos' || (filterState === 'activo' ? !!usuario.state : !usuario.state);

    return matchesSearch && matchesState;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getDeleteDisabledReason = (usuario) => {
    if (usuario.fixed) return 'Este usuario no puede ser eliminado';
    if (userData?.id && String(userData.id) === String(usuario._id)) {
      return 'No puedes eliminar el usuario con sesión activa';
    }
    if (totalUsersCount <= 1) {
      return 'Debe quedar al menos un usuario cargado';
    }
    if (usuario.role === 'admin' && !!usuario.state && activeAdminsCount <= 1) {
      return 'Debe quedar al menos un administrador activo';
    }
    return '';
  };

  return (
    <div className={`app-container ${windowWidth <= 576 ? 'mobile-view' : ''}`}>
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
          activeRoute="/user"
        />
        <main className="main-content">
        
            <div className="user-header">
              <div className="search-box">
                <FaSearch className="search-symbol" />
                <input
                  type="text"
                  className="search-field"
                  placeholder="Buscar por nombre o mail"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="mobile-search-clear"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    disabled={isLoading}
                    aria-label="Limpiar búsqueda"
                  >
                    <FaTimesClear />
                  </button>
                )}
              </div>
              <button className="add-btn-student" onClick={handleShowAddUser}>
                <FaPlus /> Agregar Usuario
              </button>
            </div>
        

          <section className="students-filter">
            <div className="filter-actions-user">
              <div className="checkbox-filters-student" role="tablist" aria-label="Filtro de estado de usuarios">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`filter-pill ${filterState === option ? "active" : ""}`}
                    onClick={() => handleFilterChange(option)}
                    aria-pressed={filterState === option}
                    disabled={isLoading}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    <span className="filter-count">{usersCountByState[option] || 0}</span>
                  </button>
                ))}
                
              </div>
            </div>
          </section>
          <section className="users-table-section">
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Mail</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((usuario, index) => (
                      <tr key={usuario._id || index}>
                        <td>{indexOfFirstUser + index + 1}</td>
                        <td>{usuario.name}</td>
                        <td>{usuario.mail}</td>
                        <td>{getRoleName(usuario.role)}</td>
                        <td>{usuario.state ? 'Activo' : 'Inactivo'}</td>
                        <td className="action-buttons">
                          {(() => {
                            const deleteDisabledReason = getDeleteDisabledReason(usuario);
                            const isDeleteDisabled = !!deleteDisabledReason;

                            return (
                              <>
                          <button
                            className="action-btn-student action-edit"
                            onClick={() => handleEdit(usuario._id)}
                            disabled={usuario.fixed}
                            title="Editar"
                          >
                            <FiEdit3 />
                          </button>
                          <button
                            className="action-btn-student action-delete"
                            onClick={() => handleDelete(usuario._id)}
                            disabled={isDeleteDisabled}
                            title={isDeleteDisabled ? deleteDisabledReason : 'Eliminar'}
                          >
                            <FiTrash2 />
                          </button>
                              </>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No hay usuarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
                className="pagination-btn"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
                className="pagination-btn"
              >
                »
              </button>
            </div>
          </section>
          {show && (
            <div className="custom-modal">
              <div className="modal-content-user">
                <div className="modal-header-user">
                  <h2>{formData._id ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
                  <button className="modal-close" onClick={handleClose}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body-user">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label>Mail</label>
                      <input
                        type="email"
                        name="mail"
                        value={formData.mail}
                        onChange={handleChange}
                        required
                        pattern="\S+@\S+\.\S+"
                        className={`form-control ${formErrors.mail ? 'is-invalid' : ''}`}
                      />
                      {formErrors.mail && <div className="invalid-feedback">{formErrors.mail}</div>}
                    </div>
                    <div className="form-group">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!formData._id}
                        minLength={formData._id ? 0 : 6}
                        maxLength={50}
                        disabled={!!formData._id}
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      />
                      {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!formData._id}
                        className="form-control"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Rol</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="form-control"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn-modal-cancelar" onClick={handleClose}>Cancelar</button>
                      <button type="submit" className="btn-modal-guardar">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Users;
