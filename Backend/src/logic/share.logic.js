import Share from "../models/share/share.model.js";
import Student from "../models/student/student.model.js";
import Config from "../models/base/config.model.js";
import nodemailer from 'nodemailer';


// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar correo
const sendCuotaEmail = async (student, cuota) => {
  if (student.state === 'Inactivo') {
    console.log(`No se envía correo a ${student.name} ${student.lastName}: estudiante inactivo.`);
    return;
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const cuotaMonth = monthNames[cuota.date.getMonth()];
  const cuotaYear = cuota.date.getFullYear();

  // Calcular los montos con incrementos
  const baseAmount = cuota.amount;
  const amountWith10Percent = baseAmount * 1.1;
  const amountWith20Percent = baseAmount * 1.2;

  // Mensaje en formato HTML
  const message = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Cuota</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 20px;">
                <!-- Header con logo -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <h1 style="color: #ff1493; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">
                        ESTIMADO/A PADRE/MADRE DE ${student.name.toUpperCase()} ${student.lastName.toUpperCase()}.
                      </h1>
                    </td>
                    <td align="right">
                      <img src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png" alt="Logo" style="width: 100px; height: auto;" />
                    </td>
                  </tr>
                </table>

                <!-- Contenido -->
                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                  Le informamos que se ha generado una nueva cuota para el mes de ${cuotaMonth} ${cuotaYear}.
                </p>
                <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                  - <strong>Monto:</strong> $${baseAmount.toLocaleString('es-ES')}
                </p>

                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                  <strong>Política de incrementos:</strong><br>
                  - Si abona entre el día 1 y 10: $${baseAmount.toLocaleString('es-ES')} (sin incremento).<br>
                  - Si abona entre el día 11 y 20: $${amountWith10Percent.toLocaleString('es-ES')} (+10%).<br>
                  - Si abona después del día 21: $${amountWith20Percent.toLocaleString('es-ES')} (+20%).
                </p>

                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                  Por favor, realice el pago a la brevedad para evitar incrementos.
                </p>

                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                  Saludos cordiales,<br>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"Yo Claudio" <${process.env.EMAIL_USER}>`,
    to: student.mail,
    subject: `Nueva cuota generada para ${student.name} ${student.lastName} - ${cuotaMonth} ${cuotaYear}`,
    html: message, // Cambiamos de "text" a "html"
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${student.mail} para la cuota de ${cuotaMonth} ${cuotaYear}`);
  } catch (error) {
    console.error(`Error enviando correo a ${student.mail}:`, error);
  }
};


export const createPendingShares = async () => { // Sin parámetro de simulación
  try {
    const students = await Student.find();
    const config = await Config.findOne({ key: 'cuotaBase' });
    const cuotaBase = config ? config.value : 30000;

    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    for (let student of students) {
      if (student.state !== 'Activo') {
        console.log(`El estudiante ${student._id} está inactivo, no se crea cuota ni se envía correo.`);
        continue; // Salta al siguiente estudiante si está inactivo
      }
      const existingShare = await Share.findOne({
        student: student._id,
        date: monthStart
      });

      if (!existingShare) {
        const amount = student.hasSiblingDiscount ? cuotaBase * 0.9 : cuotaBase;
        const newShare = new Share({
          student: student._id,
          date: monthStart, // Primer día del mes actual
          amount: Math.round(amount),
          state: 'Pendiente',
          paymentmethod: null,
          paymentdate: null,
        });

        await newShare.save();
        console.log(`Cuota creada para el estudiante ${student._id} con monto $${newShare.amount} para ${monthStart.toISOString().slice(0, 7)}`);

        // Enviar correo al padre/madre
        if (student.mail) {
          await sendCuotaEmail(student, newShare);
        } else {
          console.log(`No se envió correo a ${student.name} ${student.lastName}: falta email`);
        }
      } else {
        console.log(`Ya existe una cuota para el estudiante ${student._id} en ${monthStart.toISOString().slice(0, 7)}`);
      }
    }
  } catch (error) {
    console.error('Error al crear cuotas:', error);
  }
};


