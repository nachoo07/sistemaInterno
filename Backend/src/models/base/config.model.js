import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Permite números, objetos, etc.
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Config', configSchema);