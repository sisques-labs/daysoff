import { describe, expect, it } from 'vitest';
import { buildCalendar, combineBridges, findBridges } from './optimizer';
import type { CalendarDay, DayType } from './optimizer';
import type { Holiday } from './holidays/types';

function day(date: string, type: DayType): CalendarDay {
  return { date, type };
}

describe('buildCalendar', () => {
  const holidays: Holiday[] = [
    { date: '2026-01-01', name: 'Año Nuevo', scope: 'national' },
  ];

  it('tags a full year of days', () => {
    const calendar = buildCalendar(2026, holidays);
    expect(calendar).toHaveLength(365);
    expect(calendar[0].date).toBe('2026-01-01');
    expect(calendar.at(-1)?.date).toBe('2026-12-31');
  });

  it('tags a listed date as holiday even when it falls on a weekday', () => {
    const calendar = buildCalendar(2026, holidays);
    expect(calendar[0].type).toBe('holiday');
  });

  it('tags Saturdays and Sundays as weekend', () => {
    const calendar = buildCalendar(2026, holidays);
    // 2026-01-03 is a Saturday, 2026-01-04 is a Sunday.
    const saturday = calendar.find((d) => d.date === '2026-01-03');
    const sunday = calendar.find((d) => d.date === '2026-01-04');
    expect(saturday?.type).toBe('weekend');
    expect(sunday?.type).toBe('weekend');
  });

  it('tags every other day as a workday', () => {
    const calendar = buildCalendar(2026, holidays);
    // 2026-01-02 is a Friday with no holiday.
    const workday = calendar.find((d) => d.date === '2026-01-02');
    expect(workday?.type).toBe('workday');
  });
});

describe('findBridges', () => {
  it('returns no candidates when there are 0 available days', () => {
    const calendar = [
      day('2026-06-01', 'weekend'),
      day('2026-06-02', 'workday'),
      day('2026-06-03', 'weekend'),
    ];
    expect(findBridges(calendar, 0)).toEqual([]);
  });

  it('excludes a gap longer than the available days', () => {
    // 5 consecutive workdays bounded by weekends on both sides.
    const calendar = [
      day('2026-06-06', 'weekend'),
      day('2026-06-07', 'weekend'),
      day('2026-06-08', 'workday'),
      day('2026-06-09', 'workday'),
      day('2026-06-10', 'workday'),
      day('2026-06-11', 'workday'),
      day('2026-06-12', 'workday'),
      day('2026-06-13', 'weekend'),
      day('2026-06-14', 'weekend'),
    ];

    expect(findBridges(calendar, 3)).toEqual([]);

    const candidates = findBridges(calendar, 5);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toEqual({
      startDate: '2026-06-06',
      endDate: '2026-06-14',
      ptoUsed: 5,
      totalDaysOff: 9,
      efficiency: 9 / 5,
    });
  });

  it('bridges across a holiday directly adjacent to a weekend', () => {
    // Thu workday, Fri holiday, Sat/Sun weekend, Mon workday.
    const calendar = [
      day('2026-04-30', 'workday'),
      day('2026-05-01', 'holiday'),
      day('2026-05-02', 'weekend'),
      day('2026-05-03', 'weekend'),
      day('2026-05-04', 'workday'),
    ];

    const candidates = findBridges(calendar, 1);
    expect(candidates).toEqual([
      // PTO on Apr 30 bridges into the May 1 holiday + weekend.
      {
        startDate: '2026-04-30',
        endDate: '2026-05-03',
        ptoUsed: 1,
        totalDaysOff: 4,
        efficiency: 4,
      },
      // PTO on May 4 bridges back through the same holiday + weekend.
      {
        startDate: '2026-05-01',
        endDate: '2026-05-04',
        ptoUsed: 1,
        totalDaysOff: 4,
        efficiency: 4,
      },
    ]);
  });

  it('bounds a gap that touches the start or end of the calendar (year boundary)', () => {
    // No holidays: 2026-01-01 is a Thursday, 2026-12-31 is a Thursday.
    const calendar = buildCalendar(2026, []);

    const candidates = findBridges(calendar, 4);

    // Jan 1-2 (Thu/Fri) has no day before it in the calendar, only the
    // weekend after (Jan 3-4).
    expect(candidates).toContainEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-04',
      ptoUsed: 2,
      totalDaysOff: 4,
      efficiency: 2,
    });

    // Dec 28-31 (Mon-Thu) has no day after it in the calendar, only the
    // weekend before (Dec 26-27).
    expect(candidates).toContainEqual({
      startDate: '2026-12-26',
      endDate: '2026-12-31',
      ptoUsed: 4,
      totalDaysOff: 6,
      efficiency: 1.5,
    });
  });

  it('ranks candidates by efficiency descending, then totalDaysOff descending', () => {
    // Two 1-day gaps, each bounded by too-long workday buffers (excluded at
    // availableDays=1) so only the two gaps themselves qualify. The gap
    // found FIRST during the scan (06-04) has the LOWER efficiency (3), so
    // a correct descending sort must reorder it behind the one found later
    // (06-11, efficiency 6) — a passthrough of discovery order would fail.
    const calendar = [
      day('2026-06-01', 'workday'),
      day('2026-06-02', 'workday'),
      day('2026-06-03', 'weekend'),
      day('2026-06-04', 'workday'), // gap 1: 1 weekend day on each side.
      day('2026-06-05', 'weekend'),
      day('2026-06-06', 'workday'),
      day('2026-06-07', 'workday'),
      day('2026-06-08', 'weekend'),
      day('2026-06-09', 'weekend'),
      day('2026-06-10', 'weekend'),
      day('2026-06-11', 'workday'), // gap 2: 3 weekend days before, 2 after.
      day('2026-06-12', 'weekend'),
      day('2026-06-13', 'weekend'),
      day('2026-06-14', 'workday'),
      day('2026-06-15', 'workday'),
    ];

    const candidates = findBridges(calendar, 1);
    expect(
      candidates.map((c) => ({
        startDate: c.startDate,
        efficiency: c.efficiency,
      })),
    ).toEqual([
      { startDate: '2026-06-08', efficiency: 6 },
      { startDate: '2026-06-03', efficiency: 3 },
    ]);
  });
});

