import { createContext, useState, useEffect, useContext } from 'react'
import { LoginContext } from '../login/LoginContext'
import Swal from "sweetalert2";
import axios from 'axios'

export const AttendanceContext = createContext()
export const AttendanceProvider = ({ children }) => {

  const [asistencias, setAttendance] = useState([])
  const { auth } = useContext(LoginContext);

  useEffect(() => {
    ObtenerAsistencia();
  }, []);

  const ObtenerAsistencia = async () => {
    if (auth === "admin" || auth === "user") {
      try {
        const response = await axios.get('http://localhost:4000/api/attendance/', { withCredentials: true });
        setAttendance(response.data);
      } catch (error) {
        console.error('Error al cargar las asistencias', error);
      }
    };
  }
  // Agregar asistencia nueva
  const agregarAsistencia = async (asistencia) => {
    if (auth === "admin" || auth === "user") {
      try {
        const response = await axios.post('http://localhost:4000/api/attendance/create', asistencia, {
          withCredentials: true,
        });
        setAttendance((prev) => [...prev, response.data]);
        Swal.fire("¡Éxito!", "La cuota ha sido creada correctamente", "success");
        ObtenerAsistencia();
      } catch (error) {
        console.error('Error al agregar asistencia', error);
        Swal.fire("¡Error!", "Ha ocurrido un error al crear la cuota", "error");
      }
    };
  }
  // Actualizar asistencia existente
  const actualizarAsistencia = async ({ date, category, attendance }) => {
    if (auth === "admin" || auth === "user") {
      try {
        const response = await axios.put('http://localhost:4000/api/attendance/update', {
          date, category, attendance
        }, { withCredentials: true },
        );
        ObtenerAsistencia();
        console.log("Response data:", response.data);
        setAttendance((prev) =>
          prev.map((a) =>
            a.date === date && a.category === category
              ? {
                ...a, attendance: a.attendance.map(student =>
                  attendance.find(updatedStudent => updatedStudent.idStudent === student.idStudent) || student
                )
              }
              : a
          )
        );
        Swal.fire("¡Éxito!", "La cuota ha sido actualizada correctamente", "success");
      } catch (error) {
        console.error('Error al actualizar la asistencia', error);
        Swal.fire("¡Error!", "Ha ocurrido un error al actualizar la cuota", "error");
      }
    }
  };
  // Ejecutar obtenerAsistencia si el usuario está logueado
  useEffect(() => {
    if (auth === "admin" || auth === "user") {
      ObtenerAsistencia();
    }
  }, [auth]); // Solo ejecuta la función si el usuario está logueado

  return (
    <AttendanceContext.Provider value={{ asistencias, actualizarAsistencia, agregarAsistencia, ObtenerAsistencia }}>
      {children}
    </AttendanceContext.Provider>
  )
}

