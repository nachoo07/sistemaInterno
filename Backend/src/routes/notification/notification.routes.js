import express from 'express';
import { getAllNotifications, createNotification, deleteNotification } from '../../controllers/notification/notification.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js';

const router = express.Router();

router.get('/', protect,  getAllNotifications);
router.post('/create', protect, admin, createNotification);
router.delete('/delete/:id', protect, admin, deleteNotification);

export default router;