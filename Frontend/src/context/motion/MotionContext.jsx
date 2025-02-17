import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { LoginContext } from '../login/LoginContext';

export const MotionContext = createContext();

export const MotionProvider = ({ children }) => {
  const [motions, setMotions] = useState([]);
  const { auth } = useContext(LoginContext);

  useEffect(() => {
    if (auth === 'admin') {
      fetchMotions();
    }
  }, [auth]); // Solo se ejecuta cuando `auth` cambia// Se ejecutará solo una vez cuando el componente se monte

  const fetchMotions = async () => {
    if (auth === 'admin') {
      try {
        const response = await axios.get('https://sistemainterno.onrender.com/api/motions/', { withCredentials: true });
        console.log('Response Data:', response.data);
        setMotions(response.data);
      } catch (error) {
        console.error('Error fetching motions:', error);
        Swal.fire("¡Error!", "No se pudieron obtener las cuotas. Verifica la URL y el servidor.", "error");
      }
    }
  };

  const createMotion = async (motion) => {
    try {
      const response = await axios.post('https://sistemainterno.onrender.com/api/motions/create', motion, { withCredentials: true });
      setMotions(prevMotions => [...prevMotions, response.data]);
      Swal.fire("¡Éxito!", "La cuota ha sido creada correctamente", "success");
    } catch (error) {
      console.error('Error creating motion:', error);
      Swal.fire("¡Error!", "Ha ocurrido un error al crear la cuota", "error");
    }
  };
  
  const updateMotion = async (id, updatedMotion) => {
    try {
      const response = await axios.put(`https://sistemainterno.onrender.com/api/motions/update/${id}`, updatedMotion, { withCredentials: true });
      setMotions(prevMotions => prevMotions.map(motion => (motion._id === id ? response.data : motion)));
      Swal.fire("¡Éxito!", "La cuota ha sido actualizada correctamente", "success");
    } catch (error) {
      console.error('Error updating motion:', error);
      Swal.fire("¡Error!", "Ha ocurrido un error al actualizar la cuota", "error");
    }
  };

  const deleteMotion = async (id) => {
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
        await axios.delete(`https://sistemainterno.onrender.com/api/motions/delete/${id}`, { withCredentials: true });
        setMotions(motions.filter(motion => motion._id !== id));
        Swal.fire("¡Eliminada!", "La cuota ha sido eliminada correctamente", "success");
      }
    } catch (error) {
      console.error('Error deleting motion:', error);
      Swal.fire("¡Error!", "Ha ocurrido un error al eliminar la cuota", "error");
    }
  };

  const getMotionsByDate = async (date) => {
    try {
      const response = await axios.get(`https://sistemainterno.onrender.com/api/motions/date/${date}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo movimientos por fecha:', error);
      Swal.fire("¡Error!", "No se pudieron obtener los movimientos por fecha.", "error");
      return [];
    }
  };

  const getMotionsByDateRange = async (startDate, endDate) => {
    try {
      const response = await axios.get(`https://sistemainterno.onrender.com/api/motions/date-range?startDate=${startDate}&endDate=${endDate}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo movimientos por rango de fechas:', error);
      Swal.fire("¡Error!", "No se pudieron obtener los movimientos por rango de fechas.", "error");
      return [];
    }
  };
  return (
    <MotionContext.Provider value={{ motions, createMotion, updateMotion, deleteMotion, getMotionsByDate, getMotionsByDateRange }}>
      {children}
    </MotionContext.Provider>
  );
};