import Student from '../../models/student/student.model.js';
import Share from '../../models/share/share.model.js';
import Attendance from '../../models/attendance/attendance.model.js';
import multer from 'multer';
import cloudinary from 'cloudinary'; // Importamos Cloudinary

const cloudinaryV2 = cloudinary.v2;

// Configuración de Cloudinary
cloudinaryV2.config({
  cloud_name: 'dqhb2dkgf', // Reemplazá con tus credenciales
  api_key: '461994178437712',
  api_secret: 'X79lXf-h1riXpk0R88MdwPd9bP8'
});

// Configuración de Multer (almacenamiento en memoria, no en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Obtener todos los estudiantes
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find(); // Buscar todos los estudiantes
    if (students.length === 0) {
      return res.status(200).json({ message: "No hay estudiantes disponibles" });
    }
    res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo estudiante
export const createStudent = async (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error al subir la imagen", error: err.message });
    }
    const {
      name, lastName, cuil, birthDate, address, motherName, fatherName,
      motherPhone, fatherPhone, category, mail, state, fee, comment, hasSiblingDiscount
    } = req.body;
    if (!name || !cuil || !birthDate || !address || !category || !mail) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    try {
      let profileImage = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg';
      if (req.file) {
        const result = await cloudinaryV2.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'students' } // Aseguramos que el folder se aplique
        );
        profileImage = result.secure_url;
      }

      const newStudent = await Student.create({
        name, lastName, cuil, birthDate, address, motherName, fatherName,
        motherPhone, fatherPhone, category, mail, state, fee, comment,
        profileImage, hasSiblingDiscount: hasSiblingDiscount || false
      });

      res.status(201).json({
        message: "El estudiante se agregó exitosamente",
        student: newStudent
      });
    } catch (error) {
      console.error('Error en createStudent:', error);
      return res.status(500).json({ message: "Error al crear el estudiante", error: error.message });
    }
  });
};

// Eliminar un estudiante por su ID
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    if (student.profileImage && student.profileImage !== 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg') {
      const publicId = student.profileImage.split('/').pop().split('.')[0];
      await cloudinaryV2.uploader.destroy(`students/${publicId}`);
    }
    // Eliminar todas las cuotas asociadas al estudiante
    await Share.deleteMany({ student: req.params.id });
    // Eliminar al estudiante de los registros de asistencia
    await Attendance.updateMany(
      { 'attendance.idStudent': req.params.id }, // Busca documentos con el estudiante en el arreglo
      { $pull: { attendance: { idStudent: req.params.id } } } // Elimina los subdocumentos del arreglo
    );
    // Eliminar documentos de Attendance donde el arreglo attendance quedó vacío
    await Attendance.deleteMany({ attendance: { $size: 0 } });
    res.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteStudent:', error);
    res.status(500).json({ message: 'Error al eliminar el estudiante', error: error.message });
  }
};

// Actualizar un estudiante por su ID
export const updateStudent = async (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error al subir la imagen", error: err.message });
    }
    try {
      let profileImage = req.body.profileImage;
      if (req.file) {
        const result = await cloudinaryV2.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'students' }
        );
        profileImage = result.secure_url;
        const oldStudent = await Student.findById(req.params.id);
        if (oldStudent.profileImage && oldStudent.profileImage !== 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg') {
          const publicId = oldStudent.profileImage.split('/').pop().split('.')[0];
          await cloudinaryV2.uploader.destroy(`students/${publicId}`);
        }
      }
      const student = await Student.findByIdAndUpdate(
        req.params.id,
        { ...req.body, profileImage, profileImage, hasSiblingDiscount: req.body.hasSiblingDiscount || false },
        { new: true }
      );
      if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
      res.json({
        message: "El estudiante fue actualizado correctamente",
        student
      });
    } catch (error) {
      console.error('Error en updateStudent:', error);
      res.status(400).json({ message: error.message });
    }
  });
};

// Obtener un estudiante por su ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
