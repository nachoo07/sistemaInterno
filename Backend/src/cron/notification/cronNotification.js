import cron from 'node-cron';
import Notification from '../../models/notification/notification.model.js';

cron.schedule('0 0 * * *', async () => {
  console.log('Ejecutando cron job para eliminar notificaciones vencidas...');
  try {
    const currentDate = new Date();
    await Notification.deleteMany({
      expirationDate: { $lte: currentDate },
    });
    console.log('Notificaciones vencidas eliminadas correctamente');
  } catch (error) {
    console.error('Error al eliminar notificaciones vencidas:', error);
  }
});

console.log('Cron job configurado para eliminar notificaciones vencidas diariamente a las 00:00');