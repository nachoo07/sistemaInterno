import Share from '../../models/share.model.js';
import Student from '../../models/student.model.js';
import Config from '../../models/config.model.js';
import pino from 'pino';
import { DateTime } from 'luxon';

const logger = pino();

export const calculateShareAmount = (baseAmount, currentDay, currentState, currentAmount) => {
  if (currentState === 'Vencido' || currentState === 'Pagado') {
    return { amount: currentAmount, state: currentState }; // Mantener el monto actual y el estado
  }
  if (currentDay > 10) {
    return { amount: baseAmount * 1.1, state: 'Vencido' };
  }
  return { amount: baseAmount, state: 'Pendiente' };
};

export const updateShares = async () => {
  const currentDate = DateTime.now().setZone('America/Argentina/Tucuman');
  logger.info(`Fecha actual en UTC-3: ${currentDate.toString()}`);
  const currentDay = currentDate.day;
  logger.info(`Ejecutando actualización de cuotas con fecha: ${currentDate.toISODate()}`);

  try {
    const config = await Config.findOne({ key: 'cuotaBase' });
    const cuotaBase = config ? config.value : 30000;
    if (!config) {
      logger.warn('No se encontró la configuración de cuotaBase, usando valor predeterminado: 30000');
    }

    const shares = await Share.find({ $or: [{ state: 'Pendiente' }, { state: 'Vencido' }] }).lean();
    const studentIds = [...new Set(shares.map(s => s.student))];
    const students = await Student.find({ _id: { $in: studentIds } }).lean();

    const bulkOps = shares.map(share => {
      const student = students.find(s => s._id.equals(share.student));
      const baseAmount = student && student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;
      const { amount, state } = calculateShareAmount(baseAmount, currentDay, share.state, share.amount);

      return {
        updateOne: {
          filter: { _id: share._id },
          update: { amount: Math.round(amount), state, updatedAt: DateTime.now().toJSDate() }
        }
      };
    });

    if (bulkOps.length > 0) {
      await Share.bulkWrite(bulkOps);
      logger.info({ updatedCount: bulkOps.length }, 'Cuotas actualizadas correctamente');
    } else {
      logger.info('No se encontraron cuotas para actualizar');
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error al actualizar cuotas');
    throw error;
  }
};