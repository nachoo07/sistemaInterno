import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import './studentModal.css';

const StudentFormModal = ({ show, handleClose, handleSubmit, handleChange, formData }) => {
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value: name === 'name' || name === 'lastName' ? capitalize(value) : value } });
  };

  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    handleChange({ target: { name: e.target.name, value } });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleChange({ target: { name: 'profileImage', value: file } });
  };

  const handleCheckboxChange = (e) => {
    handleChange({ target: { name: 'hasSiblingDiscount', value: e.target.checked } });
  };

  const validateParentFields = () => {
    const fields = ['motherName', 'motherPhone', 'fatherName', 'fatherPhone'].map(field => formData[field]?.trim() || '');
    const filledCount = fields.filter(Boolean).length;

    if (filledCount > 0 && filledCount < 2) {
      setAlertMessage('Debe completar al menos 2 de los 4 campos de información de los padres.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }

    const motherComplete = fields[0] && fields[1];
    const fatherComplete = fields[2] && fields[3];
    if (filledCount >= 2 && !motherComplete && !fatherComplete) {
      setAlertMessage('Complete ambos campos (nombre y teléfono) de la madre o del padre.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }

    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validateParentFields()) {
      handleSubmit(e);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="student-modal">
      <Modal.Header closeButton>
        <Modal.Title>{formData._id ? "Editar Alumno" : "Agregar Alumno"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
        <Form onSubmit={onSubmit} className="form-grid" encType="multipart/form-data">

          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
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
              maxLength={50}
            />
          </Form.Group>

          <Form.Group controlId="formDNI">
            <Form.Label>CUIL</Form.Label>
            <Form.Control
              type="text"
              placeholder="CUIL"
              name="cuil"
              value={formData.cuil}
              onChange={handleNumberInput}
              required
              pattern="\d{10,11}"
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
              max={today}
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
              maxLength={100}
            />
          </Form.Group>
          <Form.Group controlId="formMail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
              pattern="\S+@\S+\.\S+"
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
              pattern="^[0-9]+$"
              maxLength={50}
            />
          </Form.Group>


          <Form.Group controlId="formNombreMama">
            <Form.Label>Nombre Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Mamá"
              name="motherName"
              value={formData.motherName || ''}
              onChange={handleChange}
              maxLength={50}
            />
          </Form.Group>
          <Form.Group controlId="formCelularMama">
            <Form.Label>Celular Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Mamá"
              name="motherPhone"
              value={formData.motherPhone || ''}
              onChange={handleNumberInput}
              pattern="\d{10,15}"
              title="El número debe tener entre 10 y 15 dígitos."
            />
          </Form.Group>
          <Form.Group controlId="formState">
            <Form.Label>Estado</Form.Label>
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
          <Form.Group controlId="formNombrePapa">
            <Form.Label>Nombre Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Papá"
              name="fatherName"
              value={formData.fatherName || ''}
              onChange={handleChange}
              maxLength={50}
            />
          </Form.Group>
          <Form.Group controlId="formCelularPapa">
            <Form.Label>Celular Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Papá"
              name="fatherPhone"
              value={formData.fatherPhone || ''}
              onChange={handleNumberInput}
              pattern="\d{10,15}"
              title="El número debe tener entre 10 y 15 dígitos."
            />
          </Form.Group>

          <Form.Group controlId="formHasSiblingDiscount" className="full-width" >
            <Form.Check
              type="checkbox"
              name="hasSiblingDiscount"
              className='checkbox'
              checked={formData.hasSiblingDiscount || false}
              onChange={handleCheckboxChange}
              label="Aplicar 10% de descuento por hermanos"
            />
          </Form.Group>
          <Form.Group controlId="formProfileImage" className="full-width form-group-with-preview">
            <div>
              <Form.Label>Imagen de Perfil</Form.Label>
              <Form.Control
                type="file"
                name="profileImage"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading && <p className="uploading">Subiendo imagen...</p>}
            </div>
            {formData.profileImage && (
              <img
                src={formData.profileImage instanceof File ? URL.createObjectURL(formData.profileImage) : formData.profileImage}
                alt="Vista previa"
                className="preview-img "
                onError={(e) => e.target.src = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg'}
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
              value={formData.comment || ''}
              onChange={handleChange}
              maxLength={500}
            />
          </Form.Group>

          <Button type="submit" className="save-btn full-width" disabled={uploading}>
            {uploading ? "Guardando..." : (formData._id ? "Actualizar" : "Guardar")}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default StudentFormModal;