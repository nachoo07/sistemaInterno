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
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="studentFormModal-container" /* Solo tu clase personalizada */
      size="lg" /* Usamos size="lg" para que Bootstrap aplique el tamaño grande */
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="studentFormModal-header">
        <Modal.Title className="studentFormModal-title">
          {formData._id ? "Editar Alumno" : "Agregar Alumno"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="studentFormModal-body">
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
        <Form onSubmit={onSubmit} className="studentFormModal-form-grid" encType="multipart/form-data">
          <Form.Group controlId="formNombre" className="studentFormModal-form-group">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={50}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formLastName" className="studentFormModal-form-group">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Pérez"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              maxLength={50}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formDNI" className="studentFormModal-form-group">
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
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formBirthDate" className="studentFormModal-form-group">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={today}
              required
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formDireccion" className="studentFormModal-form-group">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              placeholder="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              maxLength={100}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formMail" className="studentFormModal-form-group">
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
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formCategoria" className="studentFormModal-form-group">
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
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formNombreMama" className="studentFormModal-form-group">
            <Form.Label>Nombre Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Mamá"
              name="motherName"
              value={formData.motherName || ''}
              onChange={handleChange}
              maxLength={50}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formCelularMama" className="studentFormModal-form-group">
            <Form.Label>Celular Mamá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Mamá"
              name="motherPhone"
              value={formData.motherPhone || ''}
              onChange={handleNumberInput}
              pattern="\d{10,15}"
              title="El número debe tener entre 10 y 15 dígitos."
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formState" className="studentFormModal-form-group">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-control-custom"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formNombrePapa" className="studentFormModal-form-group">
            <Form.Label>Nombre Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre Papá"
              name="fatherName"
              value={formData.fatherName || ''}
              onChange={handleChange}
              maxLength={50}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formCelularPapa" className="studentFormModal-form-group">
            <Form.Label>Celular Papá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Celular Papá"
              name="fatherPhone"
              value={formData.fatherPhone || ''}
              onChange={handleNumberInput}
              pattern="\d{10,15}"
              title="El número debe tener entre 10 y 15 dígitos."
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group controlId="formHasSiblingDiscount" className="studentFormModal-checkbox-group">
            <Form.Check
              type="checkbox"
              name="hasSiblingDiscount"
              checked={formData.hasSiblingDiscount || false}
              onChange={handleCheckboxChange}
              label="Aplicar 10% de descuento por hermanos"
              className="studentFormModal-form-check-custom"
            />
          </Form.Group>
          <Form.Group controlId="formProfileImage" className="studentFormModal-full-width-img">
            <div className="studentFormModal-image-upload-container">
              <Form.Label>Imagen de Perfil</Form.Label>
              <Form.Control
                type="file"
                name="profileImage"
                onChange={handleFileChange}
                disabled={uploading}
                className="form-control-custom"
              />
              {uploading && <p className="uploading">Subiendo imagen...</p>}
            </div>
            {formData.profileImage && (
              <div className="studentFormModal-image-preview-container">
                <img
                  src={formData.profileImage instanceof File ? URL.createObjectURL(formData.profileImage) : formData.profileImage}
                  alt="Vista previa"
                  className="studentFormModal-preview-img"
                  onError={(e) => e.target.src = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg'}
                />
              </div>
            )}
          </Form.Group>
          <Form.Group controlId="formComentario" className="studentFormModal-full-width">
            <Form.Label>Comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Comentario"
              name="comment"
              value={formData.comment || ''}
              onChange={handleChange}
              maxLength={500}
              className="form-control-custom"
            />
          </Form.Group>
          <div className="studentFormModal-buttons-container">
            <Button type="button" className="studentFormModal-cancel-btn" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="studentFormModal-save-btn" disabled={uploading}>
              {uploading ? "Guardando..." : (formData._id ? "Actualizar" : "Guardar")}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default StudentFormModal;