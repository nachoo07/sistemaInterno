import express from 'express';
import { body, param } from 'express-validator';
import { getConfig, setConfig } from '../../controllers/base/config.controller.js';
import { protect, admin } from '../../middlewares/login/protect.js';

const router = express.Router();

router.get('/:key', protect, admin, [
    param('key').isString().trim().notEmpty().withMessage('Key is required'),
  ], getConfig);

router.put('/:key', protect, admin, [
    param('key').isString().trim().notEmpty().withMessage('Key is required'),
    body('value').exists().withMessage('Value is required')
  ], (req, _res, next) => {
    req.body.key = req.params.key;
    next();
  }, setConfig);

router.post('/set', protect, admin, [
    body('key').isString().trim().notEmpty().withMessage('Key is required'),
    body('value').exists().withMessage('Value is required'),
  ], setConfig);

export default router;