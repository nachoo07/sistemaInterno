import express from 'express';
import { PORT } from './config/config.js';
import morgan from 'morgan';
import cors from 'cors';
import './db/db.connection.js'; // Conexión a la base de datos
import cookieParser from 'cookie-parser'; //para parsear cookies
import userRoutes from './routes/user/user.routes.js'; // Rutas de usuarios
import authRoutes from './routes/login/login.router.js'; // Rutas de autenticación
import studentRoutes from './routes/student/student.router.js'; // Rutas de estudiantes
import shareRoutes from './routes/share/share.router.js'; // Rutas de cuotas
import attendanceRoutes from './routes/attendance/attendance.routes.js'; // Rutas de asistencias
import { errorHandler } from './middlewares/user/user.middlewares.js'; // Manejador de errores
import './cron/cronShare.js'; // Importa el cron job para que se ejecute
import testRouter from './routes/cron.js';
import motionRoutes from './routes/motion/motion.router.js';

const app = express();

// Middlewares
app.use(express.json()); // Para parsear JSON
app.use(morgan('dev')); // Logger de solicitudes
app.use(cors({
  origin: 'https://sistemainterno.onrender.com', // Cambia esto al origen del frontend
  credentials: true, // Permite enviar cookies o encabezados de autorización
}));

app.use(cookieParser()); //para parsear cookies

// Rutas
app.use('/api/users', userRoutes); // Prefijo para rutas de usuarios
app.use("/api/auth", authRoutes); // Prefijo para rutas de autenticación
app.use('/api/students', studentRoutes); // Prefijo para rutas de estudiantes
app.use('/api/shares', shareRoutes); // Prefijo para rutas de cuotas
app.use('/api/attendance', attendanceRoutes); // Prefijo para rutas de cuotas
app.use('/api/motions', motionRoutes)
app.use(testRouter);

// Ruta base
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Manejo de errores
app.use(errorHandler);

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`La aplicación está escuchando en el puerto ${PORT}`);
});