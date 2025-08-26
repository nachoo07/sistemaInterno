// UsersProvider.js
import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { LoginContext } from "../login/LoginContext";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

export const UsersContext = createContext();

const UsersProvider = ({ children }) => {
  const { auth, waitForAuth } = useContext(LoginContext);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate(); // Agregar navigate

  const obtenerUsuarios = async () => {
    if (auth !== "admin") {
      // No intentar obtener usuarios si no es admin o no está autenticado
      return;
    }
    try {
      const response = await axios.get("/api/users", {
        withCredentials: true,
      });
      if (JSON.stringify(usuarios) !== JSON.stringify(response.data)) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        // Token expirado o no autenticado, redirigir al login
        navigate("/login");
      } else {
        Swal.fire("¡Error!", "No se pudieron cargar los usuarios", "error");
      }
    }
  };

  const addUsuarioAdmin = async (usuario) => {
    if (auth === "admin") {
      try {
        const usuarioData = {
          name: usuario.name,
          mail: usuario.mail,
          password: usuario.password,
          role: usuario.role,
        };
        const response = await axios.post(
          "/api/users/create",
          usuarioData,
          { withCredentials: true }
        );
        if (response.status === 201 && response.data.user) {
          setUsuarios((prevUsuarios) => [...prevUsuarios, response.data.user]);
          Swal.fire("¡Éxito!", "Usuario admin creado correctamente", "success");
        } else {
          throw new Error(response.data.message || "No se pudo crear el usuario admin");
        }
      } catch (error) {
        console.error("Error al crear usuario admin:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        let errorMessage = "No se pudo crear el usuario admin.";
        if (error.response?.status === 400 && error.response?.data?.errors) {
          const validationErrors = error.response.data.errors.map((err) => err.msg).join("\n");
          errorMessage = validationErrors || "Datos inválidos. Verifica los campos.";
        } else if (error.response?.status === 409) {
          errorMessage = "El correo ya está registrado.";
        } else if (error.response?.status === 401) {
          errorMessage = "Sesión expirada. Inicia sesión nuevamente.";
          navigate("/login"); // Redirigir al login
        } else if (error.message) {
          errorMessage = error.message;
        }
        Swal.fire("¡Error!", errorMessage, "error");
      }
    }
  };

  const updateUsuarioAdmin = async (id, usuarioActualizado) => {
    if (auth === "admin") {
      try {
        const usuarioData = {
          name: usuarioActualizado.name,
          mail: usuarioActualizado.mail,
          role: usuarioActualizado.role,
          state: usuarioActualizado.state,
        };
        const response = await axios.put(
          `/api/users/update/${id}`,
          usuarioData,
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.user) {
          setUsuarios((prevUsuarios) =>
            prevUsuarios.map((usuario) =>
              usuario._id === id ? response.data.user : usuario
            )
          );
          Swal.fire("¡Éxito!", "Usuario actualizado correctamente", "success");
        } else {
          throw new Error(response.data.message || "No se pudo actualizar el usuario");
        }
      } catch (error) {
        console.error("Error al actualizar usuario:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        let errorMessage = "No se pudo actualizar el usuario.";
        if (error.response?.status === 400 && error.response?.data?.errors) {
          const validationErrors = error.response.data.errors.map((err) => err.msg).join("\n");
          errorMessage = validationErrors || "Datos inválidos. Verifica los campos.";
        } else if (error.response?.status === 404) {
          errorMessage = "Usuario no encontrado.";
        } else if (error.response?.status === 409) {
          errorMessage = "El correo ya está registrado.";
        } else if (error.response?.status === 401) {
          errorMessage = "Sesión expirada. Inicia sesión nuevamente.";
          navigate("/login"); // Redirigir al login
        } else if (error.message) {
          errorMessage = error.message;
        }
        Swal.fire("¡Error!", errorMessage, "error");
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
          await axios.delete(`/api/users/delete/${id}`, {
            withCredentials: true,
          });
          setUsuarios((prevUsuarios) =>
            prevUsuarios.filter((usuario) => usuario._id !== id)
          );
          Swal.fire("¡Eliminado!", "Usuario eliminado correctamente", "success");
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          navigate("/login"); // Redirigir al login
        } else {
          Swal.fire("¡Error!", "No se pudo eliminar el usuario", "error");
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await waitForAuth();
      if (auth === "admin") {
        await obtenerUsuarios();
      }
    };
    fetchData();
  }, [auth, waitForAuth, navigate]);

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