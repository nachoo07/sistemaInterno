import { createContext, useState, useEffect, useContext } from 'react';
import { LoginContext } from '../login/LoginContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [asistencias, setAttendance] = useState([]);
  const { auth } = useContext(LoginContext);

  // Carga asistencias solo cuando auth cambia y es válido
  useEffect(() => {
    if (auth === 'admin' || auth === 'user') {
      ObtenerAsistencia();
    }
  }, [auth]);

  const ObtenerAsistencia = async () => {
    try {
      const response = await axios.get('/api/attendance/', {
        withCredentials: true,
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error al cargar las asistencias', error);
    }
  };

  const agregarAsistencia = async (asistencia) => {
    if (auth === 'admin' || auth === 'user') {
      try {
        const response = await axios.post('/api/attendance/create', asistencia, {
          withCredentials: true,
        });
        // Actualiza el estado directamente en lugar de volver a llamar a ObtenerAsistencia
        setAttendance((prev) => [...prev, response.data]);
        Swal.fire('¡Éxito!', 'La cuota ha sido creada correctamente', 'success');
      } catch (error) {
        console.error('Error al agregar asistencia', error);
        Swal.fire('¡Error!', 'Ha ocurrido un error al crear la cuota', 'error');
      }
    }
  };

  const actualizarAsistencia = async ({ date, category, attendance }) => {
    if (auth === 'admin' || auth === 'user') {
      try {
        const response = await axios.put('/api/attendance/update', {
          date,
          category,
          attendance,
        }, { withCredentials: true });
        // Actualiza el estado directamente
        setAttendance((prev) =>
          prev.map((a) =>
            a.date === date && a.category === category
              ? { ...a, attendance: response.data.attendance }
              : a
          )
        );
        Swal.fire('¡Éxito!', 'La cuota ha sido actualizada correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar la asistencia', error);
        Swal.fire('¡Error!', 'Ha ocurrido un error al actualizar la cuota', 'error');
      }
    }
  };

  return (
    <AttendanceContext.Provider value={{ asistencias, actualizarAsistencia, agregarAsistencia, ObtenerAsistencia }}>
      {children}
    </AttendanceContext.Provider>
  );
};