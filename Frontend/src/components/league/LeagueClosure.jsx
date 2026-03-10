import { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import client from '../../api/axios';
import { LoginContext } from '../../context/login/LoginContext';
import { LeagueClosureContext } from '../../context/league/LeagueClosureContext';
import { StudentsContext } from '../../context/student/StudentContext';
import AppNavbar from '../navbar/AppNavbar';
import DesktopNavbar from '../navbar/DesktopNavbar';
import Sidebar from '../sidebar/Sidebar';
import logo from '../../assets/logoyoclaudio.png';
import './leagueClosure.css';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-AR');
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const LeagueClosure = () => {
  const { auth } = useContext(LoginContext);
  const { closureStatus, closureRequired, refreshClosureStatus } = useContext(LeagueClosureContext);
  const { refrescarEstudiantes } = useContext(StudentsContext);

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isClosing, setIsClosing] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periods, setPeriods] = useState([]);
  const [downloadingId, setDownloadingId] = useState('');

  const requiredPeriod = closureStatus?.requiredPeriod;

  useEffect(() => {
  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWindowWidth(newWidth);
    if (newWidth <= 576) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };
  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    if (!requiredPeriod) return;

    setSeasonName(`Liga ${requiredPeriod.label}`);
    setPeriodStart(toInputDate(requiredPeriod.start));
    setPeriodEnd(toInputDate(requiredPeriod.end));
  }, [requiredPeriod]);

  const loadPeriods = async () => {
    try {
      const response = await client.get('/league/periods');
      setPeriods(Array.isArray(response.data) ? response.data : []);
    } catch (_error) {
      setPeriods([]);
    }
  };

  useEffect(() => {
    if (auth !== 'admin') return;
    loadPeriods();
  }, [auth]);

  const canClose = useMemo(() => {
    return closureRequired && !!periodStart && !!periodEnd && !isClosing;
  }, [closureRequired, periodStart, periodEnd, isClosing]);

  const getStudentsForArchive = async (periodId) => {
    const response = await client.get(`/league/periods/${periodId}`);
    const season = response?.data || {};
    const students = Array.isArray(season.students) ? season.students : [];

    return {
      season,
      students: students.map((student) => {
        const playedLeague = typeof student.playedLeague === 'boolean'
          ? student.playedLeague
          : String(student.leagueAtClose || '').toLowerCase() === 'si';

        return {
          name: student.name || '-',
          lastName: student.lastName || '-',
          cuil: student.cuil || '-',
          category: student.category || '-',
          state: student.state || '-',
          leagueAtClose: student.leagueAtClose || '-',
          playedLeague: playedLeague ? 'Sí' : 'No'
        };
      })
    };
  };

  const handleDownloadExcel = async (period) => {
    try {
      setDownloadingId(period._id);
      const { season, students } = await getStudentsForArchive(period._id);

      const headers = ['Apellido', 'Nombre', 'CUIL', 'Categoría', 'Estado', 'Liga al cierre', 'Jugó liga'];
      const rows = students.map((student) => [
        student.lastName,
        student.name,
        student.cuil,
        student.category,
        student.state,
        student.leagueAtClose,
        student.playedLeague
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cierre Liga');
      const fileName = `Cierre_Liga_${season.year || 'periodo'}_${season.semester || ''}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo descargar el Excel.';
      await Swal.fire('Error', message, 'error');
    } finally {
      setDownloadingId('');
    }
  };

  const handleDownloadPdf = async (period) => {
    try {
      setDownloadingId(period._id);
      const { season, students } = await getStudentsForArchive(period._id);

      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFillColor(234, 38, 143);
      doc.rect(0, 0, 297, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(`Cierre Liga ${season?.name || '-'}`, 14, 13);
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(10);
      doc.text(`Período: ${season?.semester ? `S${season.semester}` : '-'} ${season?.year || ''}`, 14, 27);

      autoTable(doc, {
        startY: 32,
        head: [['Apellido', 'Nombre', 'CUIL', 'Categoría', 'Estado', 'Liga al cierre', 'Jugó liga']],
        body: students.map((student) => [
          student.lastName,
          student.name,
          student.cuil,
          student.category,
          student.state,
          student.leagueAtClose,
          student.playedLeague
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [234, 38, 143], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 251, 255] },
        margin: { left: 10, right: 10 },
      });

      const fileName = `Cierre_Liga_${season.year || 'periodo'}_${season.semester || ''}.pdf`;
      doc.save(fileName);
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo descargar el PDF.';
      await Swal.fire('Error', message, 'error');
    } finally {
      setDownloadingId('');
    }
  };

  const handleClosePeriod = async () => {
    if (!canClose) return;

    const confirm = await Swal.fire({
      title: '¿Confirmar cierre de período?',
      text: 'Se archivará liga y todos los alumnos pasarán a "Sin especificar".',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar período',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    setIsClosing(true);
    try {
      await client.post('/league/close-period', {
        seasonName,
        periodStart,
        periodEnd
      });

      await Promise.all([refreshClosureStatus(), loadPeriods(), refrescarEstudiantes()]);

      await Swal.fire('Listo', 'Período cerrado correctamente.', 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo cerrar el período.';
      await Swal.fire('Error', message, 'error');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className={`app-container ${windowWidth <= 576 ? "mobile-view" : ""}`}>
  {windowWidth <= 576 && (
    <AppNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
  )}
      {windowWidth > 576 && (
        <DesktopNavbar logoSrc={logo} showSearch={false} />
      )}

      <div className="dashboard-layout">
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeRoute="/league-closure"
        />

        <main className="main-content league-closure-main">
          <section className="league-closure-card">
            <h1>Cierre de Liga por Semestre</h1>
            <p className="league-closure-subtitle">
              {closureRequired
                ? 'Debes cerrar el período pendiente para continuar operando.'
                : 'No hay cierres pendientes. Puedes revisar el historial.'}
            </p>

            {closureRequired && requiredPeriod ? (
              <div className="league-closure-grid">
                <div>
                  <label>Período requerido</label>
                  <input value={requiredPeriod.label || ''} disabled />
                </div>
                <div>
                  <label>Nombre del cierre</label>
                  <input value={seasonName} onChange={(e) => setSeasonName(e.target.value)} disabled={!closureRequired} />
                </div>
                <div>
                  <label>Desde</label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} disabled={!closureRequired} />
                </div>
                <div>
                  <label>Hasta</label>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} disabled={!closureRequired} />
                </div>
              </div>
            ) : (
              <div className="league-ok-state">
                <strong>✅ Estado al día</strong>
                <p>Cuando comience un nuevo semestre se habilitará automáticamente el próximo cierre obligatorio.</p>
              </div>
            )}

            {closureRequired && (
              <div className="league-closure-actions">
                <button className="league-primary-btn" onClick={handleClosePeriod} disabled={!canClose}>
                  {isClosing ? 'Cerrando...' : 'Cerrar período'}
                </button>
              </div>
            )}
          </section>

          <section className="league-history-card">
            <h2>Historial de cierres</h2>
            {periods.length === 0 ? (
              <p className="league-empty">Todavía no hay cierres registrados.</p>
            ) : (
              <div className="league-history-table-wrap">
                <table className="league-history-table">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Nombre</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                      <th>Total alumnos</th>
                      <th>Jugadores</th>
                      <th>Cerrado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period._id}>
                        <td>{period.year && period.semester ? `S${period.semester} ${period.year}` : '-'}</td>
                        <td>{period.name}</td>
                        <td>{formatDate(period.periodStart)}</td>
                        <td>{formatDate(period.periodEnd)}</td>
                        <td>{period.totalStudents ?? period.students?.length ?? '-'}</td>
                        <td>{period.totalPlayers ?? 0}</td>
                        <td>{formatDate(period.date || period.createdAt)}</td>
                        <td>
                          <div className="league-history-actions">
                            <button
                              className="league-secondary-btn"
                              onClick={() => handleDownloadExcel(period)}
                              disabled={downloadingId === period._id}
                            >
                              Excel
                            </button>
                            <button
                              className="league-secondary-btn pdf"
                              onClick={() => handleDownloadPdf(period)}
                              disabled={downloadingId === period._id}
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default LeagueClosure;
