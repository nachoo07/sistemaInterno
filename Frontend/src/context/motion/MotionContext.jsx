// Updated MotionProvider (MotionContext)
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import client from '../../api/axios';
import { LoginContext } from '../login/LoginContext';
import { showConfirmAlert, showErrorAlert, showSuccessToast } from '../../utils/alerts/Alerts';

export const MotionContext = createContext();

const isAuthSessionError = (error) => {
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

export const MotionProvider = ({ children }) => {
  const [motions, setMotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth, authReady } = useContext(LoginContext);

  const fetchMotions = useCallback(async () => {
    if (!authReady || auth !== 'admin') return [];
    try {
      setLoading(true);
      const response = await client.get('/motions/');
      const data = Array.isArray(response.data) ? response.data : [];
      setMotions(data);
      return data;
    } catch (error) {
      console.error('Error fetching motions:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'No se pudieron obtener los movimientos.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [auth, authReady]);

  const createMotion = useCallback(async (motion) => {
    if (!authReady || auth !== 'admin') return null;
    try {
      const response = await client.post('/motions/create', motion);
      const newMotion = response.data;
      setMotions((prev) => {
        if (prev.some((m) => m._id === newMotion._id)) {
          return prev;
        }
        return [...prev, newMotion];
      });
      showSuccessToast('El movimiento ha sido creado correctamente');
      return newMotion;
    } catch (error) {
      console.error('Error creating motion:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'Ha ocurrido un error al crear el movimiento');
      }
      throw error;
    }
  }, [auth, authReady]);

  const updateMotion = useCallback(async (id, updatedMotion) => {
    if (!authReady || auth !== 'admin') return null;
    try {
      const response = await client.put(`/motions/update/${id}`, updatedMotion);
      const updated = response.data;
      setMotions((prev) => prev.map((motion) => (motion._id === id ? updated : motion)));
      showSuccessToast('El movimiento ha sido actualizado correctamente');
      return updated;
    } catch (error) {
      console.error('Error updating motion:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'Ha ocurrido un error al actualizar el movimiento');
      }
      throw error;
    }
  }, [auth, authReady]);

  const deleteMotion = useCallback(async (id) => {
    if (!authReady || auth !== 'admin') return;
    try {
      const confirmacion = await showConfirmAlert(
        '¿Estás seguro que deseas eliminar el movimiento?',
        'Esta acción no se puede deshacer'
      );
      if (confirmacion) {
        await client.delete(`/motions/delete/${id}`);
        setMotions((prev) => prev.filter((motion) => motion._id !== id));
        showSuccessToast('El movimiento ha sido eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting motion:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'Ha ocurrido un error al eliminar el movimiento');
      }
      throw error;
    }
  }, [auth, authReady]);

  const getMotionsByDate = useCallback(async (date) => {
    if (!authReady || auth !== 'admin') return [];
    try {
      setLoading(true);
      const response = await client.get(`/motions/date/${date}`);
      const data = Array.isArray(response.data) ? response.data : [];
      return data;
    } catch (error) {
      console.error('Error obteniendo movimientos por fecha:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'No se pudieron obtener los movimientos por fecha.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [auth, authReady]);

  const getMotionsByDateRange = useCallback(async (startDate, endDate) => {
    if (!authReady || auth !== 'admin') return [];
    try {
      setLoading(true);
      const response = await client.get(
        `/motions/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      return data;
    } catch (error) {
      console.error('Error obteniendo movimientos por rango de fechas:', error);
      if (!isAuthSessionError(error)) {
        showErrorAlert('¡Error!', 'No se pudieron obtener los movimientos por rango de fechas.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [auth, authReady]);

  // Carga inicial de movimientos
  useEffect(() => {
    const fetchData = async () => {
      if (!authReady) {
        return;
      }
      if (auth === 'admin') {
        await fetchMotions();
      } else {
        setMotions([]);
      }
    };
    fetchData();
  }, [auth, authReady, fetchMotions]);

  return (
    <MotionContext.Provider
      value={{
        motions,
        loading,
        fetchMotions,
        createMotion,
        updateMotion,
        deleteMotion,
        getMotionsByDate,
        getMotionsByDateRange,
      }}
    >
      {children}
    </MotionContext.Provider>
  );
};
