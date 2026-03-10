import dotenv from 'dotenv';
dotenv.config();

// Validación de seguridad al inicio
const requiredEnvs = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'CONNECTION_STRING'];
requiredEnvs.forEach((envKey) => {
    if (!process.env[envKey]) {
        console.error(`❌ FATAL ERROR: La variable de entorno ${envKey} no está definida.`);
        process.exit(1); // Detiene el servidor inmediatamente
    }
});

export const PORT = process.env.PORT || 4000;
export const CONNECTION_STRING = process.env.CONNECTION_STRING