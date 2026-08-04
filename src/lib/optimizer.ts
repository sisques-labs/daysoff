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

export interface CombinedPlan {
  bridges: BridgeCandidate[];
  ptoUsed: number;
  totalDaysOff: number;
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

// Finds every maximal run of consecutive workdays, then expands each run
// outward over the adjacent holidays/weekends to get the full stretch of
// time off it buys. A run at the very start/end of the calendar is only
// bounded by a non-workday on one side (there's no day before Jan 1 or
// after Dec 31) — that still counts, per the spec.
export function findBridges(
  calendar: CalendarDay[],
  availableDays: number,
): BridgeCandidate[] {
  const candidates: BridgeCandidate[] = [];

  let index = 0;
  while (index < calendar.length) {
    if (calendar[index]?.type !== 'workday') {
      index += 1;
      continue;
    }

    const runStart = index;
    while (index < calendar.length && calendar[index]?.type === 'workday') {
      index += 1;
    }
    const runEnd = index - 1;
    const ptoUsed = runEnd - runStart + 1;

    if (ptoUsed <= availableDays) {
      let left = runStart;
      while (left - 1 >= 0 && calendar[left - 1]?.type !== 'workday') {
        left -= 1;
      }
      let right = runEnd;
      while (
        right + 1 < calendar.length &&
        calendar[right + 1]?.type !== 'workday'
      ) {
        right += 1;
      }

      const totalDaysOff = right - left + 1;
      candidates.push({
        startDate: calendar[left]!.date,
        endDate: calendar[right]!.date,
        ptoUsed,
        totalDaysOff,
        efficiency: totalDaysOff / ptoUsed,
      });
    }
  }

  return candidates.sort(
    (a, b) => b.efficiency - a.efficiency || b.totalDaysOff - a.totalDaysOff,
  );
}

function overlaps(a: BridgeCandidate, b: BridgeCandidate): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

// Greedily combines non-overlapping candidates, highest efficiency first,
// up to the available PTO budget. Not a perfect knapsack solve — an MVP
// greedy pass, per the spec.
export function combineBridges(
  candidates: BridgeCandidate[],
  availableDays: number,
): CombinedPlan {
  const selected: BridgeCandidate[] = [];
  let ptoUsed = 0;

  for (const candidate of candidates) {
    if (ptoUsed + candidate.ptoUsed > availableDays) continue;
    if (selected.some((chosen) => overlaps(chosen, candidate))) continue;

    selected.push(candidate);
    ptoUsed += candidate.ptoUsed;
  }

  selected.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return {
    bridges: selected,
    ptoUsed,
    totalDaysOff: selected.reduce(
      (sum, bridge) => sum + bridge.totalDaysOff,
      0,
    ),
  };
}
