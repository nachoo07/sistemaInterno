import Student from '../../models/student/student.model.js';
import Share from '../../models/share/share.model.js';
import Attendance from '../../models/attendance/attendance.model.js';
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from 'cloudinary';
import sanitize from 'mongo-sanitize';
import pino from 'pino';
const logger = pino();

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

export const getAllStudents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const students = await Student.find()
      
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.status(200).json(students.length ? students : { message: "No hay estudiantes disponibles" });
  } catch (error) {
    logger.error({ error: error.message }, 'Error al obtener estudiantes');
    res.status(500).json({ message: 'Error al obtener estudiantes' });
  }
};

export const createStudent = async (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      logger.error({ error: err.message }, 'Error al subir imagen');
      return res.status(500).json({ message: 'Error al subir la imagen' });
    }

    const {
      name, lastName, cuil, birthDate, address, motherName, fatherName,
      motherPhone, fatherPhone, category, mail, state, fee, comment, hasSiblingDiscount
    } = sanitize(req.body);

    if (!name || !cuil || !birthDate || !address || !category || !mail) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
      let profileImage = 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg';
      if (req.file) {
        const result = await cloudinaryV2.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'students' }
        );
        profileImage = result.secure_url;
      }

      const newStudent = await Student.create({
        name, lastName, cuil, birthDate: new Date(birthDate), address, motherName, fatherName,
        motherPhone, fatherPhone, category, mail, state, fee, comment,
        profileImage, hasSiblingDiscount: hasSiblingDiscount || false
      });

      logger.info({ studentId: newStudent._id }, 'Estudiante creado');
      res.status(201).json({ message: "Estudiante creado exitosamente", student: newStudent });
    } catch (error) {
      logger.error({ error: error.message }, 'Error al crear estudiante');
      res.status(500).json({ message: 'Error al crear estudiante' });
    }
  });
};

export const deleteStudent = async (req, res) => {
  const { id } = sanitize(req.params);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const student = await Student.findById(id).session(session);
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    if (student.profileImage && student.profileImage !== 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg') {
      const publicId = student.profileImage.split('/').pop().split('.')[0];
      await cloudinaryV2.uploader.destroy(`students/${publicId}`);
    }

    await Share.deleteMany({ student: id }).session(session);
    await Attendance.updateMany(
      { 'attendance.idStudent': id },
      { $pull: { attendance: { idStudent: id } } }
    ).session(session);
    await Attendance.deleteMany({ attendance: { $size: 0 } }).session(session);
    await Student.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    logger.info({ studentId: id }, 'Estudiante eliminado');
    res.status(200).json({ message: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error: error.message }, 'Error al eliminar estudiante');
    res.status(500).json({ message: 'Error al eliminar estudiante' });
  } finally {
    session.endSession();
  }
};

export const updateStudent = async (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      logger.error({ error: err.message }, 'Error al subir imagen');
      return res.status(500).json({ message: 'Error al subir la imagen' });
    }

    const { id } = sanitize(req.params);
    const updates = sanitize(req.body);

    try {
      let profileImage = updates.profileImage;
      if (req.file) {
        const result = await cloudinaryV2.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'students' }
        );
        profileImage = result.secure_url;

        const oldStudent = await Student.findById(id);
        if (oldStudent.profileImage && oldStudent.profileImage !== 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg') {
          const publicId = oldStudent.profileImage.split('/').pop().split('.')[0];
          await cloudinaryV2.uploader.destroy(`students/${publicId}`);
        }
      }

      const student = await Student.findByIdAndUpdate(
        id,
        { ...updates, profileImage, hasSiblingDiscount: updates.hasSiblingDiscount || false },
        { new: true }
      ).lean();

      if (!student) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }

      logger.info({ studentId: id }, 'Estudiante actualizado');
      res.status(200).json({ message: "Estudiante actualizado exitosamente", student });
    } catch (error) {
      logger.error({ error: error.message }, 'Error al actualizar estudiante');
      res.status(500).json({ message: 'Error al actualizar estudiante' });
    }
  });
};

export const getStudentById = async (req, res) => {
  const { id } = sanitize(req.params);

  try {
    const student = await Student.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.status(200).json(student);
  } catch (error) {
    logger.error({ error: error.message }, 'Error al obtener estudiante');
    res.status(500).json({ message: 'Error al obtener estudiante' });
  }
};