import { describe, expect, it } from 'vitest';
import { buildCalendar, findBridges } from './optimizer';
import type { Holiday } from './holidays/types';

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
    const saturday = calendar.find((day) => day.date === '2026-01-03');
    const sunday = calendar.find((day) => day.date === '2026-01-04');
    expect(saturday?.type).toBe('weekend');
    expect(sunday?.type).toBe('weekend');
  });

  it('tags every other day as a workday', () => {
    const calendar = buildCalendar(2026, holidays);
    // 2026-01-02 is a Friday with no holiday.
    const workday = calendar.find((day) => day.date === '2026-01-02');
    expect(workday?.type).toBe('workday');
  });
});

describe('findBridges', () => {
  it('is not implemented yet and returns no candidates', () => {
    const calendar = buildCalendar(2026, []);
    expect(findBridges(calendar, 5)).toEqual([]);
  });
});
