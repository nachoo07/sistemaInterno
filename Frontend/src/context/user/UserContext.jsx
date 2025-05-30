import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { LoginContext } from "../login/LoginContext";

export const UsersContext = createContext();

const UsersProvider = ({ children }) => {
  const { auth } = useContext(LoginContext);
  const [usuarios, setUsuarios] = useState([]);

  const obtenerUsuarios = async () => {
    if (auth === "admin") {
      try {
        const response = await axios.get("http://localhost:4000/api/users", {
          withCredentials: true,
        });
        if (JSON.stringify(usuarios) !== JSON.stringify(response.data)) {
          setUsuarios(response.data);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        Swal.fire("¡Error!", "No se pudieron cargar los usuarios", "error");
      }
    }
  };

  const addUsuarioAdmin = async (usuario) => {
    if (auth === "admin") {
      try {
        // Asegúrate de que el objeto usuario tenga los campos correctos
        const usuarioData = {
          name: usuario.name,
          mail: usuario.mail,
          password: usuario.password,
          role: usuario.role,
        };
        console.log("Datos enviados para crear usuario:", usuarioData); // Para depuración
        const response = await axios.post(
          "http://localhost:4000/api/users/create",
          usuarioData,
          { withCredentials: true }
        );
        // Verifica que la respuesta sea exitosa (201 Created)
        if (response.status === 201) {
          setUsuarios((prevUsuarios) => [...prevUsuarios, response.data.user]);
          Swal.fire("¡Éxito!", "Usuario admin creado correctamente", "success");
        }
      } catch (error) {
        console.error("Error al crear usuario admin:", error.response?.data || error.message);
        Swal.fire(
          "¡Error!",
          error.response?.data?.message || "No se pudo crear el usuario admin",
          "error"
        );
      }
    }
  };

  const updateUsuarioAdmin = async (id, usuarioActualizado) => {
    if (auth === "admin") {
      try {
        // Asegúrate de que el objeto usuarioActualizado tenga los campos correctos
        const usuarioData = {
          name: usuarioActualizado.name,
          mail: usuarioActualizado.mail,
          role: usuarioActualizado.role,
          state: usuarioActualizado.state,
        };
        console.log("Datos enviados para actualizar usuario:", usuarioData); // Para depuración
        const response = await axios.put(
          `http://localhost:4000/api/users/update/${id}`,
          usuarioData,
          { withCredentials: true }
        );
        // Verifica que la respuesta sea exitosa (200 OK)
        if (response.status === 200) {
          setUsuarios((prevUsuarios) =>
            prevUsuarios.map((usuario) =>
              usuario._id === id ? response.data.user : usuario
            )
          );
          Swal.fire("¡Éxito!", "Usuario actualizado correctamente", "success");
        }
      } catch (error) {
        console.error("Error al actualizar usuario:", error.response?.data || error.message);
        Swal.fire(
          "¡Error!",
          error.response?.data?.message || "No se pudo actualizar el usuario",
          "error"
        );
      }
    }
  };

  const deleteUsuarioAdmin = async (id) => {
    if (auth === "admin") {
      try {
        const confirmacion = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
          await axios.delete(`http://localhost:4000/api/users/delete/${id}`, {
            withCredentials: true,
          });
          setUsuarios((prevUsuarios) =>
            prevUsuarios.filter((usuario) => usuario._id !== id)
          );
          Swal.fire("¡Eliminado!", "Usuario eliminado correctamente", "success");
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        Swal.fire("¡Error!", "No se pudo eliminar el usuario", "error");
      }
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, [auth]);

  return (
    <UsersContext.Provider
      value={{
        usuarios,
        obtenerUsuarios,
        addUsuarioAdmin,
        updateUsuarioAdmin,
        deleteUsuarioAdmin,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;