describe('combineBridges', () => {
  const bridgeA = {
    startDate: '2026-01-01',
    endDate: '2026-01-04',
    ptoUsed: 1,
    totalDaysOff: 4,
    efficiency: 4,
  };
  const bridgeB = {
    startDate: '2026-02-01',
    endDate: '2026-02-03',
    ptoUsed: 1,
    totalDaysOff: 3,
    efficiency: 3,
  };
  const bridgeC = {
    startDate: '2026-01-03',
    endDate: '2026-01-06',
    ptoUsed: 2,
    totalDaysOff: 4,
    efficiency: 2,
  };

  it('greedily selects non-overlapping candidates within the budget, highest efficiency first', () => {
    const plan = combineBridges([bridgeA, bridgeB, bridgeC], 5);
    expect(plan.bridges).toEqual([bridgeA, bridgeB]);
    expect(plan.ptoUsed).toBe(2);
    expect(plan.totalDaysOff).toBe(7);
  });

  it('skips a candidate that overlaps an already-selected one, even under budget', () => {
    // bridgeC overlaps bridgeA's date range (Jan 3-4).
    const plan = combineBridges([bridgeA, bridgeC], 5);
    expect(plan.bridges).toEqual([bridgeA]);
  });

  it('stops once the budget is exhausted', () => {
    const plan = combineBridges([bridgeA, bridgeB], 1);
    expect(plan.bridges).toEqual([bridgeA]);
    expect(plan.ptoUsed).toBe(1);
  });

  it('returns an empty plan when given no candidates', () => {
    expect(combineBridges([], 5)).toEqual({
      bridges: [],
      ptoUsed: 0,
      totalDaysOff: 0,
    });
  });
});
