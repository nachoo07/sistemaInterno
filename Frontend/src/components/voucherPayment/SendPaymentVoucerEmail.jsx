import React, { useState, useEffect, useContext, useMemo } from "react";
import { Button } from "react-bootstrap";
import { FaFileInvoice, FaSpinner } from "react-icons/fa";
import { EmailContext } from "../../context/email/EmailContext";
import { DateTime } from "luxon";
import "./voucherPayment.css";

const SendPaymentVoucherEmail = ({ student, payment, onSendingStart, onSendingEnd }) => {
  const [loading, setLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const { sendVoucherEmail } = useContext(EmailContext);

  useEffect(() => {
    if (student && payment && payment.paymentDate && payment.paymentMethod && payment.concept) {
      setIsDataReady(true);
    } else {
      console.warn("Datos insuficientes para generar el comprobante de pago:", { student, payment });
      setIsDataReady(false);
    }
  }, [student, payment]);

  const formatDateForFilename = (date) => {
    if (!date) return "N/A";
    const parsedDate = DateTime.fromJSDate(new Date(date), { zone: "America/Argentina/Tucuman" });
    if (!parsedDate.isValid) return "N/A";
    return parsedDate.toFormat("dd-MM-yyyy");
  };

  const formatCuil = (cuil) => {
    if (!cuil) return "N/A";
    const cleanCuil = cuil.replace(/\D/g, "");
    if (cleanCuil.length === 11) {
      return `${cleanCuil.substring(0, 2)}-${cleanCuil.substring(2, 10)}-${cleanCuil.substring(10)}`;
    }
    return cuil;
  };

  const formattedData = useMemo(() => {
    if (!isDataReady) return null;
    return {
      filename: `Comprobante_Pago_${student.name}_${formatDateForFilename(payment.paymentDate).replace(/\//g, "-")}.pdf`,
      student: {
        name: student.name || "N/A",
        lastName: student.lastName || "",
        cuil: formatCuil(student.cuil),
      },
      payment: {
        concept: payment.concept || "N/A",
        amount: payment.amount
          ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(payment.amount)
          : "N/A",
        paymentMethod: payment.paymentMethod || "N/A",
        paymentDate: payment.paymentDate,
      },
    };
  }, [isDataReady, student, payment]);

  const handleSendVoucher = async () => {
    if (!isDataReady || !formattedData) {
      console.error("Datos no listos para enviar el comprobante de pago.");
      return;
    }

    setLoading(true);
    onSendingStart();
    try {
      console.time("sendVoucherEmail");
      await sendVoucherEmail(student, payment, {
        content: "Generar PDF",
        format: "pdf",
        filename: formattedData.filename,
        mimeType: "application/pdf",
        student: formattedData.student,
        payment: formattedData.payment,
      });
      console.timeEnd("sendVoucherEmail");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    } finally {
      setLoading(false);
      onSendingEnd();
    }
  };

  return (
    <>
      <Button
        className="send-voucher-payment"
        onClick={handleSendVoucher}
        disabled={loading || !isDataReady}
        title="Enviar comprobante de pago"
      >
        {!loading && <FaFileInvoice />}
        {loading && <FaSpinner className="spinner" />}
      </Button>
    </>
  );
};

export default SendPaymentVoucherEmail;