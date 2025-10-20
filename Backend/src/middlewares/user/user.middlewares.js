import { validationResult } from 'express-validator';
import pino from 'pino';
const logger = pino();

export const errorHandler = (err, req, res, next) => {
  // Log mejorado: agrega url y method para más contexto
  logger.error({ 
    error: err.message, 
    stack: err.stack, 
    url: req.url,
    method: req.method 
  }, 'Error en la solicitud');

  // Manejar errores de express-validator (sin cambios)
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: validationErrors.array()
    });
  }

  // Otros errores: NUEVO - Detecta errores de conexión/red
  if (err.name === 'MongoNetworkError' || 
      err.message.includes('ECONNRESET') || 
      err.message.includes('ETIMEDOUT') || 
      err.message.includes('connection')) {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión al servidor. Verifica tu conexión a internet.'
    });
  }

  // Fallback para otros errores (sin cambios)
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message
  });
};