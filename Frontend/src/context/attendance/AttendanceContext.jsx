import { createContext, useState, useEffect, useContext } from 'react';
import { LoginContext } from '../login/LoginContext';
import { getErrorMsg } from "../../utils/helperError/ErrorMsg";
import { showSuccessToast, showErrorAlert } from "../../utils/alerts/Alerts";
import client from '../../api/axios'; // Asegúrate que la ruta sea correcta a tu configuración de axios

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const { auth, authReady } = useContext(LoginContext);
  const [asistencias, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar spinners/botones

  // Carga asistencias automáticamente cuando la autenticación está lista
  useEffect(() => {
    const fetchData = async () => {
      // Si authReady es false, no hacemos nada aún.
      if (!authReady) return;

      if (auth === 'admin' || auth === 'user') {
        await ObtenerAsistencia();
      }
    };
    fetchData();
  }, [auth, authReady]); // Se ejecuta cuando authReady cambia a true

  const ObtenerAsistencia = async () => {
    setIsLoading(true);
    try {
      const response = await client.get('/attendance/');
      const data = Array.isArray(response.data) ? response.data : [];
      setAttendance(data);
    } catch (error) {
      console.error('Error al cargar las asistencias', error);
      // Opcional: No mostrar alerta aquí para no ser intrusivo al cargar la página, 
      // o usar un toast discreto si falla.
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarAsistencia = async (asistencia) => {
    if (auth !== 'admin' && auth !== 'user') return;
    
    setIsLoading(true);
    try {
      const response = await client.post('/attendance/', asistencia);
      const savedAttendance = response?.data?.attendance;

      if (!savedAttendance || !savedAttendance.date) {
        throw new Error('Respuesta inválida del servidor al guardar asistencia.');
      }
      
      // Actualizamos estado local evitando duplicados visuales (comparando fechas)
      setAttendance((prev) => {
         const newDate = new Date(savedAttendance.date).toDateString();
         // Filtramos si ya existía localmente algo con esa fecha/categoría para reemplazarlo
         const filtered = prev.filter(a => !(new Date(a.date).toDateString() === newDate && a.category === savedAttendance.category));
         return [...filtered, savedAttendance];
      });

      showSuccessToast('La asistencia ha sido creada correctamente');
      return true; // Retornamos true para que el componente sepa que tuvo éxito

    } catch (error) {
      const msg = getErrorMsg(error, 'Error al crear la asistencia');
      showErrorAlert('Error', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarAsistencia = async ({ date, category, attendance }) => {
    if (auth !== 'admin' && auth !== 'user') return;

    setIsLoading(true);
    try {
      const response = await client.put('/attendance/', {
        date,
        category,
        attendance,
      });

      // Actualización en memoria
      setAttendance((prev) =>
        prev.map((a) => {
            const d1 = new Date(a.date).toDateString();
            const d2 = new Date(date).toDateString();
            return (d1 === d2 && a.category === category)
              ? response.data.attendance // Reemplazamos con la respuesta del server
              : a
        })
      );
      
      showSuccessToast('La asistencia ha sido actualizada correctamente');
      return true;

    } catch (error) {
      const msg = getErrorMsg(error, 'Error al actualizar la asistencia');
      showErrorAlert('Error', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AttendanceContext.Provider value={{ 
        asistencias, 
        actualizarAsistencia, 
        agregarAsistencia, 
        ObtenerAsistencia, 
        isLoading // Exponemos isLoading
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};