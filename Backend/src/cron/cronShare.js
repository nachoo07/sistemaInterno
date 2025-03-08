import cron from "node-cron";
import { createPendingShares } from "../logic/share.logic.js";
import { updateShares } from "./share/sharesCron.js";


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

//Cron job diario para actualizar montos y estados a las 00:00
/*cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando cron job para actualizar montos y estados de cuotas...');
    try {
      
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const config = await Config.findOne({ key: 'cuotaBase' });
      const cuotaBase = config ? config.value : 30000;
  
      const shares = await Share.find({ state: 'Pendiente' });
      for (let share of shares) {
        const student = await Student.findById(share.student);
        const baseAmount = student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;
  
        let newAmount = baseAmount;
        if (currentDay > 20) {
          newAmount = baseAmount * 1.2; // +20%
          share.state = 'Vencido';
        } else if (currentDay > 10) {
          newAmount = baseAmount * 1.1; // +10%
          share.state = 'Vencido';
        }
  
        share.amount = Math.round(newAmount);
        await share.save();
      }
  
      console.log('Montos y estados de cuotas actualizados correctamente');
    } catch (error) {
      console.error('Error al ejecutar el cron job de actualización:', error);
    }
  });
  
  console.log("Cron job configurado para actualizar montos y estados diariamente a las 00:00");*/



cron.schedule('0 0 * * *', async () => {
  try {
    await updateShares(); // Sin parámetro, usa new Date()
    console.log('Montos y estados de cuotas actualizados correctamente');
  } catch (error) {
    console.error('Error al ejecutar el cron job de actualización:', error);
  }
});
console.log("Cron job configurado para actualizar montos y estados diariamente a las 00:00");



