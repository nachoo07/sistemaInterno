// Helper centralizado para extraer mensajes de error del backend
// Uso: import getErrorMsg from 'frontend/src/helper/helperError/ErrorMsg..jsx'
export const getErrorMsg = (error, defaultMsg = 'Ocurrió un error') => {
  const data = error?.response?.data;

  // Caso 1: Array de errores de validación (express-validator)
  if (data?.errors && Array.isArray(data.errors)) {
    // Extrae el 'msg' de cada objeto de error
    return data.errors
      .map((err) => {
        if (typeof err === 'string') return err;
        if (err?.msg) return err.msg;
        return 'Error desconocido';
      })
      .join('; ');
  }

  // Caso 2: Mensaje directo del backend (ej: Email duplicado)
  if (typeof data?.message === 'string') {
    return data.message;
  }

  // Caso 3: Fallback (Error de red o desconocido)
  return defaultMsg;
};

export default getErrorMsg;