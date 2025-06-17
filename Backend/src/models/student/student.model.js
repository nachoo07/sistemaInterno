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
      message: 'Guardian phone number must have between 10 and 15 digits.',
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
      message: 'Invalid email format.',
    },
  },
  state: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo',
  },
  comment: {
    type: String,
    trim: true,
    set: (value) => (value ? sanitizeHtml(value, { allowedTags: [] }) : value),
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
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);
export default Student;