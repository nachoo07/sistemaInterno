import express from 'express';
import { getConfig, setConfig } from '../../controllers/base/config.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js';

const router = express.Router();

router.get('/:key', protect, admin, getConfig);
router.post('/set', protect, admin, setConfig);

export default router;