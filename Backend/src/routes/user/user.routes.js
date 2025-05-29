import express from 'express';
import { param, query, body } from 'express-validator';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserState
} from '../../controllers/users/user.controller.js';
import   {validateUser}  from '../../validators/users/users.validator.js';
import { protect, admin } from '../../middlewares/login/protect.js';

const router = express.Router();

// Obtener todos los usuarios (paginado)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
], protect, getAllUsers);

// Crear un nuevo usuario
router.post('/create', validateUser, protect, admin, createUser);

// Actualizar un usuario existente
router.put('/update/:id', [
  param('id').isMongoId().withMessage('Valid user ID is required'),
  validateUser // Reutilizamos validateUser, ya que los campos son opcionales en el controlador
], protect, admin, updateUser);

// Eliminar un usuario
router.delete('/delete/:id', [
  param('id').isMongoId().withMessage('Valid user ID is required')
], protect, admin, deleteUser);

// Actualizar el estado de un usuario (activo/inactivo)
router.put('/state/:userId', [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  body('state').isBoolean().withMessage('State must be a boolean')
], protect, admin, updateUserState);

export default router;