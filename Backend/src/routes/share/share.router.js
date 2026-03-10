import express from 'express';
import { param, body, query } from 'express-validator';
import {
    getAllShares,
    createShare,
    deleteShare,
    updateShare,
    getShareById,
    getSharesByStudent,
    getSharesByDate,
    getSharesByDateRange,
    getStudentsWithShareStatus,
    updatePendingShares,
    getSharesStatusCount
} from '../../controllers/share/share.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js';

const router = express.Router();

// REST principal
router.post('/', protect, admin, [
    body('student').isMongoId().withMessage('Valid student ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('amount').isFloat({ min: 0 }).toFloat().withMessage('Valid amount is required'),
    body('paymentmethod').optional().isIn(['Efectivo', 'Tarjeta', 'Transferencia']).withMessage('Método de pago inválido'),
    body('paymentdate').optional().isISO8601().withMessage('Fecha de pago inválida')
], createShare);

router.put('/:id', protect, admin, [
    param('id').isMongoId(),
    body('amount').optional().isFloat({ min: 0 }).toFloat().withMessage('Valid amount is required'),
    body('paymentmethod').optional().isIn(['Efectivo', 'Tarjeta', 'Transferencia']).withMessage('Método de pago inválido'),
    body('paymentdate').optional().isISO8601().withMessage('Fecha de pago inválida')
], updateShare);

router.delete('/:id', protect, admin, [param('id').isMongoId()], deleteShare);
router.get('/date/:date', protect, admin, [param('date').isISO8601()], getSharesByDate);
router.get('/date-range', protect, admin, [
    query('startDate').isISO8601().withMessage('Valid start date is required'),
    query('endDate').isISO8601().withMessage('Valid end date is required')
], getSharesByDateRange);
router.get('/students-status', protect, admin, getStudentsWithShareStatus);
router.put('/update-pending', protect, admin, updatePendingShares);
router.get('/status-count', protect, admin, getSharesStatusCount); // Ruta estática antes de /:id
router.get('/:id', protect, admin, [param('id').isMongoId().withMessage('Valid MongoDB ID is required')], getShareById);
router.get('/student/:studentId', protect, admin, [param('studentId').isMongoId()], getSharesByStudent);
router.get('/', protect, admin, getAllShares);

// Compatibilidad legacy
router.post('/create', protect, admin, [
    body('student').isMongoId().withMessage('Valid student ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('amount').isFloat({ min: 0 }).toFloat().withMessage('Valid amount is required'),
    body('paymentmethod').optional().isIn(['Efectivo', 'Tarjeta', 'Transferencia']).withMessage('Método de pago inválido'),
    body('paymentdate').optional().isISO8601().withMessage('Fecha de pago inválida')
], createShare);

router.put('/update/:id', protect, admin, [
    param('id').isMongoId(),
    body('amount').optional().isFloat({ min: 0 }).toFloat().withMessage('Valid amount is required'),
    body('paymentmethod').optional().isIn(['Efectivo', 'Tarjeta', 'Transferencia']).withMessage('Método de pago inválido'),
    body('paymentdate').optional().isISO8601().withMessage('Fecha de pago inválida')
], updateShare);

router.delete('/delete/:id', protect, admin, [param('id').isMongoId()], deleteShare);

export default router;