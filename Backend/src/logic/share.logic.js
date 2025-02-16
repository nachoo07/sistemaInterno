import Share from "../models/share/share.model.js";
import Student from "../models/student/student.model.js";

export const createPendingShares = async () => {
    try {
        // Obtener todos los estudiantes
        const students = await Student.find();

        // Crear cuota pendiente para cada estudiante
        for (let student of students) {
            // Verificar si el estudiante está activo
            if (student.state !== 'Activo') {
                console.log(`El estudiante ${student._id} está inactivo, no se crea cuota.`);
                continue; // Saltar a la siguiente iteración si el estudiante está inactivo
            }
    // Verificar si ya existe una cuota para el mes actual
            const existingShare = await Share.findOne({
                student: student._id,
                date: new Date().toISOString().slice(0, 7)  // Asegura que no se creen duplicados
            });

            if (!existingShare) {
                const newShare = new Share({
                    student: student._id,
                    date: new Date(),  // Usa la fecha del día actual
                    amount: 0,
                    state: 'Pendiente',
                    paymentmethod: null,
                    paymentdate: null,
                });

                await newShare.save();
                console.log(`Cuota creada para el estudiante ${student._id}`);
            } else {
                console.log(`Ya existe una cuota para el estudiante ${student._id} en este mes`);
            }
        }
    } catch (error) {
        console.error('Error al crear cuotas:', error);
    }
};