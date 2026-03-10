import express from 'express';
import { sendEmail, streamEmailProgress } from '../../controllers/email/email.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js'; // Ajusta la ruta según tu estructura
import { validateAndNormalizeEmailPayload } from '../../validators/email/email.validator.js';

const router = express.Router();

// Endpoint principal
router.post('/', [protect, admin, validateAndNormalizeEmailPayload], sendEmail);
router.get('/progress/:progressId', [protect, admin], streamEmailProgress);

export default router;
