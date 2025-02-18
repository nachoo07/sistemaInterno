import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { useState } from 'react';
import '../modal/studentModal.css';

const StudentFormModal = ({ show, handleClose, handleSubmit, handleChange, formData }) => {
  // Formatear la fecha de nacimiento para el campo de fecha
  const formattedBirthDate = formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : '';
  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  // Función para capitalizar la primera letra

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange({
      target: {
        name,
        value: name === 'name' || name === 'lastName' ? capitalize(value) : value,
      },
    });
  };
  // Función para permitir solo números en el campo de entrada
  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    handleChange({ target: { name: e.target.name, value } });
  };

  const [uploading, setFormData] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    for (const key in formData) {
        formDataToSend.append(key, formData[key]);
    }

    try {
        const response = await fetch('http://localhost:5000/api/students', {
            method: 'POST',
            body: formDataToSend,
        });

        const data = await response.json();
        console.log('Respuesta:', data);
    } catch (error) {
        console.error('Error al subir datos:', error);
    }
};

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-dialog">
      <Modal.Header closeButton>
        <Modal.Title>{formData._id ? "Editar Alumno" : "Agregar Alumno"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="form-grid" encType="multipart/form-data">
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              minLength={1}
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formLastName">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Pérez"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              minLength={1}
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formDNI">
            <Form.Label>Cuil</Form.Label>
            <Form.Control
              type="text"
              placeholder="CUIL"
              name="cuil"
              value={formData.cuil}
              onChange={handleChange}
              required
              pattern="\d{10,11}" // Acepta 7 u 8 dígitos numéricos
              title="CUIL debe contener 10 u 11 dígitos."
            />
          </Form.Group>

          <Form.Group controlId="formBirthDate">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={today} // Establecer la fecha máxima como la fecha actual
              required
            />
          </Form.Group>

          <Form.Group controlId="formDireccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              placeholder="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              minLength={1}
              maxLength={100}
            />
          </Form.Group>

          <Form.Group controlId="formMail">
            <Form.Label>Mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Mail"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
              pattern="\S+@\S+\.\S+" // Validación de formato de email
              title="Formato de email inválido."
            />
          </Form.Group>

          <Form.Group controlId="formCategoria">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Categoría"
              name="category"
              value={formData.category}
              onChange={handleNumberInput}
              required
              pattern="^[0-9]+$" // Solo números positivos
              minLength={4}
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formNombreMama">
            <Form.Label>Nombre Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Mamá"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              minLength={1}
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formCelularMama">
            <Form.Label>Celular Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Mamá"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
              pattern="\d{10,15}" // Acepta números de 10 a 15 dígitos
              title="El número de celular debe tener entre 10 y 15 dígitos."
            />
          </Form.Group>

          <Form.Group controlId="formNombrePapa">
            <Form.Label>Nombre Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Papá"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              minLength={1}
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formCelularPapa">
            <Form.Label>Celular Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Papá"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
              pattern="\d{10,15}" // Acepta números de 10 a 15 dígitos
              title="El número de celular debe tener entre 10 y 15 dígitos."
            />
          </Form.Group>
          <Form.Group controlId="formState" className="form-group">
            <Form.Label className="form-label">Estado</Form.Label>
            <Form.Control
              as="select"
              name="state"
              value={formData.state}
              onChange={handleChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formProfileImage" className="full-width">
        <Form.Label>Imagen de Perfil</Form.Label>
        <Form.Control
          type="file"
          name="profileImage"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p>Subiendo imagen...</p>}
        {formData.profileImage && (
          <img
            src={formData.profileImage instanceof File ? URL.createObjectURL(formData.profileImage) : formData.profileImage}
            alt="Vista previa"
            style={{ width: '100px', height: '100px' }}
          />
        )}
      </Form.Group>

          <Form.Group controlId="formComentario" className="full-width">
            <Form.Label>Comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Comentario"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              maxLength={500}
            />
          </Form.Group>
          <Button type="submit" className="boton-guardar">
            {formData._id ? "Actualizar Alumno" : "Crear Alumno"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default StudentFormModal;