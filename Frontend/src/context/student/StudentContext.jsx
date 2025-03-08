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
        const response = await axios.get("http://localhost:4000/api/students", {
          withCredentials: true,
        });
        setEstudiantes(Array.isArray(response.data) ? response.data : []);
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
        const formData = new FormData();
        for (const key in estudiante) {
          if (key === 'profileImage' && estudiante[key] instanceof File) {
            formData.append(key, estudiante[key]);
          } else if (estudiante[key]) {
            formData.append(key, estudiante[key]);
          }
        }
        const response = await axios.post("http://localhost:4000/api/students/create", formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data', // Asegúrate de que el Content-Type sea correcto
          },
        });
        setEstudiantes((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, response.data.student];
        });
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
          await axios.delete(`http://localhost:4000/api/students/delete/${id}`, {
            withCredentials: true,
          });
          setEstudiantes((prev) => prev.filter((estudiante) => estudiante._id !== id));
          Swal.fire("¡Eliminado!", "El estudiante ha sido eliminado correctamente", "success");
        }
        else {
          return false;
        }
      } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        Swal.fire("¡Error!", "Ha ocurrido un error al eliminar el estudiante", "error");
        return false;
      }
    }
  };

  // Actualizar un estudiante
  const updateEstudiante = async (estudiante) => {
    if (auth === "admin") {
      try {
        const formData = new FormData();
        for (const key in estudiante) {
          if (key === 'profileImage' && estudiante[key] instanceof File) {
            formData.append(key, estudiante[key]);
          } else if (estudiante[key]) {
            formData.append(key, estudiante[key]);
          }
        }
          const response = await axios.put(`http://localhost:4000/api/students/update/${estudiante._id}`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data', // Asegúrate de que el Content-Type sea correcto
          },
        });
        setEstudiantes((prev) =>
          prev.map((est) => (est._id === estudiante._id ? response.data.student : est))
        );
        obtenerEstudiantes();
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
    // Verificar si estudiantes es un array
    const estudiantesArray = Array.isArray(estudiantes) ? estudiantes : [];
    return estudiantesArray.filter(student => student.state === state).length;
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