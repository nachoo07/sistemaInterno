import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from "../../models/users/user.model.js";
import RefreshToken from '../../models/refreshToken/refreshToken.models.js';
import pino from 'pino';
import { validationResult } from 'express-validator';
import {
    sendBadRequest,
    sendForbidden,
    sendInternalServerError,
    sendUnauthorized
} from '../_shared/controller.utils.js';
const logger = pino();
const INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas';

const buildCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
});

const clearAuthCookies = (res) => {
    const cookieOptions = buildCookieOptions();
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
};

const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendBadRequest(res, 'Datos inválidos', { errors: errors.array() });
    }
    return null;
};

// Generar Access Token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
};

// Generar Refresh Token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Login
export const loginUser = async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const mail = typeof req.body?.mail === 'string' ? req.body.mail.trim().toLowerCase() : '';
    const { password } = req.body;

    if (!mail || !password) {
        return sendBadRequest(res, 'Se requiere correo electrónico y contraseña.');
    }
    try {
        const user = await User.findOne({ mail }).select('+password');
        if (!user || !await bcrypt.compare(password, user.password)) {
            logger.warn({ mail }, 'Intento de login fallido: Credenciales inválidas');
            return sendUnauthorized(res, INVALID_CREDENTIALS_MESSAGE);
        }
        if (!user.state) {
            logger.warn({ mail }, 'Intento de login en cuenta inactiva');
            return sendUnauthorized(res, INVALID_CREDENTIALS_MESSAGE);
        }

        user.lastLogin = new Date();
        await user.save();

        const payload = {
            userId: user._id,
            role: user.role
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Almacenar el RefreshToken en la base de datos
        await RefreshToken.create({
            tokenHash: hashRefreshToken(refreshToken),
            userId: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        });

        res.cookie('token', accessToken, { ...buildCookieOptions(), maxAge: 2 * 60 * 60 * 1000 });

        res.cookie('refreshToken', refreshToken, { ...buildCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

        logger.info({ userId: user._id }, 'Login exitoso');
        res.status(200).json({
            message: 'Login exitoso',
            user: { id: user._id, name: user.name, role: user.role, mail: user.mail }
        });
    } catch (error) {
        logger.error({ err: error.message, stack: error.stack, mail }, 'Error crítico durante login');
        return sendInternalServerError(res, 'Error interno del servidor al iniciar sesión.');
    };
}

// Logout
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const refreshTokenHash = hashRefreshToken(refreshToken);
            await RefreshToken.deleteOne({
                $or: [
                    { tokenHash: refreshTokenHash },
                    { token: refreshToken } // Compatibilidad con sesiones legacy.
                ]
            });
        }

        clearAuthCookies(res);
        logger.info('Usuario deslogueado correctamente');
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });

    } catch (error) {
       logger.error({ err: error.message }, 'Error menor durante logout');
        // Incluso si falla el borrado en BD, limpiamos cookies en cliente
        clearAuthCookies(res);
        res.status(200).json({ message: 'Sesión cerrada' });
    }
};

// Refresh Token
export const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return sendUnauthorized(res, 'No autenticado');
    }

    try {
        // 1. Buscamos el token en la BD
        const refreshTokenHash = hashRefreshToken(refreshToken);
        const storedToken = await RefreshToken.findOne({
            $or: [
                { tokenHash: refreshTokenHash },
                { token: refreshToken } // Compatibilidad con sesiones legacy.
            ]
        });

        // Detección de robo de token:
        // Si el token verifica por JWT pero no está en la BD, significa que ya fue usado (rotado)
        // y alguien está intentando reusarlo. Deberíamos invalidar todas las sesiones del usuario (opcional pero recomendado).
        if (!storedToken) {
            // Intentamos decodificar para saber QUIÉN fue (si es posible) y loguear la alerta
            const decoded = jwt.decode(refreshToken); 
            logger.warn({ userId: decoded?.userId }, 'Alerta de Seguridad: Intento de uso de Refresh Token inválido o reutilizado');
            
            return sendForbidden(res, 'Sesión inválida, por favor inicie sesión nuevamente');
        }

        // NUEVO: Validación explícita de fecha
        if (storedToken.expiresAt < new Date()) {
            // Eliminar por si el TTL de Mongo aún no corrió
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return sendForbidden(res, 'Sesión expirada');
        }

        // 2. Verificar validez criptográfica
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.userId).select('_id role state').lean();
        if (!user || !user.state) {
            await RefreshToken.deleteMany({ userId: decoded.userId });
            clearAuthCookies(res);
            return sendForbidden(res, 'Su sesión ya no es válida');
        }

        // 3. ELIMINAR el token usado (Rotación)
        await RefreshToken.deleteOne({ _id: storedToken._id });

        // 4. Generar NUEVOS tokens (Access y Refresh)
        const payload = {
            userId: String(user._id),
            role: user.role
        };

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        // 5. Guardar el NUEVO refresh token
        await RefreshToken.create({
            tokenHash: hashRefreshToken(newRefreshToken),
            userId: decoded.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // 6. Enviar ambas cookies nuevas
        res.cookie('token', newAccessToken, { ...buildCookieOptions(), maxAge: 2 * 60 * 60 * 1000 });

        res.cookie('refreshToken', newRefreshToken, { ...buildCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

        logger.info({ userId: decoded.userId }, 'Sesión renovada (Token Rotado)');
        res.status(200).json({ message: 'Sesión renovada' });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
             // Aquí sí somos específicos porque el frontend necesita saberlo para limpiar estado
             logger.info('Intento de refresh con token expirado');
             // Aseguramos limpieza si existe en BD
             const refreshTokenHash = hashRefreshToken(refreshToken);
             await RefreshToken.deleteOne({
                $or: [
                    { tokenHash: refreshTokenHash },
                    { token: refreshToken } // Compatibilidad con sesiones legacy.
                ]
             }).catch(() => {});
             clearAuthCookies(res);
             return sendForbidden(res, 'Sesión expirada');
        }
        clearAuthCookies(res);
        logger.error({ err: error.message, stack: error.stack }, 'Error procesando refresh token');
        return sendForbidden(res, 'No se pudo renovar la sesión');
    }
}
