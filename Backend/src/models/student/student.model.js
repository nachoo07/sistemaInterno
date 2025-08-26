import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  cuil: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (v) => /^\d{10,11}$/.test(v),
      message: 'CUIL debe contener 10 u 11 dígitos.',
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
  guardianName: {
    type: String,
    trim: true,
  },
  guardianPhone: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^\d{10,15}$/.test(v),
      message: 'El número de teléfono del tutor debe tener entre 10 y 15 dígitos.',
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
    default: '',
    validate: {
      validator: (v) => !v || /\S+@\S+\.\S+/.test(v),
      message: 'El formato del correo electrónico es inválido.',
    },
  },
  state: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo',
  },
  profileImage: {
    type: String,
    trim: true,
    default: 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg',
  },
  hasSiblingDiscount: {
    type: Boolean,
    default: false,
  },
  league: {
    type: String,
    enum: ['Si', 'No'], // Mantenemos el enum para valores válidos
    required: false,    // No es obligatorio
    default: null,      // Valor por defecto nulo
  },
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);
export default Student;