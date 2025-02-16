import Share from '../../models/share/share.model.js';


// Obtener todas las cuotas
export const getAllShares = async (req, res) => {
    try {
        const shares = await Share.find()
            .populate({
                path: 'student',
                select: 'name lastName' // Trae solo el nombre y apellido del estudiante
            });

        if (shares.length === 0) {
            return res.status(200).json({ message: "No hay cuotas disponibles" });
        }

        res.status(200).json(shares);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Crear una nueva cuota
export const createShare = async (req, res) => {
    const { student, date,  amount, paymentmethod, paymentdate } = req.body;
    // Validaciones de los campos obligatorios

    if (!student || !date || amount == null ) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

    try {
         // Verificar si ya hay fecha de pago
         const cuotaState = paymentdate ? 'Pagado' : 'Pendiente';
         
        const newShare = await Share.create({
            student,
            date,
            amount,
            paymentmethod,
            paymentdate,
            state: cuotaState  // Establecer el estado basado en la fecha de pago
        });

        const savedShare = await newShare.save();
        res.status(201).json({
            message: "La cuota se agregó exitosamente",
            share: savedShare
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al crear la cuota", error: error.message });
    }
};

// Eliminar una cuota por su ID
export const deleteShare = async (req, res) => {
    try {
        const share = await Share.findByIdAndDelete(req.params.id);

        if (!share) return res.status(404).json({ message: 'Cuota no encontrada' });

        res.json({ message: 'Cuota eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para actualizar una cuota
export const updateShare = async (req, res) => {
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

        // Actualizar los datos de la cuota con la nueva información
        share.paymentdate = paymentdate;
        share.amount = amount;
        share.paymentmethod = paymentmethod;
       

        // Cambiar el estado automáticamente según la lógica:
        if (paymentdate) {
            // Si se registró un pago, se establece el estado como 'Pagado'
            share.state = 'Pagado';
        } else {
            const currentDate = new Date();
            const cuotaDate = new Date(share.date); // La fecha que corresponde a la cuota

            // Lógica para cambiar el estado según el día de la cuota:
            if (cuotaDate.getDate() > 10) {
                // Si es después del día 10, el estado pasa a 'Vencido'
                share.state = 'Vencido';
            } else {
                // Si es antes del día 10, el estado sigue siendo 'Pendiente'
                share.state = 'Pendiente';
            }
        }

        // Guardar la cuota actualizada en la base de datos
        await share.save();

        // Responder con éxito y los datos de la cuota actualizada
        res.status(200).json({ message: 'Cuota actualizada correctamente.', share });

    } catch (error) {
        console.error('Error al actualizar cuota:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener una cuota por su ID
export const getShareById = async (req, res) => {
    try {
        const share = await Share.findById(req.params.id)
            .populate({
                path: 'student',
                select: 'name lastName' // Trae solo el nombre y apellido
            });

        if (!share) return res.status(404).json({ message: 'Cuota no encontrada' });

        res.json(share);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener cuotas por estudiante
export const getSharesByStudent = async (req, res) => {
    try {
        const shares = await Share.find({ student: req.params.studentId })
            .populate({
                path: 'student',
                select: 'name lastName' // Trae solo el nombre y apellido
            });

        if (shares.length === 0) {
            return res.status(200).json({ message: "No hay cuotas disponibles para este estudiante" });
        }

        res.status(200).json(shares);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSharesByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const shares = await Share.find({
            paymentdate: {
                $gte: startDate,
                $lt: endDate
            }
        }).populate({
            path: 'student',
            select: 'name lastName' // Trae solo el nombre y apellido del estudiante
        });

        if (shares.length === 0) {
            return res.status(200).json({ message: "No hay cuotas disponibles para esta fecha" });
        }

        res.status(200).json(shares);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSharesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);

        const shares = await Share.find({
            paymentdate: {
                $gte: start,
                $lt: end
            }
        }).populate({
            path: 'student',
            select: 'name lastName' // Trae solo el nombre y apellido del estudiante
        });

        if (shares.length === 0) {
            return res.status(200).json({ message: "No hay cuotas disponibles para este rango de fechas" });
        }

        res.status(200).json(shares);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};