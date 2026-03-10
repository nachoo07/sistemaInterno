import express from "express";
import { body, param } from 'express-validator';
import { protect } from "../../middlewares/login/protect.js";
import {
    getAllAttendances,
    createAttendance,
    updateAttendance,
    getAttendanceByStudentId
} from "../../controllers/attendance/attendance.controller.js";

const router = express.Router();

const validateAttendancePayload = [
    body('date').isISO8601().withMessage('Fecha inválida'),
    body('category').isString().trim().notEmpty().withMessage('Categoría requerida'),
    body('attendance').isArray({ min: 1 }).withMessage('Attendance debe ser un array no vacío')
];

// REST principal
router.get('/', protect, getAllAttendances);
router.post('/', protect, validateAttendancePayload, createAttendance);
router.put('/', protect, validateAttendancePayload, updateAttendance);
router.get('/student/:id', protect, [param('id').isMongoId().withMessage('ID inválido')], getAttendanceByStudentId);

export default router;