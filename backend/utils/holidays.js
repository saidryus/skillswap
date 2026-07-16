/**
 * Philippine Holiday Utility
 * Provides regular and special non-working holidays.
 * These can be updated annually by admin or fetched from an external API.
 *
 * Source: Official Malacañang proclamations
 */

// Fixed-date holidays (repeat every year)
const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: "New Year's Day", type: 'regular' },
  { month: 2, day: 25, name: 'EDSA People Power Revolution Anniversary', type: 'special' },
  { month: 4, day: 9, name: 'Araw ng Kagitingan (Day of Valor)', type: 'regular' },
  { month: 5, day: 1, name: 'Labor Day', type: 'regular' },
  { month: 6, day: 12, name: 'Independence Day', type: 'regular' },
  { month: 8, day: 21, name: 'Ninoy Aquino Day', type: 'special' },
  { month: 8, day: 25, name: 'National Heroes Day', type: 'regular' },
  { month: 11, day: 1, name: "All Saints' Day", type: 'special' },
  { month: 11, day: 2, name: "All Souls' Day", type: 'special' },
  { month: 11, day: 30, name: 'Bonifacio Day', type: 'regular' },
  { month: 12, day: 8, name: 'Feast of the Immaculate Conception', type: 'special' },
  { month: 12, day: 24, name: 'Christmas Eve', type: 'special' },
  { month: 12, day: 25, name: 'Christmas Day', type: 'regular' },
  { month: 12, day: 30, name: 'Rizal Day', type: 'regular' },
  { month: 12, day: 31, name: "New Year's Eve", type: 'special' },
];

// Variable-date holidays for specific years (Holy Week, Eid, etc.)
const VARIABLE_HOLIDAYS = {
  2025: [
    { month: 4, day: 17, name: 'Maundy Thursday', type: 'regular' },
    { month: 4, day: 18, name: 'Good Friday', type: 'regular' },
    { month: 4, day: 19, name: 'Black Saturday', type: 'special' },
  ],
  2026: [
    { month: 4, day: 2, name: 'Maundy Thursday', type: 'regular' },
    { month: 4, day: 3, name: 'Good Friday', type: 'regular' },
    { month: 4, day: 4, name: 'Black Saturday', type: 'special' },
  ],
  2027: [
    { month: 3, day: 25, name: 'Maundy Thursday', type: 'regular' },
    { month: 3, day: 26, name: 'Good Friday', type: 'regular' },
    { month: 3, day: 27, name: 'Black Saturday', type: 'special' },
  ],
};

/**
 * Get all holidays for a given year
 * @param {number} year
 * @returns {Array<{date: string, name: string, type: string}>}
 */
function getHolidaysForYear(year) {
  const holidays = [];

  // Fixed holidays
  FIXED_HOLIDAYS.forEach(h => {
    const dateStr = `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
    holidays.push({ date: dateStr, name: h.name, type: h.type });
  });

  // Variable holidays for this specific year
  if (VARIABLE_HOLIDAYS[year]) {
    VARIABLE_HOLIDAYS[year].forEach(h => {
      const dateStr = `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
      holidays.push({ date: dateStr, name: h.name, type: h.type });
    });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if a specific date is a holiday
 * @param {Date|string} date
 * @returns {{isHoliday: boolean, holiday: object|null}}
 */
function isHoliday(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Check fixed holidays
  const fixedMatch = FIXED_HOLIDAYS.find(h => h.month === month && h.day === day);
  if (fixedMatch) {
    return { isHoliday: true, holiday: { ...fixedMatch, date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` } };
  }

  // Check variable holidays
  if (VARIABLE_HOLIDAYS[year]) {
    const varMatch = VARIABLE_HOLIDAYS[year].find(h => h.month === month && h.day === day);
    if (varMatch) {
      return { isHoliday: true, holiday: { ...varMatch, date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` } };
    }
  }

  return { isHoliday: false, holiday: null };
}

/**
 * Check if a date is a Sunday (no classes typically)
 */
function isSunday(date) {
  return new Date(date).getDay() === 0;
}

module.exports = { getHolidaysForYear, isHoliday, isSunday };
