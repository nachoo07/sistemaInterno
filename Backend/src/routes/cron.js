import express from "express";
import { createPendingShares } from "../logic/share.logic.js";
import Share from '../models/share/share.model.js';
const router = express.Router();

router.post('/api/test-create-shares', async (req, res) => {
    try {
        await createPendingShares();
        res.status(200).json({ message: "Cuotas creadas correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear cuotas", error: error.message });
    }
});

/*router.put('/api/shares/:id', async (req, res) => {
    try {
      const { id } = req.params; // ID de la cuota
      const { paymentdate, amount, paymentmethod } = req.body;
  
      // Validar datos requeridos
      if (!paymentdate || !amount || !paymentmethod) {
       return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
      }
  
      const share = await Share.findById(id);
      if (!share) {
        return res.status(404).json({ message: 'Cuota no encontrada.' });
      }
  
      // Actualizar datos de la cuota
      share.paymentdate = paymentdate;
      share.amount = amount;
      share.paymentmethod = paymentmethod;
  
      // Lógica de cambio de estado
      if (paymentdate) {
        share.state = 'Pagado'; // El estado siempre cambia a 'Pagado' cuando se registra un pago
      } else {
        const currentDate = new Date();
        const cuotaDate = new Date(share.date); // La fecha que corresponde a la cuota
  
        // Verificar si el día de la cuota ya pasó para cambiar el estado
        if (cuotaDate.getDate() > 10) {
          share.state = 'Vencido';
        } else {
          share.state = 'Pendiente';
        }
      }
  
      await share.save();
      res.status(200).json({ message: 'Cuota actualizada correctamente.', share });
    } catch (error) {
      console.error('Error al actualizar cuota:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });*/

export default router;