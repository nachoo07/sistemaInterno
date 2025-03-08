import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../../models/users/user.model.js";

// Generar Access Token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); // 2 horas
};

// Generar Refresh Token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7 días
};

// Login
export const loginUser = async (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(400).json({ message: 'Se requiere correo electrónico y contraseña.' });
    }
    try {
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        if (!user.state) {
            return res.status(403).json({ message: 'Su cuenta está inactiva. Por favor contacte al administrador.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        const payload = {
            userId: user._id,
            role: user.role,
            name: user.name,
            mail: user.mail,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Configuración de cookies
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
            sameSite: 'lax',
            path: '/',
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
        res.status(200).json({
            message: 'Login successful',
            user: { name: user.name, role: user.role, mail: user.mail }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
    }
};

// Logout
export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.status(200).json({ message: 'User logged out successfully!' });
};

// Refresh Token
export const refreshAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found, please log in again.' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const payload = {
            userId: decoded.userId,
            role: decoded.role,
            name: decoded.name,
            mail: decoded.mail
        };

        const accessToken = generateAccessToken(payload);

        // Actualizar la cookie del access token
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        });
        res.status(200).json({
            message: 'Access token refreshed',
            accessToken // Opcional, si el frontend lo necesita
        });
    } catch (error) {
        console.error('Error al refrescar token:', error.message);
        res.status(403).json({ message: 'Invalid refresh token, please log in again.' });
    }
};
