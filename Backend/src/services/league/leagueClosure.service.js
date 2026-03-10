import LeagueArchive from '../../models/league/leagueArchive.model.js';

const SEMESTER_RANGES = {
  1: { startMonth: 0, endMonth: 5, endDay: 30 },
  2: { startMonth: 6, endMonth: 11, endDay: 31 }
};

export const getSemesterFromDate = (date = new Date()) => {
  const month = date.getMonth();
  return month <= 5 ? 1 : 2;
};

export const getSemesterRange = (year, semester) => {
  const range = SEMESTER_RANGES[semester];
  if (!range) return null;

  const start = new Date(year, range.startMonth, 1, 0, 0, 0, 0);
  const end = new Date(year, range.endMonth, range.endDay, 23, 59, 59, 999);

  return { start, end };
};

export const getRequiredClosurePeriod = (referenceDate = new Date()) => {
  const currentYear = referenceDate.getFullYear();
  const currentSemester = getSemesterFromDate(referenceDate);

  const year = currentSemester === 1 ? currentYear - 1 : currentYear;
  const semester = currentSemester === 1 ? 2 : 1;

  return {
    year,
    semester,
    label: `S${semester} ${year}`,
    ...getSemesterRange(year, semester)
  };
};

export const getLeagueClosureStatus = async (referenceDate = new Date()) => {
  const requiredPeriod = getRequiredClosurePeriod(referenceDate);

  const closedArchive = await LeagueArchive.findOne({
    year: requiredPeriod.year,
    semester: requiredPeriod.semester
  })
    .select('name year semester date periodStart periodEnd totalPlayers createdAt')
    .lean();

  return {
    required: !closedArchive,
    requiredPeriod,
    closedArchive: closedArchive || null
  };
};

export const isDateWithinRange = (date, min, max) => {
  return date >= min && date <= max;
};
