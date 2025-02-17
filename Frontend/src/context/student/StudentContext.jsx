import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { LoginContext } from "../login/LoginContext";

export const StudentsContext = createContext();

const StudentsProvider = ({ children }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const { auth } = useContext(LoginContext); // Obtenemos el rol desde el contexto de login

  // Obtener todos los estudiantes (solo si el rol es 'admin')
  const obtenerEstudiantes = async () => {
    if (auth === "admin" || auth === "user") {
      try {
        const response = await axios.get("https://sistemainterno.onrender.com/api/students", {
          withCredentials: true,
        });
        console.log("Response data:", response.data);
        setEstudiantes(response.data);
      } catch (error) {
        console.error("Error obteniendo estudiantes:", error);
        Swal.fire("¡Error!", "No se pudieron obtener los estudiantes. Verifica la URL y el servidor.", "error");
      }
    }
  };

  // Agregar un estudiante
  const addEstudiante = async (estudiante) => {
    if (auth === "admin") {
      try {
        const response = await axios.post("https://sistemainterno.onrender.com/api/students/create", estudiante, {
          withCredentials: true,
        });
        setEstudiantes((prevEstudiantes) => Array.isArray(prevEstudiantes) ? [...prevEstudiantes, response.data] : [response.data]);
        Swal.fire("¡Éxito!", "El estudiante ha sido creado correctamente", "success");
        obtenerEstudiantes();
      } catch (error) {
        console.error("Error al crear el estudiante:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al crear el estudiante", "error");
      }
    }
  };

  // Eliminar un estudiante
  const deleteEstudiante = async (id) => {
    if (auth === "admin") {
      try {
        const confirmacion = await Swal.fire({
          title: "¿Estás seguro que deseas eliminar el estudiante?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
          await axios.delete(`https://sistemainterno.onrender.com/api/students/delete/${id}`, {
            withCredentials: true,
          });
          setEstudiantes((prevEstudiantes) => prevEstudiantes.filter((estudiante) => estudiante._id !== id));
          Swal.fire("¡Eliminado!", "El estudiante ha sido eliminado correctamente", "success");
        }
      } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al eliminar el estudiante", "error");
      }
    }
  };

  // Actualizar un estudiante
  const updateEstudiante = async (estudiante) => {
    if (auth === "admin") {
      try {
        await axios.put(`https://sistemainterno.onrender.com/api/students/update/${estudiante._id}`, estudiante, {
          withCredentials: true,
        });
        await obtenerEstudiantes();
        Swal.fire("¡Éxito!", "El estudiante ha sido actualizado correctamente", "success");
      } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al actualizar el estudiante", "error");
      }
    }
  };



  // Ejecuta obtenerEstudiantes si cambia el rol o si hay un cambio en el auth
  useEffect(() => {
    if (auth === "admin" || auth === "user") {
      obtenerEstudiantes(); // Solo ejecuta la función de obtener estudiantes si es admin
    }
  }, [auth]); // Dependiendo de auth, recargamos los estudiantes si es necesario

const countStudentsByState = (state) => {
  return estudiantes.filter(estudiante => estudiante.state === state).length;
};


  return (
    <StudentsContext.Provider
      value={{
        estudiantes,
        obtenerEstudiantes,
        addEstudiante,
        deleteEstudiante,
        updateEstudiante,
        countStudentsByState
      }}
    >
      {children} {/* El componente siempre está visible */}
    </StudentsContext.Provider>
  );
};

export default StudentsProvider;