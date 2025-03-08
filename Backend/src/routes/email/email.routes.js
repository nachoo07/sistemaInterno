import express from 'express';
import { sendEmail } from '../../controllers/email/email.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js'; // Ajusta la ruta según tu estructura

const router = express.Router();

router.post('/send', protect, admin, sendEmail);

export default router;