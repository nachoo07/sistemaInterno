import User from "../../models/users/user.model.js";
import bcrypt from 'bcryptjs';
import sanitize from 'mongo-sanitize';
import pino from 'pino';
const logger = pino();

export const getAllUsers = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const users = await User.find()
      .select('name mail role state lastLogin')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.status(200).json(users.length ? users : { message: "No hay usuarios disponibles" });
  } catch (error) {
    logger.error({ error: error.message }, 'Error al obtener usuarios');
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  console.log('Cuerpo de la solicitud:', req.body);
  const { name, mail, password, role } = sanitize(req.body);
  console.log('Campos sanitizados:', { name, mail, password, role });

  if (!name || !mail || !password || !role) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      mail,
      password: hashedPassword,
      role
    });
    await newUser.save();
    logger.info({ userId: newUser._id }, 'Usuario creado');
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: { name: newUser.name, mail: newUser.mail, role: newUser.role }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error al crear usuario');
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = sanitize(req.params);
  const { name, mail, role, state } = sanitize(req.body);

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (name) user.name = name;
    if (mail) user.mail = mail;
    if (role) user.role = role;
    if (typeof state === 'boolean') user.state = state;

    await user.save();
    logger.info({ userId: id }, 'Usuario actualizado');
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: { name: user.name, mail: user.mail, role: user.role, state: user.state }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error al actualizar usuario');
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = sanitize(req.params);

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    logger.info({ userId: id }, 'Usuario eliminado');
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error al eliminar usuario');
    next(error);
  }
};

export const updateUserState = async (req, res) => {
  const { userId } = sanitize(req.params);
  const { state } = sanitize(req.body);

  if (typeof state !== 'boolean') {
    return res.status(400).json({ message: 'El estado debe ser un booleano' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    user.state = state;
    await user.save();
    logger.info({ userId, state }, 'Estado de usuario actualizado');
    res.status(200).json({
      message: `Estado del usuario actualizado a ${state ? 'activo' : 'inactivo'}`,
      user: { id: user._id, name: user.name, state: user.state }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error al actualizar estado de usuario');
    res.status(500).json({ message: 'Error al actualizar estado de usuario' });
  }
};