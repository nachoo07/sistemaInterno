import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../../models/users/user.model.js";

// Login para usuarios y administradores

// Generar Access Token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); // Expira en 15 minutos
};

// Generar Refresh Token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // Expira en 7 días
};

export const loginUser = async (req, res) => {
    const { mail, password } = req.body;
    //console.log('Credenciales recibidas:', { mail, password });

    if (!mail || !password) {
        return res.status(400).json({ message: 'Se requiere correo electrónico y contraseña.' });
    }

    try {
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales Invalidas' });
        }

        if (!user.state) {
            return res.status(403).json({ message: 'Su cuenta está inactiva. Por favor contacte al administrador.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales Invalidas' });
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
            secure: true, // Siempre true para HTTPS
            sameSite: 'None', // Necesario para cross-site
            path: '/',
            domain: '.sistemainterno.onrender.com', // Dominio principal
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            domain: '.sistemainterno.onrender.com',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // Log para verificar las cookies
        //console.log('Cookies configuradas:', {
         //   token: accessToken,
         //   refreshToken: refreshToken
        //});

        res.status(200).json({
            message: 'Login successful',
            user: { 
                name: user.name, 
                role: user.role, 
                mail: user.mail 
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error logging in.', error });
    }
};
export const logout = (req, res) => {
    //console.log('Cookies recibidas en el servidor:', req.cookies);
    //console.log('RefreshToken recibido:', req.cookies.refreshToken);

    // Verificar si la cookie "refreshToken" existe
    if (!req.cookies.refreshToken) {
        return res.status(400).json({ message: 'No refresh token found in cookies' });
    }

    // Eliminar la cookie "refreshToken"
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, // Importante para HTTPS
        sameSite: 'None', // Necesario para que funcione en frontend separado
        path: '/' 
    });

    // Eliminar la cookie "token" si existe
    res.clearCookie('token', {
        httpOnly: true,
        secure: true, // Asegurar que coincida con la configuración original
        sameSite: 'None', 
        path: '/' 
    });

    //console.log('Cookies eliminadas correctamente');
    res.status(200).json({ message: 'User logged out successfully!' });
};

export const refreshAccessToken = (req, res) => {
    //console.log("Cookies recibidas en /refresh:", req.cookies);
   // console.log("Refresh token recibido:", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found, please log in again.' });
    }

    try {
        // Validar el Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Crear un nuevo Access Token
        const accessToken = generateAccessToken({ 
            userId: decoded.userId, 
            role: decoded.role, 
            name: decoded.name, 
            mail: decoded.mail 
        });

        /*res.cookie('token', accessToken, {
            httpOnly: true,  // Solo accesible desde el servidor
            secure: process.env.NODE_ENV === 'production', // Usar solo en HTTPS en producción
            sameSite: 'Strict', // Evita el acceso cruzado
            maxAge: 15 * 60 * 1000, // 15 minutos
        });*/
        
        res.status(200).json({ 
            message: 'Access token refreshed',
            accessToken
        });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token, please log in again.' });
    }
};
