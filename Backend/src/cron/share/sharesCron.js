import Share from "../../models/share/share.model.js";
import Student from "../../models/student/student.model.js";
import Config from "../../models/base/config.model.js";

// Función reutilizable para actualizar cuotas
async function updateShares() {
  const currentDate = new Date();
  console.log(`Ejecutando actualización de montos y estados de cuotas con fecha: ${simulatedDate.toISOString().split('T')[0]}...`);
  try {
    const currentDay = currentDate.getDate();
    const config = await Config.findOne({ key: 'cuotaBase' });
    if (!config) throw new Error('No se encontró la configuración de cuotaBase');
    const cuotaBase = config ? config.value : 30000;

    const shares = await Share.find({ $or: [{ state: 'Pendiente' }, { state: 'Vencido' }] });
    console.log('Cuotas pendientes encontradas:', shares.map(s => ({
      _id: s._id,
      date: s.date,
      amount: s.amount,
      state: s.state
    })));

    for (let share of shares) {
      const student = await Student.findById(share.student);
      if (!student) {
        console.warn(`Estudiante no encontrado para cuota ${share._id}, usando cuota base sin descuento`);
      }
      const baseAmount = student && student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;

      let newAmount = baseAmount;
      if (currentDay > 20) {
        newAmount = baseAmount * 1.2; // +20%
        share.state = 'Vencido';
      } else if (currentDay > 10) {
        newAmount = baseAmount * 1.1; // +10%
        share.state = 'Vencido';
      } else {
        newAmount = baseAmount; // Sin aumento
        share.state = 'Pendiente'; // Vuelve a "Pendiente" si el día es <= 10
      }

      if (share.amount !== Math.round(newAmount) || share.state !== share.state) {
        share.amount = Math.round(newAmount);
        await share.save();
        console.log(`Cuota actualizada: ${share._id}, Monto: ${share.amount}, Estado: ${share.state}`);
      }
    }

    console.log('Montos y estados de cuotas actualizados correctamente');
  } catch (error) {
    console.error('Error al ejecutar la actualización:', error);
  }
}

export { updateShares };