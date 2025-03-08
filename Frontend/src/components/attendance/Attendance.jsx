import { useState, useContext, useEffect } from 'react';
import { StudentsContext } from "../../context/student/StudentContext";
import { AttendanceContext } from "../../context/attendance/AttendanceContext";
import { LoginContext } from '../../context/login/LoginContext';
import {
  FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt,
  FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft
} from 'react-icons/fa';
import DatePicker from "react-datepicker";
import { format, isValid } from "date-fns";
import { useNavigate } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css";
import './attendance.css';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isAttendanceSaved, setIsAttendanceSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { estudiantes } = useContext(StudentsContext);
  const { auth } = useContext(LoginContext);
  const { agregarAsistencia, actualizarAsistencia, ObtenerAsistencia, asistencias } = useContext(AttendanceContext);
  const categories = ["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"];

  const fullMenuItems = [
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

  const userMenuItems = fullMenuItems.filter(item =>
    ['Inicio', 'Notificaciones', 'Asistencia'].includes(item.name)
  );

  const menuItems = auth === 'admin' ? fullMenuItems : userMenuItems;
  // Cargar estudiantes y asistencias al montar el componente
  useEffect(() => {
    ObtenerAsistencia();
  }, []);
  // Filtrar estudiantes por categoría
  useEffect(() => {
    if (selectedCategory) {
      // Validar que estudiantes sea un arreglo
      const studentsArray = Array.isArray(estudiantes) ? estudiantes : [];
      const filtered = studentsArray.filter(student => student.category === selectedCategory);
      setFilteredStudents(filtered);
    }
  }, [selectedCategory, estudiantes]);

  // Obtener la asistencia cuando se selecciona una fecha y categoría
  useEffect(() => {
    if (selectedCategory && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const asistenciaExistente = asistencias.find(
        (asistencia) => {
          const asistenciaDate = new Date(asistencia.date);
          return isValid(asistenciaDate) && format(asistenciaDate, 'yyyy-MM-dd') === formattedDate && asistencia.category === selectedCategory;
        }
      );
      if (asistenciaExistente) {
        const newAttendance = {};
        asistenciaExistente.attendance.forEach(student => {
          newAttendance[student.idStudent] = student.present ? 'present' : 'absent';
        });
        setAttendance(newAttendance);
        setIsAttendanceSaved(true);
      } else {
        setAttendance({});
        setIsAttendanceSaved(false);
      }
    }
  }, [selectedCategory, selectedDate, asistencias]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prevState => ({
      ...prevState,
      [studentId]: status
    }));
  };

  const handleAttendanceSubmit = async () => {

    const attendanceData = {
      date: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // Agregamos 6 horas y convertimos a ISO
      category: selectedCategory,
      attendance: filteredStudents.map(student => ({
        idStudent: student._id,
        present: attendance[student._id] === 'present',
        name: student.name,
        lastName: student.lastName
      }))
    };
    if (isAttendanceSaved) {
      await actualizarAsistencia(attendanceData); // Actualiza asistencia
    } else {
      await agregarAsistencia(attendanceData); // Guarda nueva asistencia
    }
    ObtenerAsistencia();
    setIsAttendanceSaved(true);
    setIsEditing(false);
  };

  const handleEditAttendance = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="attendance-layout">
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
      <div className="attendance-content">
        <h2 className="attendance-title">Registro de Asistencia</h2>
        <div className="attendance-categories">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {selectedCategory && (
          <>
            <div className="attendance-date-picker">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd" // Asegúrate de que el DatePicker use el formato correcto
                className="attendance-date-input"
              />
              <button className="attendance-today-btn" onClick={() => setSelectedDate(new Date())}>Hoy</button>
            </div>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Nombre y Apellido</th>
                  <th>Presente</th>
                  <th>Ausente</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td>{student.name} {student.lastName}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={attendance[student._id] === 'present'}
                        onChange={() => handleAttendanceChange(student._id, 'present')}
                        disabled={isAttendanceSaved && !isEditing}
                        className={isAttendanceSaved && !isEditing ? 'disabled-checkbox' : ''}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={attendance[student._id] === 'absent'}
                        onChange={() => handleAttendanceChange(student._id, 'absent')}
                        disabled={isAttendanceSaved && !isEditing}
                        className={isAttendanceSaved && !isEditing ? 'disabled-checkbox' : ''}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isAttendanceSaved && (
              <button className="attendance-save-btn" onClick={handleAttendanceSubmit}>Guardar Asistencia</button>
            )}
            {isAttendanceSaved && !isEditing && (
              <button className="attendance-edit-btn" onClick={handleEditAttendance}>Editar Asistencia</button>
            )}
            {isEditing && (
              <>
                <button className="attendance-update-btn" onClick={handleAttendanceSubmit}>Actualizar Asistencia</button>
                <button className="attendance-cancel-btn" onClick={handleCancelEdit}>Cancelar Edición</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;