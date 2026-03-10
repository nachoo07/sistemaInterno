import express from 'express';
import 'express-async-errors';
import { PORT } from './config/config.js';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db/db.connection.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user/user.routes.js';
import authRoutes from './routes/login/login.router.js';
import studentRoutes from './routes/student/student.router.js';
import shareRoutes from './routes/share/share.router.js';
import attendanceRoutes from './routes/attendance/attendance.routes.js';
import motionRoutes from './routes/motion/motion.router.js';
import leagueRoutes from './routes/league/league.routes.js';
import configRoutes from './routes/base/config.routes.js';
import paymentRoutes from './routes/payment/payment.route.js';
import emailRoutes from './routes/email/email.routes.js';
import { errorHandler } from './middlewares/user/user.middlewares.js';
import { AppError } from './utils/errors/appError.js';
import './cron/cronShare.js';
import pino from 'pino';
import { isEmailConfigured, verifyTransporter } from './services/email/transporter.service.js';

const logger = pino();

const app = express();
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yoclaudiofutbol.com', 'https://www.yoclaudiofutbol.com']
  : ['http://localhost:4000', 'http://localhost:5174'];

app.use(helmet());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Origen no permitido por CORS', 403));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.use(cookieParser());

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
app.use((req, _res, next) => {
  if (!stateChangingMethods.has(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (!origin) {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    return next(new AppError('Origen no permitido por CSRF', 403));
  }

  if (allowedOrigins.includes(origin)) {
    return next();
  }

  return next(new AppError('Origen no permitido por CSRF', 403));
});

// NUEVO: Middleware para timeouts en requests (30 segundos max)
app.use((req, res, next) => {
  req.setTimeout(30000); // Timeout para la request
  res.setTimeout(30000); // Timeout para la response
  next();
});

// Rate limit específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: async (req) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    return `Demasiados intentos. Por favor, intenta de nuevo en ${retryAfter} segundos.`;
  }
});

// Rate limit general para resto de la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 120 : 500,
  message: async (req) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    return `Demasiadas solicitudes. Por favor, intenta de nuevo en ${retryAfter} segundos.`;
  }
});

// Rutas con rate limit aplicado antes del router
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/students', apiLimiter, studentRoutes);
app.use('/api/shares', apiLimiter, shareRoutes);
app.use('/api/attendance', apiLimiter, attendanceRoutes);
app.use('/api/motions', apiLimiter, motionRoutes);
app.use('/api/league', apiLimiter, leagueRoutes);
app.use('/api/config', apiLimiter, configRoutes);
app.use('/api/email', apiLimiter, emailRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);

// Ruta base
app.get('/', async (req, res) => {
  res.send('Hello World');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'backend' });
});

app.use((req, _res, next) => {
  next(new AppError('Ruta no encontrada', 404));
});

// Manejo de errores
app.use(errorHandler);

const bootstrap = async () => {
  try {
    logger.info('Iniciando backend');
    logger.info({ port: PORT }, 'Conectando a MongoDB antes de levantar el servidor');
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, 'La aplicación está escuchando');

      if (isEmailConfigured()) {
        verifyTransporter();
      }
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.fatal({ port: PORT }, 'No se pudo iniciar la aplicación: el puerto ya está en uso');
      } else {
        logger.fatal({ error: error.message }, 'No se pudo iniciar la aplicación al abrir el puerto');
      }

      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error: error.message }, 'No se pudo iniciar la aplicación');
    process.exit(1);
  }
};

bootstrap();
