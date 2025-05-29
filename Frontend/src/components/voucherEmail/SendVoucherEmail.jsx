import { useState, useRef, useContext, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaFileInvoice } from "react-icons/fa";
import html2canvas from "html2canvas";
import { EmailContext } from "../../context/email/EmailContext";
import "./SendVoucherEmail.css";

const SendVoucherEmail = ({ student, cuota }) => {
  const [loading, setLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const voucherRef = useRef(null);
  const { sendVoucherEmail } = useContext(EmailContext);

  useEffect(() => {
    if (student && cuota && cuota.paymentdate && cuota.paymentmethod) {
      setIsDataReady(true);
    } else {
      console.warn("Datos insuficientes para generar el comprobante:", { student, cuota });
      setIsDataReady(false);
    }
  }, [student, cuota]);

  const generateVoucherImage = async () => {
    if (!isDataReady || !voucherRef.current) {
      console.error("Elemento voucherRef no encontrado o datos no listos.");
      return null;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#f8f9fa",
        width: 800,
        height: 520,
        windowWidth: 800,
        windowHeight: 520,
        dpi: 300,
      });

      const dataUrl = canvas.toDataURL("image/png");
      return dataUrl.split(",")[1];
    } catch (error) {
      console.error("Error al generar la imagen con html2canvas:", error);
      return null;
    }
  };

  const handleSendVoucher = async () => {
    setLoading(true);
    try {
      const imageBase64 = await generateVoucherImage();
      if (!imageBase64) {
        throw new Error("No se pudo generar la imagen del comprobante.");
      }
      await sendVoucherEmail(student, cuota, imageBase64);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha con zona horaria
  const formatDateWithTimezone = (date) => {
    return date.toLocaleDateString("es-ES", {
      timeZone: "America/Santiago", // Ajustado a -03 (Chile)
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!isDataReady) return null;

  const formatCuil = (cuil) => {
  if (!cuil) return "N/A";
  // Elimina caracteres no numéricos
  const cleanCuil = cuil.replace(/\D/g, '');
  // Si tiene la longitud correcta, formatea como XX-XXXXXXXX-X
  if (cleanCuil.length === 11) {
    return `${cleanCuil.substring(0, 2)}-${cleanCuil.substring(2, 10)}-${cleanCuil.substring(10)}`;
  }
  // Si no tiene el formato esperado, devuelve el valor original
  return cuil;
};


  return (
    <>
      <Button
        className="action-btn send-voucher"
        onClick={handleSendVoucher}
        disabled={loading}
      >
        <span className="btn-icon">
          <FaFileInvoice />
        </span>
      </Button>

      <div ref={voucherRef} className="voucher-container">
        {/* Encabezado */}
        <div className="voucher-header">
          <div className="voucher-header-logo">
            <img
              src="https://res.cloudinary.com/dqhb2dkgf/image/upload/v1740286370/Captura_de_pantalla_2025-02-11_a_la_s_9.29.34_p._m._bqndud.png"
              alt="Logo Escuela Yo Claudio"
              crossOrigin="anonymous"
            />
            <h1 className="voucher-header-title">Yo Claudio</h1>
          </div>
          <div className="voucher-header-right">
            <h1 className="voucher-header-comprobante">Comprobante</h1>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="voucher-content">
          {/* Información del estudiante */}
          <div className="voucher-section">
            <h3 className="voucher-section-title">Información del Estudiante</h3>
            <p className="voucher-text">
              <strong>Nombre y Apellido:</strong> {student.name || "N/A"}{" "}
              {student.lastName || ""}
            </p>
             <p className="voucher-text">
  <strong>Cuil:</strong> {formatCuil(student.cuil)}
</p>
          </div>

          {/* Detalles del pago */}
          <div className="voucher-section">
            <h3 className="voucher-section-title">Detalle del Pago</h3>
            <p className="voucher-text">
              <strong>Mes:</strong>{" "}
              {cuota.date
                ? new Date(cuota.date).toLocaleString("es-ES", {
                  month: "long",
                  year: "numeric",
                }).replace(/^\w/, (c) => c.toUpperCase())
                : "N/A"}
            </p>
            <p className="voucher-text">
              <strong>Monto:</strong>{" "}
              {cuota.amount
                ? new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(cuota.amount)
                : "N/A"}
            </p>
            <p className="voucher-text">
              <strong>Método de Pago:</strong> {cuota.paymentmethod || "N/A"}
            </p>
            <p className="voucher-text">
              <strong>Fecha de Pago:</strong>{" "}
              {cuota.paymentdate
                ? new Date(cuota.paymentdate).toLocaleDateString("es-ES")
                : "N/A"}
            </p>
            <p className="voucher-text">
              <strong>Fecha de Emisión:</strong>{" "}
              {formatDateWithTimezone(new Date())}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendVoucherEmail;