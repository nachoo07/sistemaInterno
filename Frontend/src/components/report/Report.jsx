import { useState, useContext, useEffect } from 'react';
import VerticalMenu from '../verticalMenu/VerticalMenu';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs from 'dayjs';
import GraphicIyE from '../graphic/GraphicIyE';
import GraphicIyE2 from '../graphic/GraphicIyE2';
import GraphicIyE3 from '../graphic/GraphicIyE3';
import GraphicIyE4 from '../graphic/GraphicIyE4';
import 'dayjs/locale/es';
import './report.css';  
import '../verticalMenu/vertical.css';
import CalendarReport from '../calendar/CalendarReport';
import { StudentsContext } from '../../context/student/StudentContext';
import { SharesContext } from '../../context/share/ShareContext';
import { MotionContext } from '../../context/motion/MotionContext';
import GraphicMonthly from '../graphic/GraphicMonthly';

dayjs.locale('es');

const Report = () => {
  const { countStudentsByState } = useContext(StudentsContext); // Usa el contexto de estudiantes
  const { obtenerCuotasPorFecha, obtenerCuotasPorFechaRange } = useContext(SharesContext);
  const { getMotionsByDate, getMotionsByDateRange } = useContext(MotionContext);
  const activos = countStudentsByState('Activo');
  const inactivos = countStudentsByState('Inactivo');

  const [selectedDate1, setSelectedDate1] = useState(dayjs());
  const [selectedDate2, setSelectedDate2] = useState(dayjs());
  const [selectedDate3, setSelectedDate3] = useState(dayjs());
  const [selectedDate4, setSelectedDate4] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const [efectivo1, setEfectivo1] = useState(0);
  const [transferencia1, setTransferencia1] = useState(0);
  const [ingreso2, setIngreso2] = useState(0);
  const [egreso2, setEgreso2] = useState(0);
  const [efectivoIngreso, setEfectivoIngreso] = useState(0);
  const [transferenciaIngreso, setTransferenciaIngreso] = useState(0);
  const [efectivoEgreso, setEfectivoEgreso] = useState(0);
  const [transferenciaEgreso, setTransferenciaEgreso] = useState(0);

  const [monthlyData, setMonthlyData] = useState({
    totalCuotas: 0,
    totalIngresos: 0,
    totalEgresos: 0,
    balanceFinal: 0,
    efectivoDisponible: 0,
    transferenciaDisponible: 0,
  });

  const fetchCuotasYMotions = async (date, setEfectivo, setTransferencia) => {
    setEfectivo(0);
    setTransferencia(0);
    // Obtener cuotas
    const cuotas = await obtenerCuotasPorFecha(date.format('YYYY-MM-DD'));
    const cuotasArray = Array.isArray(cuotas) ? cuotas : [];
    const totalEfectivoCuotas = cuotasArray
      .filter(cuota => cuota.paymentmethod === 'Efectivo')
      .reduce((sum, cuota) => sum + cuota.amount, 0);
    const totalTransferenciaCuotas = cuotasArray
      .filter(cuota => cuota.paymentmethod === 'Transferencia')
      .reduce((sum, cuota) => sum + cuota.amount, 0);

    // Sumar ambos totales
    setEfectivo(totalEfectivoCuotas );
    setTransferencia(totalTransferenciaCuotas );
  };

  const fetchIngresosYEgresos = async (date, setIngreso, setEgreso) => {
    setIngreso(0);
    setEgreso(0);

    // Obtener motions
    const motions = await getMotionsByDate(date.format('YYYY-MM-DD'));
    const motionsArray = Array.isArray(motions) ? motions : [];
    const totalIngreso = motionsArray
      .filter(motion => motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    const totalEgreso = motionsArray
      .filter(motion => motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);

    // Sumar ambos totales
    setIngreso(totalIngreso);
    setEgreso(totalEgreso);
  };

  const fetchIngresoMethods = async (date, setEfectivoIngreso, setTransferenciaIngreso) => {
    setEfectivoIngreso(0);
    setTransferenciaIngreso(0);

    // Obtener motions
    const motions = await getMotionsByDate(date.format('YYYY-MM-DD'));
    const motionsArray = Array.isArray(motions) ? motions : [];
    const totalEfectivoIngreso = motionsArray
      .filter(motion => motion.paymentMethod === 'efectivo' && motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    const totalTransferenciaIngreso = motionsArray
      .filter(motion => motion.paymentMethod === 'transferencia' && motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);

    // Sumar ambos totales
    setEfectivoIngreso(totalEfectivoIngreso);
    setTransferenciaIngreso(totalTransferenciaIngreso);
  };

  const fetchEgresoMethods = async (date, setEfectivoEgreso, setTransferenciaEgreso) => {
    setEfectivoEgreso(0);
    setTransferenciaEgreso(0);

    // Obtener motions
    const motions = await getMotionsByDate(date.format('YYYY-MM-DD'));
    const motionsArray = Array.isArray(motions) ? motions : [];
    const totalEfectivoEgreso = motionsArray
      .filter(motion => motion.paymentMethod === 'efectivo' && motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    const totalTransferenciaEgreso = motionsArray
      .filter(motion => motion.paymentMethod === 'transferencia' && motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);

    // Sumar ambos totales
    setEfectivoEgreso(totalEfectivoEgreso);
    setTransferenciaEgreso(totalTransferenciaEgreso);
  };
  
  const fetchMonthlyData = async (month) => {
    const startOfMonth = month.startOf('month').format('YYYY-MM-DD');
    const endOfMonth = month.endOf('month').format('YYYY-MM-DD');
  
    const cuotas = await obtenerCuotasPorFechaRange(startOfMonth, endOfMonth);
    const motions = await getMotionsByDateRange(startOfMonth, endOfMonth);
  
    const cuotasArray = Array.isArray(cuotas) ? cuotas : [];
    const motionsArray = Array.isArray(motions) ? motions : [];
  
    const totalCuotas = cuotasArray.reduce((sum, cuota) => sum + cuota.amount, 0);
    const totalIngresos = motionsArray
      .filter(motion => motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    const totalEgresos = motionsArray
      .filter(motion => motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
  
    const efectivoCuotas = cuotasArray
      .filter(cuota => cuota.paymentmethod === 'Efectivo')
      .reduce((sum, cuota) => sum + cuota.amount, 0);
    const transferenciaCuotas = cuotasArray
      .filter(cuota => cuota.paymentmethod === 'Transferencia')
      .reduce((sum, cuota) => sum + cuota.amount, 0);
  
      const efectivoIngresos = motionsArray
      .filter(motion => motion.paymentMethod.toLowerCase() === 'efectivo' && motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    
    const transferenciaIngresos = motionsArray
      .filter(motion => motion.paymentMethod.toLowerCase() === 'transferencia' && motion.incomeType === 'ingreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    
    const efectivoEgresos = motionsArray
      .filter(motion => motion.paymentMethod.toLowerCase() === 'efectivo' && motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);
    
    const transferenciaEgresos = motionsArray
      .filter(motion => motion.paymentMethod.toLowerCase() === 'transferencia' && motion.incomeType === 'egreso')
      .reduce((sum, motion) => sum + motion.amount, 0);

    const balanceFinal = totalCuotas + totalIngresos - totalEgresos;
    const efectivoDisponible = (efectivoCuotas + efectivoIngresos) - efectivoEgresos;
    const transferenciaDisponible = (transferenciaCuotas + transferenciaIngresos) - transferenciaEgresos;
  
    setMonthlyData({
      totalCuotas,
      totalIngresos,
      totalEgresos,
      balanceFinal,
      efectivoDisponible,
      transferenciaDisponible,
    });
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(dayjs(newMonth));
  };

  useEffect(() => {
    fetchCuotasYMotions(selectedDate1, setEfectivo1, setTransferencia1);
  }, [selectedDate1]);

  useEffect(() => {
    fetchIngresosYEgresos(selectedDate2, setIngreso2, setEgreso2);
  }, [selectedDate2]);

  useEffect(() => {
    fetchIngresoMethods(selectedDate3, setEfectivoIngreso, setTransferenciaIngreso);
  }, [selectedDate3]);

  useEffect(() => {
    fetchEgresoMethods(selectedDate4, setEfectivoEgreso, setTransferenciaEgreso);
  }, [selectedDate4]);

  useEffect(() => {
    fetchMonthlyData(selectedMonth);
  }, [selectedMonth]);
  
  useEffect(() => {
    console.log(monthlyData);
  }, [monthlyData]);
  return (
    <>
      <div className="main-container">
        <VerticalMenu />
        <div className="content-container">
          <div className="rectangle-container">
            <div className="rectangulo-activo">
              <p className='titulo-activo'>Activos: {activos}</p>
            </div>
            <div className="rectangulo-inactivo">
              <p className='titulo-activo'>Inactivos: {inactivos}</p>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className='nombre-fecha'>
                <div > <h3>Cuota</h3> </div>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DemoContainer className="date" components={['DatePicker']}>
                    <DatePicker
                      label=""
                      value={selectedDate1}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate1(newValue)}
                      className="custom-datepicker" // Añade una clase personalizada
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
              <div className='cuota-diaria'>
                <div className='ingresos-egresos'>
                  <p>Efectivo</p>
                  <p>${efectivo1.toLocaleString('es-ES')}</p>
                </div>
                <div className='ingresos-egresos'>
                  <p>Transferencia</p>
                  <p>${transferencia1.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE efectivo={efectivo1} transferencia={transferencia1} />
              </div>
            </div>
            <div className="dashboard-card">
              <div className='nombre-fecha'>
                <div>
                  <h3>Reporte diario extra</h3>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DemoContainer className="date" components={['DatePicker']}>
                    <DatePicker
                      label=""
                      value={selectedDate2}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate2(newValue)}
                      className="custom-datepicker" // Añade una clase personalizada
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
              <div className='cuota-diaria'>
                <div className='ingresos-egresos'>
                  <p>Ingreso</p>
                  <p>${ingreso2.toLocaleString('es-ES')}</p>
                </div>
                <div className='ingresos-egresos'>
                  <p>Egreso</p>
                  <p>${egreso2.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE2 ingreso={ingreso2} egreso={egreso2}/>
              </div>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className='nombre-fecha'>
                <div>
                  <h3>Ingreso</h3>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DemoContainer className="date" components={['DatePicker']}>
                    <DatePicker
                      label=""
                      value={selectedDate3}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate3(newValue)}
                      className="custom-datepicker" // Añade una clase personalizada
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
              <div className='cuota-diaria'>
                <div className='ingresos-egresos'>
                  <p>Efectivo</p>
                      <p>${efectivoIngreso.toLocaleString('es-ES')}</p>
                </div>
                <div className='ingresos-egresos'>
                  <p>Transferencia</p>
                  <p>${transferenciaIngreso.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
              <GraphicIyE3 efectivo={efectivoIngreso} transferencia={transferenciaIngreso} />
              </div>
            </div>
            <div className="dashboard-card">
              <div className='nombre-fecha'>
                <div>
                  <h3>Egreso</h3>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DemoContainer className="date" components={['DatePicker']}>
                    <DatePicker
                      label=""
                      value={selectedDate4}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate4(newValue)}
                      className="custom-datepicker" // Añade una clase personalizada
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
              <div className='cuota-diaria'>
                <div className='ingresos-egresos'>
                  <p>Efectivo</p>
                  <p>${efectivoEgreso.toLocaleString('es-ES')}</p>
                </div>
                <div className='ingresos-egresos'>
                  <p>Transferencia</p>
                  <p>${transferenciaEgreso.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
              <GraphicIyE4 efectivo={efectivoEgreso} transferencia={transferenciaEgreso} />
              </div>
            </div>
          </div>
          <div className="dashboard-card full-width-card">
  <div>
    <h3 className='reporte-mensual'>Reporte Mensual</h3>
  </div>

  <div className="calendar-container">
    <CalendarReport onMonthChange={handleMonthChange}/>
  </div>

  <div className="graphic-container">
    <GraphicMonthly data={monthlyData} />
  </div>
</div>
        </div>
      </div>
    </>
  );
};

export default Report;