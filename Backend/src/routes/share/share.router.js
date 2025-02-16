import express from 'express';
import {
    getAllShares,
    createShare,
    deleteShare,
    updateShare,
    getShareById,
    getSharesByStudent,
    getSharesByDate,
    getSharesByDateRange
} from '../../controllers/share/share.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js'; // Importar los middlewares

const router = express.Router();

// Rutas protegidas (requieren autenticación)
//router.post('/create', createPendingShares); // Crear cuotas pendientes
router.post('/create', protect, admin, createShare); // Solo los admins pueden crear cuotas
router.put('/update/:id', protect, admin, updateShare); // Solo los admins pueden actualizar cuotas
router.delete('/delete/:id', protect, admin, deleteShare); // Solo los admins pueden eliminar cuotas
router.get('/date/:date', protect, admin, getSharesByDate); // Obtener cuotas por fecha
router.get('/date-range', protect, admin, getSharesByDateRange); // Obtener cuotas por rango de fechas

// Rutas públicas (sin autenticación)
router.get('/:id', protect, admin, getShareById); // Obtener una cuota por ID
router.get('/student/:studentId', protect, admin, getSharesByStudent); // Obtener cuotas por estudiante
router.get('/', protect, admin, getAllShares); // Obtener todas las cuotas

export default router;