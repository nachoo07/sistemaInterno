import express from 'express';
import { protect, admin } from '../../middlewares/login/protect.js';
import { validateUser } from '../../validators/users/users.validator.js'; // Importa el validador
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser, 
    updateUserState
} from '../../controllers/users/user.controller.js'; // Importa los controladores

const router = express.Router();

// Obtener todos los usuarios
router.get('/', protect, admin, getAllUsers);

// Crear un nuevo usuario
router.post('/', protect, admin, validateUser, createUser);

// Actualizar un usuario por ID
router.put('/:id', protect, admin, updateUser);

// Eliminar un usuario por ID (hard delete)
router.delete('/:id',protect, admin, deleteUser);

// Actualizar el estado de un usuario por ID
router.patch('/users/:userId/state',protect, admin, updateUserState);

export default router;