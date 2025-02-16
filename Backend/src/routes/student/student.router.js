import express from 'express';
import {
    getAllStudents,
    createStudent,
    deleteStudent,
    updateStudent,
    getStudentById
} from '../../controllers/student/student.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js'; // Importar los middlewares

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/create', protect, admin, createStudent); // Solo los admins pueden crear estudiantes
router.put('/update/:id', protect, admin, updateStudent); // Solo los admins pueden actualizar estudiantes
router.delete('/delete/:id', protect, admin, deleteStudent); // Solo los admins pueden eliminar estudiantes

// Rutas públicas (sin autenticación)
router.get('/:id',protect, admin, getStudentById); // Obtener un estudiante por ID
router.get('/',protect, getAllStudents); // Obtener todos los estudiantes

export default router;