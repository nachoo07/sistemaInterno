import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Elimina espacios en blanco al inicio y final
    },
    lastName: {  // Campo para el apellido
        type: String,
        required: true,
        trim: true,
    },
    cuil: {
        type: String,
        required: true,
        unique: true, // Garantiza que no haya duplicados
        trim: true,
        validate: {
            validator: (v) => /^\d{10,11}$/.test(v), // Acepta 7 u 8 dígitos numéricos
            message: "CUIL debe contener 10 u 11 dígitos.",
        },
    },
    birthDate: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    motherName: {
        type: String,
        required: true,
        trim: true,
    },
    fatherName: {
        type: String,
        required: true,
        trim: true,
    },
    motherPhone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v) => /^\d{10,15}$/.test(v), // Acepta números de 10 a 15 dígitos
            message: "Mother's phone number must be between 10 and 15 digits.",
        },
    },
    fatherPhone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v) => /^\d{10,15}$/.test(v),
            message: "Father's phone number must be between 10 and 15 digits.",
        },
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    mail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: (v) => /\S+@\S+\.\S+/.test(v),
            message: "Invalid email format.",
        },
    },
    state: {
        type: String,
        enum: ['Activo', 'Inactivo'], // Valores permitidos
        default: 'Activo',
    },
    fee: {
        type: String,
        enum: ['pendiente','pagado', 'vencido'], // Valores permitidos
        default: 'pendiente',
    },
    comment: {
        type: String,
        trim: true,
    },
    profileImage: {
        type: String,
        trim: true,
        default: 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg',
        validate: {
            validator: function(v) {
                if (!v) return true;
                // Acepta URLs de Google Drive y URLs de imágenes regulares
                return /^https:\/\/(drive\.google\.com\/(file\/d\/|uc\?export=view&id=)|.*\.(?:png|jpg|jpeg|gif|svg))/.test(v);
            },
            message: "La URL de la imagen debe ser una URL válida de Google Drive o una imagen directa"
        }
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
