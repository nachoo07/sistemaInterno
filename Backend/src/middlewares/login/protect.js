import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

export const admin = (req, res, next) => {
    // Verificar si el rol del usuario es 'admin'
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You are not an admin' });
    }
    next();
};