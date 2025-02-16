import cron from "node-cron";
import { createPendingShares } from "../logic/share.logic.js";
import Share from "../models/share/share.model.js";
// Cron job para ejecutar cada 1º de mes a las 00:00
cron.schedule('0 0 1 * *', async () => {
    console.log('Ejecutando cron job para crear cuotas pendientes...');
    try {
        await createPendingShares();
        console.log('Cuotas creadas correctamente');
    } catch (error) {
        console.error('Error al ejecutar el cron job:', error);
    }
});

console.log("Cron job configurado para el 1º de cada mes a las 00:00");

cron.schedule('0 0 11 * *', async () => {
    console.log('Ejecutando cron job para actualizar el estado de las cuotas...');
    try {
        const currentDate = new Date();
        const shares = await Share.find();

        for (let share of shares) {
            if (!share.paymentdate) {
                const cuotaDate = new Date(share.date);

                // Lógica para cambiar el estado según el día de la cuota:
                if (currentDate.getDate() > 10) {
                    // Si es después del día 10, el estado pasa a 'Vencido'
                    share.state = 'Vencido';
                } else {
                    // Si es antes del día 10, el estado sigue siendo 'Pendiente'
                    share.state = 'Pendiente';
                }

                await share.save();
            }
        }

        console.log('Estados de las cuotas actualizados correctamente');
    } catch (error) {
        console.error('Error al ejecutar el cron job:', error);
    }
});

console.log("Cron job configurado para actualizar el estado de las cuotas diariamente a las 00:00");