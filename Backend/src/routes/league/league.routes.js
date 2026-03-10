import express from 'express';
import { body, param } from 'express-validator';
import { protect, admin } from '../../middlewares/login/protect.js';
import {
  closeSeason,
  getClosureStatus,
  getSeasons,
  getSeasonDetail
} from '../../controllers/league/leagueArchive.controller.js';

const router = express.Router();

router.get('/closure-status', protect, admin, getClosureStatus);

router.post('/close-period', protect, admin, [
  body('seasonName').optional().isString().trim().notEmpty().withMessage('seasonName debe ser texto no vacío'),
  body('periodStart').optional().isISO8601().withMessage('periodStart inválido'),
  body('periodEnd').optional().isISO8601().withMessage('periodEnd inválido')
], closeSeason);

router.get('/periods', protect, admin, getSeasons);
router.get('/periods/:id', protect, admin, [param('id').isMongoId().withMessage('ID inválido')], getSeasonDetail);

// Compatibilidad básica
router.post('/close-season', protect, admin, closeSeason);
router.get('/seasons', protect, admin, getSeasons);
router.get('/seasons/:id', protect, admin, [param('id').isMongoId().withMessage('ID inválido')], getSeasonDetail);

export default router;
