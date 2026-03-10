import React, { useState, useEffect, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import { UsersContext } from '../../context/user/UserContext';
import './usersFormModal.css';

const UserFormModal = ({ show, handleClose, userToEdit }) => {
  const { addUsuarioAdmin, updateUsuarioAdmin } = useContext(UsersContext);
  
  const initialFormState = {
    name: '',
    mail: '',
    role: 'user',
    state: 'Activo'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        _id: userToEdit._id,
        name: userToEdit.name,
        mail: userToEdit.mail,
        role: userToEdit.role,
        state: userToEdit.state ? 'Activo' : 'Inactivo'
      });
    } else {
      setFormData(initialFormState);
    }
    setFormErrors({});
  }, [userToEdit, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const userData = {
        name: formData.name,
        mail: formData.mail,
        role: formData.role,
        state: formData.state === 'Activo'
      };

      if (userToEdit && !userToEdit._id) {
        setFormErrors({ general: 'ID de usuario no válido' });
        setIsSubmitting(false);
        return;
      }

      if (userToEdit) {
        await updateUsuarioAdmin(userToEdit._id, userData);
      } else {
        await addUsuarioAdmin(userData);
      }
      
      // SOLO cerramos si la promesa se resuelve sin errores
      handleClose();
      setFormData(initialFormState);

    } catch (error) {
      // Si el contexto lanzó el error, caemos aquí y el modal NO se cierra.
      
      // Si son errores de validación (array), los mapeamos a los inputs
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errors = error.response.data.errors.reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {});
        setFormErrors(errors);
      }
      // Si es otro error (ej: duplicado), la alerta ya salió desde el Contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="custom-modal">
      <div className="modal-content-user">
        <div className="modal-header-user">
          <h2>{userToEdit ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body-user">
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
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

            {/* Mail */}
            <div className="form-group">
              <label>Mail</label>
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                required
                className={`form-control ${formErrors.mail ? 'is-invalid' : ''}`}
              />
              {formErrors.mail && <div className="invalid-feedback">{formErrors.mail}</div>}
            </div>

            {formErrors.general && <div className="alert-general-error">{formErrors.general}</div>}

            {/* Estado (Solo edición) */}
            <div className="form-group">
              <label>Estado</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!userToEdit}
                className="form-control"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* Rol */}
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
              <button type="button" className="btn-modal-cancelar" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-modal-guardar" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;