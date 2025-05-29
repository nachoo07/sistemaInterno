import express from 'express';
import { PORT } from './config/config.js';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet'; // Seguridad
import rateLimit from 'express-rate-limit'; // Limitar la cantidad de peticiones
import './db/db.connection.js'; // Conexión a la base de datos
import cookieParser from 'cookie-parser'; //para parsear cookies
import userRoutes from './routes/user/user.routes.js'; // Rutas de usuarios
import authRoutes from './routes/login/login.router.js'; // Rutas de autenticación
import studentRoutes from './routes/student/student.router.js'; // Rutas de estudiantes
import shareRoutes from './routes/share/share.router.js'; // Rutas de cuotas
import attendanceRoutes from './routes/attendance/attendance.routes.js'; // Rutas de asistencias
import motionRoutes from './routes/motion/motion.router.js';
import configRoutes from './routes/base/config.routes.js';
import paymentRoutes from './routes/payment/payment.route.js'; // Rutas de pagos
import emailRoutes from './routes/email/email.routes.js'; // Ruta de prueba
import { errorHandler } from './middlewares/user/user.middlewares.js'; // Middleware de manejo de errores
import './cron/cronShare.js'
import pino from 'pino';

const logger = pino()

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yoclaudiofutbol.com', 'https://www.yoclaudiofutbol.com']
  : ['http://localhost:4000', 'http://localhost:5173'];

app.use(helmet());
app.use(express.json({ limit: '20mb' })); // Aumentar el límite a 20 MB
app.use(express.urlencoded({ extended: true, limit: '20mb' })); // Para formularios
app.use(morgan('dev'));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.use(cookieParser());
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 en producción, 50 en desarrollo
  message: async (req) => {
      const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
      return `Demasiados intentos. Por favor, intenta de nuevo en ${retryAfter} segundos.`;
  }
}));

// Rutas
app.use('/api/users', userRoutes); // Prefijo para rutas de usuarios
app.use("/api/auth", authRoutes); // Prefijo para rutas de autenticación
app.use('/api/students', studentRoutes); // Prefijo para rutas de estudiantes
app.use('/api/shares', shareRoutes); // Prefijo para rutas de cuotas
app.use('/api/attendance', attendanceRoutes); // Prefijo para rutas de cuotas
app.use('/api/motions', motionRoutes)
app.use('/api/config', configRoutes); // Nueva ruta
app.use('/api/email', emailRoutes); // Ruta de prueba
app.use('/api/payments', paymentRoutes); // Prefijo para rutas de pagos


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