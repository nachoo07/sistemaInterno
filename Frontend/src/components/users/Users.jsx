import React, { useState, useEffect } from 'react';
import VerticalMenu from '../verticalMenu/VerticalMenu';
import { Table, Button, FormControl, InputGroup, Modal, Form } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaTrashAlt } from 'react-icons/fa';
import './user.css';
import { useContext } from 'react';
import { UsersContext } from '../../context/user/UserContext'; // Asegúrate de ajustar la ruta

const Users = () => {
  const { usuarios, obtenerUsuarios, addUsuarioAdmin, updateUsuarioAdmin, deleteUsuarioAdmin } = useContext(UsersContext);

  const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mail: '',
    password: '',
    role: 'user',
    state: 'Activo', // Valor inicial
  });

  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (formData._id) {
      updateUsuarioAdmin(formData._id, {
        ...formData,
        state: formData.state === 'Activo', // Convierte el texto en booleano
      });
    } else {
      addUsuarioAdmin({
        ...formData,
        state: formData.state === 'Activo', // Convierte el texto en booleano
      });
    }
  
    handleClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mail: '',
      password: '',
      role: 'user',
      state: 'Activo', // Asegura que el estado sea "Activo" al agregar
    });
  };
  
  const handleShowAddUser = () => {
    resetForm(); // Limpia el formulario antes de mostrar el modal
    handleShow();
  };
  
  const handleEdit = (id) => {
    const usuario = usuarios.find((usuario) => usuario._id === id);
    if (usuario.fixed) {
      alert("Este usuario no puede ser editado.");
      return;
    }  
    setFormData({
      _id: usuario._id, // Asegúrate de incluir el ID aquí
      name: usuario.name,
      mail: usuario.mail,
      //password: '',
      role: usuario.role,
      state: usuario.state ? 'Activo' : 'Inactivo',
    });
    handleShow();
  };

  const handleDelete = (id) => {
    const usuario = usuarios.find((usuario) => usuario._id === id);

    if (usuario.fixed) {
      alert("Este usuario no puede ser eliminado.");
      return;
    }
    deleteUsuarioAdmin(id); // Llama a la función para eliminar el usuario
  };

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredUsers = usuarios.filter((usuario) =>
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    obtenerUsuarios(); // Obtiene los usuarios al cargar el componente
  }, [obtenerUsuarios]);

  return (
    <>
      <div className="users-container">
        <VerticalMenu />
        <div className="table-container">
          <h1 className='titulo-panel-usurios'>Panel de Usuarios</h1>
          <div className="table-controls">
            <InputGroup className="mb-3">
            <FormControl
  placeholder="Buscar usuario"
  aria-label="Buscar usuario"
  aria-describedby="basic-addon2"
  value={searchTerm}
  onChange={handleSearchChange}
/>
              <Button variant="outline-secondary" id="button-addon2">
                <FaSearch />
              </Button>
            </InputGroup>
<Button variant="success" className="control-button" onClick={handleShowAddUser}>
  Agregar Usuario
</Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre y Apellido</th>
                <th>Mail</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {filteredUsers.map((usuario, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{usuario.name}</td>
      <td>{usuario.mail}</td>
      <td>{usuario.role}</td>
      <td>{usuario.state ? 'Activo' : 'Inactivo'}</td>
      <td>
        <FaEdit
          className={`action-icon-edit ${usuario.fixed ? 'disabled-icon' : ''}`}
          onClick={() => !usuario.fixed && handleEdit(usuario._id)}
        />
        <FaTrashAlt
          className={`action-icon ${usuario.fixed ? 'disabled-icon' : ''}`}
          onClick={() => !usuario.fixed && handleDelete(usuario._id)}
        />
      </td>
    </tr>
  ))}
</tbody>
          </Table>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>{formData._id ? "Editar Usuario" : "Agregar Usuario"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={50}
              />
            </Form.Group>

            <Form.Group controlId="formMail">
              <Form.Label>Mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa el mail"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                required
                pattern="\S+@\S+\.\S+" // Validación de formato de email
                title="Formato de email inválido."
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
  <Form.Label>Contraseña</Form.Label>
  <Form.Control
    type="password"
    placeholder="Ingresa la contraseña"
    name="password"
    value={formData.password}
    onChange={handleChange}
    required={!formData._id} // Si está en modo edición (_id existe), no es requerido
    minLength={formData._id ? 0 : 6} // Si está en modo edición, no se aplica minLength
    maxLength={50}
    disabled={!!formData._id} // Si está en modo edición (_id existe), deshabilita el campo
  />
</Form.Group>
<Form.Group controlId="formState">
  <Form.Label>Estado</Form.Label>
  <Form.Control
    as="select"
    name="state"
    value={formData.state}
    onChange={handleChange}
    disabled={!formData._id} // Deshabilitado si es para agregar usuario
  >
    <option value="Activo">Activo</option>
    <option value="Inactivo">Inactivo</option>
  </Form.Control>
</Form.Group>
            <Form.Group controlId="formRole">
              <Form.Label>Rol</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Users;