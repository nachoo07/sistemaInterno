import nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import pino from 'pino';
const logger = pino();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (req, res) => {
  const { recipients, subject, message, attachment, emails } = req.body;

  // Formato anterior: un solo correo a múltiples destinatarios
  if (recipients && Array.isArray(recipients) && subject && message) {
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'El arreglo de destinatarios no puede estar vacío' });
    }

    const validEmails = recipients.every(email => /\S+@\S+\.\S+/.test(email));
    if (!validEmails) {
      return res.status(400).json({ message: 'Uno o más correos son inválidos' });
    }

    if (recipients.length > 100) {
      return res.status(400).json({ message: 'Máximo 100 destinatarios por solicitud' });
    }

    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'img'],
      allowedAttributes: { 'img': ['src', 'alt'] },
    });

    const mailOptions = {
      from: `"Yo Claudio" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject,
      html: sanitizedMessage,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: 'comprobante.png',
          content: Buffer.from(attachment, 'base64'),
          contentType: 'image/png',
        },
      ];
    }

    try {
      await transporter.sendMail(mailOptions);
      logger.info({ recipients: recipients.length, subject }, 'Correos enviados');
      return res.status(200).json({ message: 'Correos enviados exitosamente' });
    } catch (error) {
      logger.error({ error: error.message, recipients }, 'Error al enviar correos');
      return res.status(500).json({ message: 'Error al enviar correos', error: error.message });
    }
  }

  // Nuevo formato: múltiples correos personalizados
  if (emails && Array.isArray(emails)) {
    if (emails.length === 0) {
      return res.status(400).json({ message: 'El arreglo de correos no puede estar vacío' });
    }

    if (emails.length > 100) {
      return res.status(400).json({ message: 'Máximo 100 correos por solicitud' });
    }

    const failedEmails = [];

    for (const email of emails) {
      const { recipient, subject, message } = email;

      if (!recipient || !/\S+@\S+\.\S+/.test(recipient) || !subject || !message) {
        failedEmails.push({ recipient: recipient || 'desconocido', error: 'Datos inválidos' });
        continue;
      }

      const sanitizedMessage = sanitizeHtml(message, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'img'],
        allowedAttributes: { 'img': ['src', 'alt'] },
      });

      const mailOptions = {
        from: `"Yo Claudio" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject,
        html: sanitizedMessage,
      };

      try {
        await transporter.sendMail(mailOptions);
        logger.info({ recipient, subject }, 'Correo enviado');
      } catch (error) {
        logger.error({ error: error.message, recipient }, 'Error al enviar correo');
        failedEmails.push({ recipient, error: error.message });
      }
    }

    if (failedEmails.length > 0) {
      return res.status(207).json({
        message: `Se enviaron ${emails.length - failedEmails.length} de ${emails.length} correos`,
        failed: failedEmails,
      });
    }

    return res.status(200).json({ message: `Correos enviados exitosamente (${emails.length})` });
  }

  return res.status(400).json({ message: 'Formato de solicitud inválido' });
};