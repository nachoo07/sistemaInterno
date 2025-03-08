import Config from '../../models/base/config.model.js';

// Obtener una configuración por clave
export const getConfig = async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (!config) return res.status(404).json({ message: 'Configuración no encontrada' });
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar o crear una configuración
export const setConfig = async (req, res) => {
  const { key, value } = req.body;
  try {
    const config = await Config.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true } // Crea si no existe
    );
    res.status(200).json({ message: 'Configuración actualizada', config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};