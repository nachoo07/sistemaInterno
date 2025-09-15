import Share from '../models/share/share.model.js';
import Student from '../models/student/student.model.js';
import Config from '../models/base/config.model.js';
import pino from 'pino';
import { DateTime } from 'luxon';

const logger = pino();

export const fixVencidoShares = async () => {
  logger.info('Iniciando corrección de cuotas en estado Vencido...');
  try {
    // Obtener la configuración de cuota base
    const config = await Config.findOne({ key: 'cuotaBase' });
    if (!config) throw new Error('No se encontró la configuración de cuotaBase');
    const cuotaBase = config.value || 30000;

    // Obtener todas las cuotas en estado Vencido
    const shares = await Share.find({ state: 'Vencido' }).lean();
    if (shares.length === 0) {
      logger.info('No se encontraron cuotas en estado Vencido para corregir');
      return;
    }

    // Obtener los estudiantes relacionados
    const studentIds = [...new Set(shares.map(s => s.student))];
    const students = await Student.find({ _id: { $in: studentIds } }).lean();

    // Preparar operaciones de actualización en bulk
    const bulkOps = shares.map(share => {
      const student = students.find(s => s._id.equals(share.student));
      const baseAmount = student && student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;
      const correctedAmount = Math.round(baseAmount * 1.1); // Aplicar recargo del 10%

      return {
        updateOne: {
          filter: { _id: share._id },
          update: { amount: correctedAmount, updatedAt: DateTime.now().toJSDate() }
        }
      };
    });

    // Ejecutar actualización en bulk
    await Share.bulkWrite(bulkOps);
    logger.info({ updatedCount: bulkOps.length }, 'Cuotas en estado Vencido corregidas correctamente');
  } catch (error) {
    logger.error({ error: error.message }, 'Error al corregir cuotas en estado Vencido');
    throw error;
  }
};

// Ejecutar el script inmediatamente
fixVencidoShares().then(() => {
  logger.info('Script de corrección finalizado');
  process.exit(0);
}).catch(error => {
  logger.error({ error: error.message }, 'Error en el script de corrección');
  process.exit(1);
});