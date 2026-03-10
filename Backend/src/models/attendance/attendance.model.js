import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        trim: true
        // SE ELIMINÓ EL ENUM para permitir categorías dinámicas (ej: 2013, 2025)
    },
    attendance: {
        type: [{
            idStudent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                required: true
            },
            name: {
                type: String,
                required: true,
                trim: true
            },
            lastName: {
                type: String,
                required: true,
                trim: true
            },
            present: {
                type: Boolean,
                required: false // CAMBIO: Ya no es obligatorio (permite null/undefined)
            }
        }],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'La lista de asistencia no puede estar vacía.'
        }
    }
}, { timestamps: true });

// MEJORA AUDITORÍA: Evita duplicados de fecha+categoría a nivel base de datos
attendanceSchema.index({ date: 1, category: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;