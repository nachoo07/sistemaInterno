import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VerticalMenu from "../verticalMenu/VerticalMenu";
import { StudentsContext } from "../../context/student/StudentContext";
import StudentFormModal from '../modal/StudentFormModal'; // Importamos el nuevo componente
import Swal from 'sweetalert2';
import "./detailStudent.css";

const StudentDetail = () => {
  const { estudiantes, updateEstudiante, deleteEstudiante } = useContext(StudentsContext);
  const { id } = useParams(); // Obtener ID del estudiante desde la URL
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',lastName: '',cuil: '',birthDate: '',address: '',mail: '',category: '',motherName: '',
    motherPhone: '',fatherName: '',fatherPhone: '',profileImage: '',comment: '',state: '', // Valor inicial
    fee: 'Pendiente', file: null, // Agregar el campo de archivo
  });

  useEffect(() => {
    const selectedStudent = estudiantes.find((est) => est._id === id);
    setStudent(selectedStudent);
    if (selectedStudent) {
      setFormData({
        ...selectedStudent,
        birthDate: new Date(selectedStudent.birthDate).toISOString().split('T')[0], // Asegurarse de que la fecha esté en formato YYYY-MM-DD
      });
    }
  }, [id, estudiantes]);

  if (!student) {
    return <div>Cargando...</div>;
  }
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateEstudiante(formData);
    Swal.fire("¡Éxito!", "El perfil ha sido actualizado.", "success");
    handleClose(); // Cierra el modal después de actualizar
  };

  const handleDelete = async () => {
    await deleteEstudiante(student._id);
    Swal.fire("¡Éxito!", "El perfil ha sido eliminado.", "success");
    navigate("/student"); // Redirige al panel de estudiantes después de eliminar
  };
  const formatDate = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1); // Sumar un día
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return adjustedDate.toLocaleDateString('es-ES', options); // Formatear la fecha en formato 'dd/mm/yyyy'
  };

  const handleViewShares = () => {
    navigate(`/share/${student._id}`);
  };

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

  return (
    <div className="student-detail-container">
      <VerticalMenu />
      <div className="perfil-container">
        <div className="perfil-header">
        <div className="perfil-avatar">
            <img
              src={student.profileImage || "/ruta/imagen/por/defecto.jpg"}
              alt="Perfil"
              onError={(e) => {
                e.target.src = '/ruta/imagen/por/defecto.jpg';
                e.target.onerror = null;
              }}
              style={{ 
                width: '150px', 
                height: '150px', 
                objectFit: 'cover',
                borderRadius: '50%' 
              }}
            />
          </div>
          <div className="perfil-info">
            <h2>{student.name} {student.lastName}</h2>
            <button className="btn-ver-cuotas" onClick={handleViewShares}>Ver Cuotas</button>
          </div>
        </div>
        <form className="perfil-form">
          <div className="perfil-row">
            <div>
              <label>CUIL</label>
              <input type="text" value={student.cuil} readOnly />
            </div>
            <div>
              <label>Fecha de Nacimiento</label>
              <input type="text" value={formatDate(student.birthDate)} readOnly />
            </div>
            <div>
              <label>Categoría</label>
              <input type="text" value={student.category} readOnly />
            </div>
          </div>
          <div className="perfil-row">
            <div>
              <label>Dirección</label>
              <input type="text" value={student.address} readOnly />
            </div>
            <div>
              <label>Email</label>
              <input type="text" value={student.mail} readOnly />
            </div>
          </div>
          <div className="perfil-row">
            <div>
              <label>Nombre Mamá</label>
              <input type="text" value={student.motherName} readOnly />
            </div>
            <div>
              <label>Celular Mamá</label>
              <input type="text" value={student.motherPhone} readOnly />
            </div>
          </div>
          <div className="perfil-row">
            <div>
              <label>Nombre Papá</label>
              <input type="text" value={student.fatherName} readOnly />
            </div>
            <div>
              <label>Celular Papá</label>
              <input type="text" value={student.fatherPhone} readOnly />
            </div>
          </div>
          <div className="perfil-row">
            <div>
              <label>Estado</label>
              <input type="text" value={student.state} readOnly />
            </div>
            <div>
              <label>Cuota</label>
              <input type="text" value={student.fee} readOnly />
            </div>
          </div>
         
          <div className="perfil-comentario">
            <label>Comentarios</label>
            <textarea value={student.comment} readOnly></textarea>
          </div>

          <div className="perfil-actions">
            <button
              type="button"
              className="btn-editar"
              onClick={handleShow}
            >
              Editar Perfil
            </button>
            <button
              type="button"
              className="btn-eliminar"
              onClick={handleDelete}
            >
              Eliminar Perfil
            </button>
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
  );
};

export default StudentDetail;