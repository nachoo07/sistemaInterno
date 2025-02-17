import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    //console.log('Cookies recibidas:', req.cookies); // Imprime todas las cookies
    const token = req.cookies.token;

    if (!token) {
        //console.log('No se encontró el token en las cookies');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // console.log('Token decodificado:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        //console.error('Error al verificar el token:', error.message);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

export const admin = (req, res, next) => {
    // Verificar si el rol del usuario es 'admin'
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You are not an admin' });
    }
    next(); // Si es admin, continua con la siguiente función
};