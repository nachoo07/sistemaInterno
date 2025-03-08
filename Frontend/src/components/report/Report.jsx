import { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUsers, FaBell, FaMoneyBill, FaChartBar, FaExchangeAlt, FaCalendarCheck, FaUserCog, FaCog, FaEnvelope, FaHome, FaArrowLeft } from 'react-icons/fa';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import GraphicIyE from '../graphic/GraphicIyE';
import GraphicIyE2 from '../graphic/GraphicIyE2';
import GraphicIyE3 from '../graphic/GraphicIyE3';
import GraphicIyE4 from '../graphic/GraphicIyE4';
import GraphicMonthly from '../graphic/GraphicMonthly';
import CalendarReport from '../calendar/CalendarReport';
import { StudentsContext } from '../../context/student/StudentContext';
import { SharesContext } from '../../context/share/ShareContext';
import { MotionContext } from '../../context/motion/MotionContext';
import './report.css';

dayjs.locale('es');

const Report = () => {
  const { countStudentsByState } = useContext(StudentsContext);
  const { obtenerCuotasPorFecha, obtenerCuotasPorFechaRange, cuotas } = useContext(SharesContext);
  const { getMotionsByDate, getMotionsByDateRange } = useContext(MotionContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const menuItems = [
    { name: 'Inicio', route: '/', icon: <FaHome /> },
    { name: 'Alumnos', route: '/student', icon: <FaUsers /> },
    { name: 'Notificaciones', route: '/notification', icon: <FaBell /> },
    { name: 'Cuotas', route: '/share', icon: <FaMoneyBill /> },
    { name: 'Reportes', route: '/report', icon: <FaChartBar /> },
    { name: 'Movimientos', route: '/motion', icon: <FaExchangeAlt /> },
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck /> },
    { name: 'Usuarios', route: '/user', icon: <FaUserCog /> },
    { name: 'Ajustes', route: '/settings', icon: <FaCog /> },
    { name: 'Envios de Mail', route: '/email-notifications', icon: <FaEnvelope /> },
    { name: 'Volver Atrás', route: null, action: () => navigate(-1), icon: <FaArrowLeft /> }
  ];

  const activos = useMemo(() => countStudentsByState('Activo') || 0, [countStudentsByState]);
  const inactivos = useMemo(() => countStudentsByState('Inactivo') || 0, [countStudentsByState]);

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

  const fetchCuotasStatus = useMemo(() => {
    const cuotasArray = Array.isArray(cuotas) ? cuotas : [];
    return {
      pendientes: cuotasArray.filter(cuota => cuota.state === 'Pendiente').length,
      vencidas: cuotasArray.filter(cuota => cuota.state === 'Vencido').length,
    };
  }, [cuotas]);

  useEffect(() => {
    setMonthlyData(prev => ({
      ...prev,
      totalCuotas: fetchCuotasStatus.pendientes + fetchCuotasStatus.vencidas,
    }));
  }, [fetchCuotasStatus]);

  const fetchData = async (date, setEfectivo, setTransferencia, type = 'cuotas', incomeTypeFilter = null) => {
    setEfectivo(0);
    setTransferencia(0);
    const data = type === 'cuotas'
      ? await obtenerCuotasPorFecha(date.format('YYYY-MM-DD'))
      : await getMotionsByDate(date.format('YYYY-MM-DD'));
    const array = Array.isArray(data) ? data : [];

    // Aplicar filtro por incomeType si está definido
    const filteredArray = incomeTypeFilter
      ? array.filter(item => item.incomeType === incomeTypeFilter)
      : array;

    const efectivo = filteredArray.filter(item =>
      (type === 'cuotas' ? item.paymentmethod === 'Efectivo' : item.paymentMethod === 'efectivo')
    ).reduce((sum, item) => sum + (item.amount || 0), 0);
    const transferencia = filteredArray.filter(item =>
      (type === 'cuotas' ? item.paymentmethod === 'Transferencia' : item.paymentMethod === 'transferencia')
    ).reduce((sum, item) => sum + (item.amount || 0), 0);
    setEfectivo(efectivo);
    setTransferencia(transferencia);
  };

  const fetchIngresosYEgresos = async (date, setIngreso, setEgreso) => {
    setIngreso(0);
    setEgreso(0);
    const motions = await getMotionsByDate(date.format('YYYY-MM-DD'));
    const array = Array.isArray(motions) ? motions : [];
    setIngreso(array.filter(m => m.incomeType === 'ingreso').reduce((sum, m) => sum + (m.amount || 0), 0));
    setEgreso(array.filter(m => m.incomeType === 'egreso').reduce((sum, m) => sum + (m.amount || 0), 0));
  };

  const fetchMonthlyData = async (month) => {
    const startOfMonth = month.startOf('month').format('YYYY-MM-DD');
    const endOfMonth = month.endOf('month').format('YYYY-MM-DD');
    const [cuotas, motions] = await Promise.all([
      obtenerCuotasPorFechaRange(startOfMonth, endOfMonth),
      getMotionsByDateRange(startOfMonth, endOfMonth),
    ]);
    const cuotasArray = Array.isArray(cuotas) ? cuotas : [];
    const motionsArray = Array.isArray(motions) ? motions : [];

    const totalCuotas = cuotasArray.reduce((sum, cuota) => sum + (cuota.amount || 0), 0);
    const totalIngresos = motionsArray.filter(m => m.incomeType === 'ingreso').reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalEgresos = motionsArray.filter(m => m.incomeType === 'egreso').reduce((sum, m) => sum + (m.amount || 0), 0);
    const efectivoCuotas = cuotasArray.filter(c => c.paymentmethod === 'Efectivo').reduce((sum, c) => sum + (c.amount || 0), 0);
    const transferenciaCuotas = cuotasArray.filter(c => c.paymentmethod === 'Transferencia').reduce((sum, c) => sum + (c.amount || 0), 0);
    const efectivoIngresos = motionsArray.filter(m => m.paymentMethod.toLowerCase() === 'efectivo' && m.incomeType === 'ingreso').reduce((sum, m) => sum + (m.amount || 0), 0);
    const transferenciaIngresos = motionsArray.filter(m => m.paymentMethod.toLowerCase() === 'transferencia' && m.incomeType === 'ingreso').reduce((sum, m) => sum + (m.amount || 0), 0);
    const efectivoEgresos = motionsArray.filter(m => m.paymentMethod.toLowerCase() === 'efectivo' && m.incomeType === 'egreso').reduce((sum, m) => sum + (m.amount || 0), 0);
    const transferenciaEgresos = motionsArray.filter(m => m.paymentMethod.toLowerCase() === 'transferencia' && m.incomeType === 'egreso').reduce((sum, m) => sum + (m.amount || 0), 0);

    setMonthlyData({
      totalCuotas,
      totalIngresos,
      totalEgresos,
      balanceFinal: totalCuotas + totalIngresos - totalEgresos,
      efectivoDisponible: (efectivoCuotas + efectivoIngresos) - efectivoEgresos,
      transferenciaDisponible: (transferenciaCuotas + transferenciaIngresos) - transferenciaEgresos,
    });
  };

  // Para el gráfico de Cuotas
  useEffect(() => {
    fetchData(selectedDate1, setEfectivo1, setTransferencia1, 'cuotas');
  }, [selectedDate1]);

  // Para el gráfico de Reporte Diario (Ingresos y Egresos)
  useEffect(() => {
    fetchIngresosYEgresos(selectedDate2, setIngreso2, setEgreso2);
  }, [selectedDate2]);

  // Gráfico de Ingresos
  useEffect(() => {
    fetchData(selectedDate3, setEfectivoIngreso, setTransferenciaIngreso, 'motions', 'ingreso');
  }, [selectedDate3]);

  // Gráfico de Egresos
  useEffect(() => {
    fetchData(selectedDate4, setEfectivoEgreso, setTransferenciaEgreso, 'motions', 'egreso');
  }, [selectedDate4]);

  // Para el gráfico mensual
  useEffect(() => {
    fetchMonthlyData(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </div>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="sidebar-item"
            onClick={() => item.action ? item.action() : navigate(item.route)}
          >
            <span className="icon">{item.icon}</span>
            <span className="text">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="content-container">

        <div className="stats-grid">
          <div className="stat-card">
            <h3 className='titulo-card color-activos'>Total Alumnos Activos</h3>
            <p className="stat-value">{activos}</p>
          </div>
          <div className="stat-card">
            <h3 className='titulo-card color-inactivo'>Total Alumnos Inactivos</h3>
            <p className="stat-value">{inactivos}</p>
          </div>
          <div className="stat-card">
            <h3 className='titulo-card color-pendiente'>Cuotas Pendientes</h3>
            <p className="stat-value">{fetchCuotasStatus.pendientes}</p>
          </div>
          <div className="stat-card">
            <h3 className='titulo-card color-vencida'>Cuotas Vencidas</h3>
            <p className="stat-value">{fetchCuotasStatus.vencidas}</p>
          </div>
        </div>
        <div className="charts-grid">
          <div className='chart-card1'>
            <div className="chart-card ">
              <div className="header-cuotas">
                <h3 className='titulo-cuota'>Cuotas</h3>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" >
                    <DatePicker
                      value={selectedDate1}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate1(newValue)}
                      className="custom-datepicker"
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="chart-stats ">
                <div className="stat-item">
                  <p >Efectivo</p>
                  <p>${efectivo1.toLocaleString('es-ES')}</p>
                </div>
                <div className="stat-item">
                  <p>Transferencia</p>
                  <p>${transferencia1.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE efectivo={efectivo1} transferencia={transferencia1} />
              </div>
            </div>
            <div className="chart-card">
              <div className="header-cuotas">
                <h3 className='titulo-cuota'>Reporte Diario</h3>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" >
                    <DatePicker
                      value={selectedDate2}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate2(newValue)}
                      className="custom-datepicker"
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="chart-stats">
                <div className="stat-item">
                  <p>Ingreso</p>
                  <p>${ingreso2.toLocaleString('es-ES')}</p>
                </div>
                <div className="stat-item">
                  <p>Egreso</p>
                  <p>${egreso2.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE2 ingreso={ingreso2} egreso={egreso2} />
              </div>
            </div>
          </div>
          <div className='chart-card1'>
            <div className="chart-card ">
              <div className="header-cuotas">
                <h3 className='titulo-cuota'>Ingresos</h3>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" >
                    <DatePicker
                      value={selectedDate3}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate3(newValue)}
                      className="custom-datepicker"
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="chart-stats">
                <div className="stat-item">
                  <p>Efectivo</p>
                  <p>${efectivoIngreso.toLocaleString('es-ES')}</p>
                </div>
                <div className="stat-item">
                  <p>Transferencia</p>
                  <p>${transferenciaIngreso.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE3 efectivo={efectivoIngreso} transferencia={transferenciaIngreso} />
              </div>
            </div>
            <div className="chart-card ">
              <div className="header-cuotas">
                <h3 className='titulo-cuota'>Egresos</h3>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" >
                    <DatePicker
                      value={selectedDate4}
                      maxDate={dayjs()}
                      onChange={(newValue) => setSelectedDate4(newValue)}
                      className="custom-datepicker"
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div className="chart-stats">
                <div className="stat-item">
                  <p>Efectivo</p>
                  <p>${efectivoEgreso.toLocaleString('es-ES')}</p>
                </div>
                <div className="stat-item">
                  <p>Transferencia</p>
                  <p>${transferenciaEgreso.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="graphic-container">
                <GraphicIyE4 efectivo={efectivoEgreso} transferencia={transferenciaEgreso} />
              </div>
            </div>
          </div>
          <div className="chart-card full-width">
            <div className="header-mensual">
              <h3 className='titulo-mensual'>Reporte Mensual</h3>
              <div className="calendar-container">
                <CalendarReport onMonthChange={(newMonth) => setSelectedMonth(dayjs(newMonth))} />
              </div>
            </div>
            <div className="">
              <GraphicMonthly data={monthlyData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;