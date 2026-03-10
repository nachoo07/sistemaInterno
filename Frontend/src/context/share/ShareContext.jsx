import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import client from "../../api/axios";
import { LoginContext } from "../login/LoginContext";

export const SharesContext = createContext();

const SharesProvider = ({ children }) => {
  const [cuotas, setCuotas] = useState([]);
  const [cuotasStatusCount, setCuotasStatusCount] = useState({
    pendientes: 0,
    vencidas: 0,
    pagadas: 0,
  });
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const { auth, authReady } = useContext(LoginContext);
  const hasFetched = useRef(false);

  const loading = pendingRequests > 0;

  const startRequest = useCallback(() => {
    setPendingRequests((prev) => prev + 1);
  }, []);

  const endRequest = useCallback(() => {
    setPendingRequests((prev) => Math.max(0, prev - 1));
  }, []);

  const withRequest = useCallback(async (requestFn) => {
    startRequest();
    try {
      return await requestFn();
    } finally {
      endRequest();
    }
  }, [startRequest, endRequest]);

  const obtenerCuotas = useCallback(async () => {
    if (!authReady || auth !== "admin") return [];
    try {
      const response = await withRequest(() => client.get("/shares"));
      const data = Array.isArray(response.data) ? response.data : [];
      setCuotas(data);
      return data;
    } catch (error) {
      console.error("Error obteniendo cuotas:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setCuotas([]);
      throw error;
    }
  }, [auth, authReady, withRequest]);

  const obtenerCuotasStatusCount = useCallback(async () => {
    if (!authReady || auth !== "admin") {
      setCuotasStatusCount({ pendientes: 0, vencidas: 0, pagadas: 0 });
      return { pendientes: 0, vencidas: 0, pagadas: 0 };
    }
    try {
      const response = await withRequest(() => client.get("/shares/status-count"));
      const nextCount = {
        pendientes: response.data.pendientes || 0,
        vencidas: response.data.vencidas || 0,
        pagadas: response.data.pagadas || 0,
      };
      setCuotasStatusCount(nextCount);
      return nextCount;
    } catch (error) {
      console.error("Error obteniendo conteos de cuotas:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setCuotasStatusCount({ pendientes: 0, vencidas: 0, pagadas: 0 });
      throw error;
    }
  }, [auth, authReady, withRequest]);

  const obtenerCuotasPorEstudiante = useCallback(async (studentId) => {
    if (!studentId || !authReady || auth !== "admin") return [];
    try {
      const response = await withRequest(() => client.get(`/shares/student/${studentId}`));
      const data = Array.isArray(response.data) ? response.data : [];
      setCuotas((prev) => [...prev.filter((cuota) => cuota.student?._id !== studentId), ...data]);
      return data;
    } catch (error) {
      console.error("Error obteniendo cuotas por estudiante:", {
        studentId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }, [auth, authReady, withRequest]);

  const addCuota = useCallback(async (cuota) => {
    if (!authReady || auth !== "admin") return;
    try {
      const response = await withRequest(() => client.post("/shares/create", cuota));
      const newCuota = response.data.share;
      setCuotas((prev) => [...(Array.isArray(prev) ? prev : []), newCuota]);
      await obtenerCuotasStatusCount();
      return newCuota;
    } catch (error) {
      console.error("Error al crear la cuota:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error("Ha ocurrido un error al crear la cuota");
    }
  }, [auth, authReady, obtenerCuotasStatusCount, withRequest]);

  const deleteCuota = useCallback(async (id) => {
    if (!authReady || auth !== "admin") return;
    try {
      await withRequest(() => client.delete(`/shares/delete/${id}`));
      setCuotas((prev) => prev.filter((cuota) => cuota._id !== id));
      await obtenerCuotasStatusCount();
    } catch (error) {
      console.error("Error al eliminar cuota:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error("Ha ocurrido un error al eliminar la cuota");
    }
  }, [auth, authReady, obtenerCuotasStatusCount, withRequest]);

  const updateCuota = useCallback(async (cuota) => {
    if (!authReady || auth !== "admin") return;
    try {
      const response = await withRequest(() => client.put(`/shares/update/${cuota._id}`, cuota));
      const updatedCuota = response.data.share;
      setCuotas((prev) =>
        prev.map((c) => (c._id === updatedCuota._id ? updatedCuota : c))
      );
      await obtenerCuotasStatusCount();
      return updatedCuota;
    } catch (error) {
      console.error("Error al actualizar cuota:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error("Ha ocurrido un error al actualizar la cuota");
    }
  }, [auth, authReady, obtenerCuotasStatusCount, withRequest]);

  const obtenerCuotasPorFecha = useCallback(async (fecha) => {
    if (!authReady || auth !== "admin") return [];
    try {
      startRequest();
      setCuotas([]);
      const response = await client.get(`/shares/date/${fecha}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setCuotas(data);
      return data;
    } catch (error) {
      console.error('Error obteniendo cuotas por fecha:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error('No se pudieron obtener las cuotas por fecha.');
    } finally {
      endRequest();
    }
  }, [auth, authReady, endRequest, startRequest]);

  const obtenerCuotasPorFechaRange = useCallback(async (startDate, endDate) => {
    if (!authReady || auth !== "admin") return [];
    try {
      startRequest();
      setCuotas([]);
      const response = await client.get('/shares/date-range', {
        params: { startDate, endDate },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setCuotas(data);
      return data;
    } catch (error) {
      console.error('Error obteniendo cuotas por rango de fechas:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error('No se pudieron obtener las cuotas por rango de fechas.');
    } finally {
      endRequest();
    }
  }, [auth, authReady, endRequest, startRequest]);

  useEffect(() => {
    if (!authReady) return;

    if (auth !== "admin") {
      hasFetched.current = false;
      setIsInitialLoadComplete(false);
      setCuotasStatusCount({ pendientes: 0, vencidas: 0, pagadas: 0 });
      setCuotas([]);
      return;
    }

    if (auth === "admin" && !hasFetched.current) {
      hasFetched.current = true;
      obtenerCuotasStatusCount()
        .catch(() => {})
        .finally(() => setIsInitialLoadComplete(true));
    }
  }, [auth, authReady, obtenerCuotasStatusCount]);

  return (
    <SharesContext.Provider
      value={{
        cuotas,
        cuotasStatusCount,
        loading,
        isInitialLoadComplete,
        obtenerCuotas,
        obtenerCuotasStatusCount,
        obtenerCuotasPorEstudiante,
        addCuota,
        deleteCuota,
        updateCuota,
        obtenerCuotasPorFecha,
        obtenerCuotasPorFechaRange,
        setCuotas,
      }}
    >
      {children}
    </SharesContext.Provider>
  );
};

export default SharesProvider;