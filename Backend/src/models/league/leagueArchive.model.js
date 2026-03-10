import mongoose from 'mongoose';

const leagueArchiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // Evitamos nombres de torneo duplicados (ej: dos "Apertura 2024")
  },
  year: {
    type: Number,
    min: 2000,
    max: 2100,
  },
  semester: {
    type: Number,
    enum: [1, 2],
  },
  periodStart: {
    type: Date,
  },
  periodEnd: {
    type: Date,
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now, // Fecha de cierre de temporada
  },
  // Guardamos una "foto" de los alumnos que jugaron
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Referencia útil, pero guardamos datos por si se borra
      },
      name: { type: String, required: true },
      lastName: { type: String, required: true },
      cuil: { type: String, required: true },
      category: { type: String, required: true },
      state: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo',
      },
      leagueAtClose: {
        type: String,
        enum: ['Si', 'No', 'Sin especificar'],
        default: 'Sin especificar',
      },
      playedLeague: {
        type: Boolean,
        default: false,
      }
    }
  ],
  totalStudents: {
    type: Number,
    default: 0
  },
  totalPlayers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

leagueArchiveSchema.index(
  { year: 1, semester: 1 },
  {
    unique: true,
    partialFilterExpression: {
      year: { $exists: true },
      semester: { $exists: true }
    }
  }
);

const LeagueArchive = mongoose.model('LeagueArchive', leagueArchiveSchema);
export default LeagueArchive;