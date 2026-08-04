import type { Holiday } from './holidays/types';

export type DayType = 'holiday' | 'weekend' | 'workday';

export interface CalendarDay {
  date: string;
  type: DayType;
}

export interface BridgeCandidate {
  startDate: string;
  endDate: string;
  ptoUsed: number;
  totalDaysOff: number;
  efficiency: number;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildCalendar(
  year: number,
  holidays: Holiday[],
): CalendarDay[] {
  const holidayDates = new Set(holidays.map((holiday) => holiday.date));
  const days: CalendarDay[] = [];

  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    const date = toDateOnly(cursor);
    const dayOfWeek = cursor.getUTCDay();
    const type: DayType = holidayDates.has(date)
      ? 'holiday'
      : dayOfWeek === 0 || dayOfWeek === 6
        ? 'weekend'
        : 'workday';

    days.push({ date, type });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

// TODO: gap detection, efficiency ranking, and greedy multi-gap combination
// are not implemented yet — this is tooling/scaffolding only.
export function findBridges(
  _calendar: CalendarDay[],
  _availableDays: number,
): BridgeCandidate[] {
  return [];
}
