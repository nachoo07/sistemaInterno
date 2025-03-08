import Notification from '../../models/notification/notification.model.js';

// Obtener todas las notificaciones
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una notificación
export const createNotification = async (req, res) => {
  const { type, message, date } = req.body;

  if (!type || !message || !date) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  try {
    const notificationData = {
      type,
      message,
      date: new Date(date),
      expirationDate: new Date(date),
    };
    notificationData.expirationDate.setDate(notificationData.expirationDate.getDate() + 1); // Expira al día siguiente
    const notification = new Notification(notificationData);
    await notification.save();
    res.status(201).json({ message: 'Notificación creada exitosamente', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una notificación
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notificación no encontrada' });
    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};