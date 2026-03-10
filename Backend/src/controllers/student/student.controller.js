import Student from '../../models/student/student.model.js';
import Share from '../../models/share/share.model.js';
import Attendance from '../../models/attendance/attendance.model.js';
import Payment from '../../models/payment/payment.model.js';
import sanitize from 'mongo-sanitize';
import pino from 'pino';
import { validationResult } from 'express-validator';
import {
    sendBadRequest,
    sendInternalServerError,
    sendNotFound
} from '../_shared/controller.utils.js';
import { 
    uploadToCloudinary, 
    downloadImage, 
    extractPublicId, 
    deleteFromCloudinary, 
    getCloudinarySignature 
} from '../../utils/cloudinary/cloudinary.js';

import { 
    validateStudentData, 
    normalizeDate, 
    createUTCDate 
} from '../../validators/student/student.validator.js';

const logger = pino({ level: 'info' });

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendBadRequest(res, 'Datos inválidos', { errors: errors.array() });
  }
  return null;
};

export const getAllStudents = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const { state } = sanitize(req.query);
    const filters = {};

    if (state) {
      filters.state = state;
    }

    const students = await Student.find(filters).sort({ lastName: 1, name: 1 }).lean();
    res.status(200).json(students);
  } catch (error) {
    logger.error({ error: error.message }, 'Error al obtener estudiantes');
    return sendInternalServerError(res, 'Error al obtener estudiantes');
  }
};

export const getStudentById = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const { id } = sanitize(req.params);
  try {
    const student = await Student.findById(id).lean();
    if (!student) return sendNotFound(res, 'Estudiante no encontrado');
    res.status(200).json(student);
  } catch (error) {
    return sendInternalServerError(res, 'Error al obtener estudiante');
  }
};

export const createStudent = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const body = sanitize(req.body);

    const dataError = validateStudentData(body);
    if (dataError) return sendBadRequest(res, dataError, { error: dataError });

    const normalizedBirthDate = normalizeDate(body.birthDate);
    const utcBirthDate = createUTCDate(normalizedBirthDate);
    if (!utcBirthDate) {
      return sendBadRequest(res, 'Fecha de nacimiento inválida');
    }

    const existingStudent = await Student.findOne({ cuil: body.cuil });
    if (existingStudent) return sendBadRequest(res, 'El DNI ya está registrado', { error: 'El DNI ya está registrado' });

    // 2. Manejo de Imagen
    let finalProfileImage = body.profileImage || 'https://i.pinimg.com/736x/24/f2/25/24f22516ec47facdc2dc114f8c3de7db.jpg';
    
    if (req.file) {
      try {
        finalProfileImage = await uploadToCloudinary({ buffer: req.file.buffer, mimetype: req.file.mimetype }, 'students', `student_${body.cuil}`);
      } catch (e) { return sendBadRequest(res, e.message, { error: e.message }); }
    } else if (body.profileImage && !body.profileImage.includes('pinimg')) {
        // Intento de descarga si es URL externa
        try {
           const { buffer, mimetype } = await downloadImage(body.profileImage);
           finalProfileImage = await uploadToCloudinary({ buffer, mimetype }, 'students', `student_${body.cuil}`);
        } catch (e) { logger.warn('Usando URL original por fallo en descarga'); }
    }

    // 3. Crear Estudiante
    const newStudent = new Student({
      ...body,
      birthDate: utcBirthDate,
      state: body.state || 'Activo',
      profileImage: finalProfileImage,
      league: body.league || 'Sin especificar',
    });

    const savedStudent = await newStudent.save();
    logger.info({ studentId: savedStudent._id }, 'Estudiante creado');
    res.status(201).json({ message: 'Estudiante creado exitosamente', student: savedStudent });

  } catch (error) {
    logger.error({ error: error.message }, 'Error al crear estudiante');
    return sendInternalServerError(res, 'Error al crear estudiante');
  }
};

export const updateStudent = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const { id } = sanitize(req.params);
    const body = sanitize(req.body);

    // 1. Validaciones
    const validationError = validateStudentData(body);
    if (validationError) return sendBadRequest(res, validationError, { error: validationError });

    const normalizedBirthDate = normalizeDate(body.birthDate);
    const utcBirthDate = createUTCDate(normalizedBirthDate);
    if (!utcBirthDate) {
      return sendBadRequest(res, 'Fecha de nacimiento inválida', { error: 'Fecha de nacimiento inválida' });
    }

    const existingStudent = await Student.findById(id);
    if (!existingStudent) return sendNotFound(res, 'Estudiante no encontrado', { error: 'Estudiante no encontrado' });

    const duplicateStudent = await Student.findOne({ cuil: body.cuil, _id: { $ne: id } });
    if (duplicateStudent) return sendBadRequest(res, 'El DNI ya está registrado en otro estudiante', { error: 'El DNI ya está registrado en otro estudiante' });

    // 2. Manejo de Imagen
    if (req.file || (body.profileImage && body.profileImage !== existingStudent.profileImage)) {
      // Borrar anterior
      if (existingStudent.profileImage && !existingStudent.profileImage.includes('pinimg.com')) {
          const publicId = extractPublicId(existingStudent.profileImage);
          await deleteFromCloudinary(publicId);
      }
      
      // Subir nueva
      if (req.file) {
          body.profileImage = await uploadToCloudinary({ buffer: req.file.buffer, mimetype: req.file.mimetype }, 'students', `student_${body.cuil}`);
      } else if (body.profileImage) {
          try {
             const { buffer, mimetype } = await downloadImage(body.profileImage);
             body.profileImage = await uploadToCloudinary({ buffer, mimetype }, 'students', `student_${body.cuil}`);
          } catch (e) { logger.warn('Fallo subida URL, manteniendo referencia'); }
      }
    }

    const updates = {
        ...body,
      league: body.league || 'Sin especificar',
      birthDate: utcBirthDate
    };

    const student = await Student.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.status(200).json({ message: 'Estudiante actualizado exitosamente', student });

  } catch (error) {
    logger.error({ error: error.message }, 'Error al actualizar');
    return sendInternalServerError(res, 'Error al actualizar estudiante');
  }
};

export const deleteStudent = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const { id } = sanitize(req.params);
  try {
    const student = await Student.findById(id);
    if (!student) return sendNotFound(res, 'Estudiante no encontrado');

    if (student.profileImage && !student.profileImage.includes('pinimg.com')) {
       const publicId = extractPublicId(student.profileImage);
       await deleteFromCloudinary(publicId);
    }

    await Share.deleteMany({ student: id });
    await Payment.deleteMany({ studentId: id });
    await Attendance.updateMany({}, { $pull: { attendance: { idStudent: id } } });
    await Attendance.deleteMany({ attendance: [] });
    
    await Student.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Estudiante eliminado' });
  } catch (error) {
    return sendInternalServerError(res, 'Error al eliminar estudiante');
  }
};

export const generateCloudinarySignature = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const signatureData = getCloudinarySignature();
    res.status(200).json(signatureData);
  } catch (error) {
    return sendInternalServerError(res, 'Error al generar firma');
  }
};
