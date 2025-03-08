import Attendance from "../../models/attendance/attendance.model.js";

// Obtener todas las asistencias
export const getAllAttendances = async (req, res) => {
    try {
        const attendances = await Attendance.find();
        res.status(200).json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Registrar asistencias para una categoría en una fecha
export const createAttendance = async (req, res) => {
    const { date, category, attendance } = req.body;

    if (!date || !category || !attendance || attendance.length === 0) {
        return res.status(400).json({ message: "Missing required fields or attendance list is empty." });
    }
    try {
        let existingAttendance = await Attendance.findOne({ date, category });
        if (existingAttendance) {
            // Si ya existe, actualizar la lista de asistencia en lugar de crear un nuevo documento
            existingAttendance.attendance = attendance; // Corregido el nombre de la variable
            await existingAttendance.save();
            return res.status(200).json({ message: "Attendance updated successfully", attendance: existingAttendance });
        }
        // Crear un nuevo registro de asistencia si no existe uno previo
        const newAttendance = new Attendance({ date, category, attendance });
        await newAttendance.save();
        res.status(201).json({ message: "Attendance recorded successfully", attendance: newAttendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar una asistencia específica dentro de una categoría y fecha
export const updateAttendance = async (req, res) => {
    const { date, category, attendance } = req.body;
    try {
        // Verificar que la fecha y la categoría son válidas
        if (!date || !category) {
            return res.status(400).send('Fecha y categoría son requeridas');
        }
        // Validar que cada objeto de attendance contiene un idStudent
        attendance.forEach(student => {
            if (!student.idStudent) {
                return res.status(400).send('idStudent es requerido');
            }
        });
        // Convertir la fecha recibida a un rango dentro del mismo día
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Buscar asistencia ignorando la hora
        const updatedAttendance = await Attendance.findOneAndUpdate(
            {
                date: { $gte: startOfDay, $lte: endOfDay },
                category
            },
            { $set: { attendance } },
            { new: true }
        );
        if (!updatedAttendance) {
            return res.status(404).send('Asistencia no encontrada');
        }
        res.status(200).send('Asistencia actualizada con éxito');
    } catch (error) {
        console.error('Error en la actualización de la asistencia:', error);
        res.status(500).send('Error interno del servidor');
    }
};

// Eliminar una asistencia completa por fecha y categoría
export const deleteAttendance = async (req, res) => {
    const { date, category } = req.query;
    try {
        const attendance = await Attendance.findOneAndDelete({ date, category });
        if (!attendance) {
            return res.status(404).json({ message: "No attendance record found to delete." });
        }
        res.status(200).json({ message: "Attendance successfully deleted." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};