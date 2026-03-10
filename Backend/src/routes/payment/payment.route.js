import express from 'express';
import { body, param, query } from 'express-validator';
import { getPaymentsByStudent, createPayment, deletePayment, updatePayment, getAllPayments, getPaymentsByDateRange } from '../../controllers/payment/payment.controller.js';
import { getAllConcepts, createConcept, deleteConcept } from '../../controllers/concept/paymentConcept.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js';
import { isSupportedPaymentMethod } from '../../utils/payment/payment.utils.js';

const router = express.Router();

const validatePayment = [
  body('studentId').isMongoId().withMessage('ID de estudiante inválido'),
  body('amount').isFloat({ min: 0 }).toFloat().withMessage('Monto debe ser un número positivo'),
  body('paymentDate').isISO8601().withMessage('Fecha de pago inválida'),
  body('paymentMethod').custom(isSupportedPaymentMethod).withMessage('Método de pago inválido'),
  body('concept').isString().trim().notEmpty().withMessage('Concepto es requerido'),
];

const validateConcept = [
  body('name').isString().trim().notEmpty().withMessage('El nombre del concepto es requerido').isLength({ max: 50 }).withMessage('El concepto no puede exceder 50 caracteres'),
];

router.get('/concepts', protect, admin, getAllConcepts);

router.post('/concepts', protect, admin, validateConcept, createConcept);

router.delete('/concepts/:id',
  protect,
  admin,
  [param('id').isMongoId().withMessage('ID de concepto inválido')],
  deleteConcept
);

router.get('/', protect, admin, getAllPayments);

// REST principal
router.post('/', protect, admin, validatePayment, createPayment);

router.put('/:id',
  protect,
  admin,
  [param('id').isMongoId().withMessage('ID de pago inválido'), ...validatePayment],
  updatePayment
);

router.delete('/:id',
  protect,
  admin,
  [param('id').isMongoId().withMessage('ID de pago inválido')],
  deletePayment
);

router.get('/student/:studentId',
  protect,
  admin,
  [param('studentId').isMongoId().withMessage('ID de estudiante inválido')],
  getPaymentsByStudent
);

router.get('/date-range',
  protect,
  admin,
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').isISO8601().withMessage('Fecha de fin inválida'),
  ],
  getPaymentsByDateRange
);

// Compatibilidad legacy
router.post('/create', protect, admin, validatePayment, createPayment);
router.put('/update/:id',
  protect,
  admin,
  [param('id').isMongoId().withMessage('ID de pago inválido'), ...validatePayment],
  updatePayment
);
router.delete('/delete/:id',
  protect,
  admin,
  [param('id').isMongoId().withMessage('ID de pago inválido')],
  deletePayment
);

export default router;
