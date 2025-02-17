import Student from '../../models/student/student.model.js';

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
    const { 
        name, 
        lastName,
        cuil, 
        birthDate, 
        address, 
        motherName, 
        fatherName, 
        motherPhone, 
        fatherPhone, 
        category, 
        mail, 
        state, 
        fee, 
        comment,
        profileImage 
    } = req.body;

    // Validaciones de los campos obligatorios
    if (!name || !cuil || !birthDate || !address || !motherName || !fatherName || !motherPhone || !fatherPhone || !category || !mail ) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }


    try {

        const studentData = { ...req.body };
        
        // Convertir URL de Google Drive si existe
        if (studentData.profileImage) {
            studentData.profileImage = validateAndConvertGoogleDriveUrl(studentData.profileImage);
        }

        const newStudent = await Student.create({
            name,
            lastName,
            cuil,
            birthDate,
            address,
            motherName,
            fatherName,
            motherPhone,
            fatherPhone,
            category,
            mail,
            state,
            fee,
            comment,
            profileImage
        });

        const savedStudent = await newStudent.save();
        res.status(201).json({
            message: "El estudiante se agregó exitosamente",
            student: savedStudent
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al crear el estudiante", error: error.message });
    }
};

// Eliminar un estudiante por su ID
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });

        res.json({ message: 'Estudiante eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un estudiante por su ID
export const updateStudent = async (req, res) => {
    try {

        const updateData = { ...req.body };
        
        // Convertir URL de Google Drive si existe
        if (updateData.profileImage) {
            updateData.profileImage = validateAndConvertGoogleDriveUrl(updateData.profileImage);
        }
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });

        res.json({
            message: "El estudiante fue actualizado correctamente",
            student
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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


export const validateAndConvertGoogleDriveUrl = (url) => {
    if (!url) return null;
    
    // Validar si es una URL de Google Drive
    const drivePattern = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;
    const match = url.match(drivePattern);
    
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url;
};