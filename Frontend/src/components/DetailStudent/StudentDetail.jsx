import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt,FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft} from 'react-icons/fa';
import { StudentsContext } from "../../context/student/StudentContext";
import StudentFormModal from '../modal/StudentFormModal';
import Swal from 'sweetalert2';
import "./detailStudent.css";

const StudentDetail = () => {
  const { estudiantes, updateEstudiante, deleteEstudiante } = useContext(StudentsContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [show, setShow] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '', lastName: '', cuil: '', birthDate: '', address: '', mail: '', category: '', motherName: '',
    motherPhone: '', fatherName: '', fatherPhone: '', profileImage: null, comment: '', state: '', fee: 'pendiente', hasSiblingDiscount: false
  });

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome /> },
    { name: 'Alumnos', route: '/student', icon: <FaUsers /> },
    { name: 'Notificaciones', route: '/notification', icon: <FaBell /> },
    { name: 'Cuotas', route: '/share', icon: <FaMoneyBill /> },
    { name: 'Reportes', route: '/report', icon: <FaChartBar /> },
    { name: 'Movimientos', route: '/motion', icon: <FaExchangeAlt /> },
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck /> },
    { name: 'Usuarios', route: '/user', icon: <FaUserCog /> },
    { name: 'Ajustes', route: '/settings', icon: <FaCog /> },
    { name: 'Envios de Mail', route: '/email-notifications', icon: <FaEnvelope /> },
    { name: 'Volver Atrás', route: null, action: () => navigate(-1), icon: <FaArrowLeft /> }
  ];

  useEffect(() => {
    const selectedStudent = estudiantes.find((est) => est._id === id);
    setStudent(selectedStudent);
    if (selectedStudent) {
      setFormData({
        ...selectedStudent,
        birthDate: new Date(selectedStudent.birthDate).toISOString().split('T')[0],
        profileImage: selectedStudent.profileImage,
        hasSiblingDiscount: selectedStudent.hasSiblingDiscount || false
      });
    }
  }, [id, estudiantes]);

  if (!student) {
    return <div>Cargando...</div>;
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateEstudiante(formData);
    Swal.fire("¡Éxito!", "El perfil ha sido actualizado.", "success");
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await deleteEstudiante(student._id);
      navigate("/student");
    } catch (error) {
      Swal.fire(
        'Error',
        'Hubo un problema al eliminar el perfil.',
        'error'
      );
    }
  };

  const formatDate = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return adjustedDate.toLocaleDateString('es-ES', options);
  };

  const handleViewShares = () => {
    navigate(`/share/${student._id}`);
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg';
  };

  return (
    <div className="dashboard-container-detail">
      <div className={`sidebar ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </div>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="sidebar-item"
            onClick={() => item.action ? item.action() : navigate(item.route)}
          >
            <span className="icon">{item.icon}</span>
            <span className="text">{item.name}</span>
          </div>
        ))}
      </div>
      <div className='content-detail'>
        <div className="perfil-container">
          <div className="perfil-header">
            <div className="perfil-avatar">
              <img
                src={student.profileImage}
                alt="Perfil"
                onError={handleImageError}
              />
            </div>
            <div className="perfil-info">
              <h2>{student.name} {student.lastName}</h2>
              <button className="btn-ver-cuotas" onClick={handleViewShares}>Ver Cuotas</button>
            </div>
          </div>
          <form className="perfil-form">
            <div className="perfil-row">
              <div><label>CUIL</label><input type="text" value={student.cuil} readOnly /></div>
              <div><label>Fecha de Nacimiento</label><input type="text" value={formatDate(student.birthDate)} readOnly /></div>
              <div><label>Categoría</label><input type="text" value={student.category} readOnly /></div>
            </div>
            <div className="perfil-row">
              <div><label>Dirección</label><input type="text" value={student.address} readOnly /></div>
              <div><label>Email</label><input type="text" value={student.mail} readOnly /></div>
            </div>
            <div className="perfil-row">
              <div><label>Nombre Mamá</label><input type="text" value={student.motherName} readOnly /></div>
              <div><label>Celular Mamá</label><input type="text" value={student.motherPhone} readOnly /></div>
            </div>
            <div className="perfil-row">
              <div><label>Nombre Papá</label><input type="text" value={student.fatherName} readOnly /></div>
              <div><label>Celular Papá</label><input type="text" value={student.fatherPhone} readOnly /></div>
            </div>
            <div className="perfil-row">
              <div><label>Estado</label><input type="text" value={student.state} readOnly /></div>
              <div><label>Descuento por Hermanos</label><input type="text" value={student.hasSiblingDiscount ? 'Sí' : 'No'} readOnly /></div>
            </div>
            <div className="perfil-comentario">
              <label>Comentarios</label>
              <textarea value={student.comment} readOnly></textarea>
            </div>
            <div className="perfil-actions">
              <button type="button" className="btn-editar" onClick={handleShow}>Editar Perfil</button>
              <button type="button" className="btn-eliminar" onClick={handleDelete}>Eliminar Perfil</button>
            </div>
          </form>
        </div>
        <StudentFormModal
          show={show}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          formData={formData}
        />
      </div>
    </div>
  );
};

export default StudentDetail;