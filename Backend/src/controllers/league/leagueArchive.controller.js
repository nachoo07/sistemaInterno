import LeagueArchive from "../../models/league/leagueArchive.model.js";
import Student from "../../models/student/student.model.js";
import sanitize from 'mongo-sanitize';
import pino from 'pino';
import mongoose from 'mongoose';
import {
    sendBadRequest,
    sendInternalServerError,
    sendNotFound
} from '../_shared/controller.utils.js';
import {
    getLeagueClosureStatus,
    isDateWithinRange
} from '../../services/league/leagueClosure.service.js';

const logger = pino();

const parseDate = (value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

// 1. ESTADO DE CIERRE REQUERIDO
export const getClosureStatus = async (_req, res) => {
    try {
        const status = await getLeagueClosureStatus();
        return res.status(200).json(status);
    } catch (error) {
        logger.error({ error: error.message }, 'Error al obtener estado de cierre de liga');
        return sendInternalServerError(res, 'Error al obtener estado de cierre de liga');
    }
};

// 2. CERRAR PERÍODO Y ARCHIVAR
export const closeSeason = async (req, res) => {
    const { seasonName, periodStart, periodEnd } = sanitize(req.body);

    try {
        const closureStatus = await getLeagueClosureStatus();
        if (!closureStatus.required) {
            return sendBadRequest(res, `El período ${closureStatus.requiredPeriod.label} ya fue cerrado.`);
        }

        const { requiredPeriod } = closureStatus;
        const periodStartDate = periodStart ? parseDate(periodStart) : new Date(requiredPeriod.start);
        const periodEndDate = periodEnd ? parseDate(periodEnd) : new Date(requiredPeriod.end);

        if (!periodStartDate || !periodEndDate) {
            return sendBadRequest(res, 'Debe enviar fechas válidas para el período de cierre.');
        }
        if (periodStartDate > periodEndDate) {
            return sendBadRequest(res, 'La fecha "desde" no puede ser mayor a la fecha "hasta".');
        }
        if (!isDateWithinRange(periodStartDate, requiredPeriod.start, requiredPeriod.end)
            || !isDateWithinRange(periodEndDate, requiredPeriod.start, requiredPeriod.end)) {
            return sendBadRequest(res, `El período debe estar dentro de ${requiredPeriod.label}.`);
        }

        const normalizedSeasonName = seasonName?.trim() || `Liga ${requiredPeriod.label}`;

        const exists = await LeagueArchive.findOne({ name: normalizedSeasonName });
        if (exists) {
            return sendBadRequest(res, 'Ya existe un archivo con ese nombre de temporada/período.');
        }

        const periodAlreadyClosed = await LeagueArchive.findOne({
            year: requiredPeriod.year,
            semester: requiredPeriod.semester
        });
        if (periodAlreadyClosed) {
            return sendBadRequest(res, `El período ${requiredPeriod.label} ya fue cerrado.`);
        }

        // B. Snapshot de todos los alumnos (activos e inactivos)
        const students = await Student.find().select('name lastName cuil category state league _id').lean();
        const totalPlayers = students.filter((student) => String(student.league || '').toLowerCase() === 'si').length;

        // C. Crear el documento de Archivo (Snapshot)
        const archiveData = {
            name: normalizedSeasonName,
            year: requiredPeriod.year,
            semester: requiredPeriod.semester,
            periodStart: periodStartDate,
            periodEnd: periodEndDate,
            closedBy: req.user?.userId && mongoose.Types.ObjectId.isValid(req.user.userId)
                ? req.user.userId
                : undefined,
            totalStudents: students.length,
            totalPlayers,
            students: students.map(p => ({
                studentId: p._id,
                name: p.name,
                lastName: p.lastName,
                cuil: p.cuil,
                category: p.category,
                state: p.state || 'Activo',
                leagueAtClose: ['Si', 'No', 'Sin especificar'].includes(p.league) ? p.league : 'Sin especificar',
                playedLeague: String(p.league || '').toLowerCase() === 'si'
            }))
        };

        await LeagueArchive.create(archiveData);

        // D. RESETEAR a todos los alumnos
        // Ponemos a TODOS en 'Sin especificar' para comenzar de nuevo
        await Student.updateMany({}, { $set: { league: 'Sin especificar' } });

        logger.info(`Período '${normalizedSeasonName}' (${requiredPeriod.label}) cerrado. ${students.length} alumnos archivados (${totalPlayers} jugadores de liga).`);
        res.status(200).json({ 
            message: `Período ${requiredPeriod.label} cerrado con éxito. Se archivaron ${students.length} alumnos (${totalPlayers} en liga) y se reseteó la liga.`,
            period: requiredPeriod,
            totalStudents: students.length,
            totalPlayers
        });

    } catch (error) {
        logger.error({ error: error.message }, 'Error al cerrar temporada');
        return sendInternalServerError(res, "Error interno al procesar el cierre de temporada.");
    }
};

// 3. OBTENER LISTA DE TEMPORADAS/PERÍODOS
export const getSeasons = async (req, res) => {
    try {
        const seasons = await LeagueArchive.find()
            .select('name date year semester periodStart periodEnd totalStudents totalPlayers createdAt')
            .sort({ createdAt: -1 });
        res.status(200).json(seasons);
    } catch (error) {
        logger.error({ error: error.message }, 'Error al obtener temporadas');
        return sendInternalServerError(res, "Error al obtener temporadas");
    }
};

// 4. DETALLE DE UNA TEMPORADA/PERÍODO
export const getSeasonDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const season = await LeagueArchive.findById(id);
        if (!season) return sendNotFound(res, "Temporada no encontrada");
        res.status(200).json(season);
    } catch (error) {
        logger.error({ error: error.message, seasonId: id }, 'Error al obtener detalle de temporada');
        return sendInternalServerError(res, "Error al obtener detalle");
    }
};
