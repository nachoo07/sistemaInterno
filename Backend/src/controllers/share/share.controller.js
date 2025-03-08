import Share from '../../models/share/share.model.js';
import Student from '../../models/student/student.model.js';
import Config from '../../models/base/config.model.js'
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
    const { student, date, amount, paymentmethod, paymentdate } = req.body;

    if (!student || !date || amount == null) {
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
        const { paymentdate, paymentmethod } = req.body;
        if (!paymentdate || !paymentmethod) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        const share = await Share.findById(id);
        if (!share) {
            return res.status(404).json({ message: 'Cuota no encontrada.' });
        }
        const student = await Student.findById(share.student);
        const config = await Config.findOne({ key: 'cuotaBase' });
        const cuotaBase = config ? config.value : 30000; // Default $30,000
        const baseAmount = student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase; // 10% descuento

        const currentDate = new Date(paymentdate);
        let adjustedAmount = baseAmount;

        if (currentDate.getDate() > 20) {
            adjustedAmount = baseAmount * 1.2; // +20%
        } else if (currentDate.getDate() > 10) {
            adjustedAmount = baseAmount * 1.1; // +10%
        }

        share.paymentdate = paymentdate;
        share.amount = Math.round(adjustedAmount);
        share.paymentmethod = paymentmethod;
        share.state = 'Pagado';

        await share.save();
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

// Nuevo endpoint para obtener el estado prioritario de todos los estudiantes
export const getStudentsWithShareStatus = async (req, res) => {
    try {
        const students = await Student.aggregate([
            {
                $lookup: {
                    from: "shares",
                    localField: "_id",
                    foreignField: "student",
                    as: "shares"
                }
            },
            {
                $project: {
                    name: 1,
                    lastName: 1,
                    status: {
                        $cond: [
                            { $anyElementTrue: { $map: { input: "$shares", in: { $eq: ["$$this.state", "Vencido"] } } } },
                            "Vencido",
                            {
                                $cond: [
                                    { $anyElementTrue: { $map: { input: "$shares", in: { $eq: ["$$this.state", "Pendiente"] } } } },
                                    "Pendiente",
                                    {
                                        $cond: [
                                            { $anyElementTrue: { $map: { input: "$shares", in: { $eq: ["$$this.state", "Pagado"] } } } },
                                            "Pagado",
                                            "Sin cuotas"
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ]);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los estados de los estudiantes", error: error.message });
    }
};

// Nuevo endpoint para actualizar cuotas pendientes masivamente
export const updatePendingShares = async (req, res) => {
    try {
        const config = await Config.findOne({ key: 'cuotaBase' });
        const cuotaBase = config ? config.value : 30000; // Default $30,000
        const currentDate = new Date(); // Usamos fecha real, no simulada
        const currentDay = currentDate.getDate();
        if (currentDay > 10) {
            return res.status(400).json({ message: 'No se puede actualizar cuotas después del día 10.' });
        }
        // Definir el rango del mes actual
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const shares = await Share.find({
            state: 'Pendiente',
            date: { $gte: startOfMonth, $lte: endOfMonth } // Filtrar por rango de fechas
        });
        for (let share of shares) {
            const student = await Student.findById(share.student);
            const baseAmount = student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;

            share.amount = Math.round(baseAmount); // Solo aplica baseAmount, sin incrementos (día <= 10)
            await share.save();
        }
        res.status(200).json({ message: 'Cuotas pendientes actualizadas correctamente' });
    } catch (error) {
        console.error('Error al actualizar cuotas pendientes:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};