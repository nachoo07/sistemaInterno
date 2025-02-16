import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { LoginContext } from "../login/LoginContext";

export const SharesContext = createContext();

const SharesProvider = ({ children }) => {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(LoginContext); // Obtenemos el rol desde el contexto de login

  // Obtener todas las cuotas
  const obtenerCuotas = async () => {
    if (auth === "admin") {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/shares", {
          withCredentials: true,
        });
        console.log("Response data:", response.data);
        setCuotas(response.data);
      } catch (error) {
        console.error("Error obteniendo cuotas:", error);
        Swal.fire("¡Error!", "No se pudieron obtener las cuotas. Verifica la URL y el servidor.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Obtener cuotas por estudiante
  const obtenerCuotasPorEstudiante = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/shares/student/${studentId}`, {
        withCredentials: true,
      });
      console.log("Cuotas del estudiante:", response.data);
      setCuotas(response.data);
    } catch (error) {
      console.error("Error obteniendo cuotas por estudiante:", error);
      Swal.fire("¡Error!", "No se pudieron obtener las cuotas del estudiante.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Agregar una cuota
  const addCuota = async (cuota) => {
    if (auth === "admin") {
      try {
        const response = await axios.post("http://localhost:4000/api/shares/create", cuota, {
          withCredentials: true,
        });
        setCuotas((prevCuotas) => Array.isArray(prevCuotas) ? [...prevCuotas, response.data] : [response.data]);
        Swal.fire("¡Éxito!", "La cuota ha sido creada correctamente", "success");
        obtenerCuotas();
      } catch (error) {
        console.error("Error al crear la cuota:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al crear la cuota", "error");
      }
    }
  };

  // Eliminar una cuota
  const deleteCuota = async (id) => {
    if (auth === "admin") {
      try {
        const confirmacion = await Swal.fire({
          title: "¿Estás seguro que deseas eliminar la cuota?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
          await axios.delete(`http://localhost:4000/api/shares/delete/${id}`, {
            withCredentials: true,
          });
          setCuotas((prevCuotas) => prevCuotas.filter((cuota) => cuota._id !== id));
          Swal.fire("¡Eliminada!", "La cuota ha sido eliminada correctamente", "success");
        }
      } catch (error) {
        console.error("Error al eliminar cuota:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al eliminar la cuota", "error");
      }
    }
  };

  // Actualizar una cuota
  const updateCuota = async (cuota) => {
    if (auth === "admin") {
      try {
        await axios.put(`http://localhost:4000/api/shares/update/${cuota._id}`, cuota, {
          withCredentials: true,
        });
        obtenerCuotas();
        Swal.fire("¡Éxito!", "La cuota ha sido actualizada correctamente", "success");
      } catch (error) {
        console.error("Error al actualizar cuota:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al actualizar la cuota", "error");
      }
    }
  };

  const obtenerCuotasPorFecha = async (fecha) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/shares/date/${fecha}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo cuotas por fecha:", error);
      Swal.fire("¡Error!", "No se pudieron obtener las cuotas por fecha.", "error");
      return [];
    }
  };

  const obtenerCuotasPorFechaRange = async (startDate, endDate) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/shares/date-range?startDate=${startDate}&endDate=${endDate}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo cuotas por rango de fechas:", error);
      Swal.fire("¡Error!", "No se pudieron obtener las cuotas por rango de fechas.", "error");
      return [];
    }
  };

  // Ejecuta obtenerCuotas si cambia el rol o si hay un cambio en el auth
  useEffect(() => {
    if (auth === "admin") {
      obtenerCuotas(); // Solo ejecuta la función de obtener cuotas si es admin
    }
  }, [auth]); // Dependiendo de auth, recargamos las cuotas si es necesario

  return (
    <SharesContext.Provider
      value={{
        cuotas,
        loading,
        obtenerCuotas,
        obtenerCuotasPorEstudiante,
        addCuota,
        deleteCuota,
        updateCuota,
        obtenerCuotasPorFecha,
        obtenerCuotasPorFechaRange,
      }}
    >
      {children} {/* El componente siempre está visible */}
    </SharesContext.Provider>
  );
};

export default SharesProvider;