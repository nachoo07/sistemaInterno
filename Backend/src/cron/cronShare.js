import cron from 'node-cron';
import { createPendingShares } from '../logic/share.logic.js';
import { updateShares } from './share/sharesCron.js';
import pino from 'pino';
import { DateTime } from 'luxon';

const logger = pino();

// Cron job para crear cuotas pendientes el 1º de cada mes a las 00:00 UTC-3
cron.schedule('30 8 1 * *', async () => {
  logger.info('Ejecutando cron job para crear cuotas pendientes...');
  try {
    await createPendingShares();
    logger.info('Cuotas creadas correctamente');
  } catch (error) {
    logger.error({ error: error.message }, 'Error al ejecutar el cron job');
  }
}, {
  timezone: 'America/Argentina/Tucuman'
});

// Cron job para corrección única en 10 minutos
const now = DateTime.now().setZone('America/Argentina/Tucuman');
const runAt = now.plus({ minutes: 10 });
const cronExpression = `${runAt.second} ${runAt.minute} ${runAt.hour} ${runAt.day} ${runAt.month} *`;
logger.info(`Programando corrección de cuotas para: ${runAt.toString()}`);
cron.schedule(cronExpression, async () => {
  logger.info('Ejecutando cron job para corregir cuotas...');
  try {
    await updateShares();
    logger.info('Corrección de cuotas finalizada');
  } catch (error) {
    logger.error({ error: error.message }, 'Error en el cron job de corrección');
  }
}, {
  scheduled: true,
  timezone: 'America/Argentina/Tucuman'
});

// Cron job diario para actualizar montos y estados a las 00:00 UTC-3
cron.schedule('0 1 * * *', async () => {
  logger.info('Ejecutando cron job diario para actualizar montos y estados de cuotas...');
  try {
    await updateShares();
    logger.info('Montos y estados de cuotas actualizados correctamente');
  } catch (error) {
    logger.error({ error: error.message }, 'Error al ejecutar el cron job de actualización');
  }
}, {
  timezone: 'America/Argentina/Tucuman'
});

logger.info('Cron jobs configurados para cuotas');