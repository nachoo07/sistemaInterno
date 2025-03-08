import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (req, res) => {
  const { recipients, subject, message } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !subject || !message) {
    return res.status(400).json({ message: 'Faltan campos requeridos o recipients no es un arreglo válido' });
  }

  try {
    const mailOptions = {
      from: `"Yo Claudio" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject,
      html: message,

    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correos enviados exitosamente' });
  } catch (error) {
    console.error('Error enviando correos:', error);
    res.status(500).json({ message: 'Error al enviar correos', error: error.message });
  }
};