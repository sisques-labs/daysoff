import { useMemo, useState } from 'react';
import { t } from '../lib/i18n';
import { regions, years, getHolidayCalendar } from '../lib/holidays/registry';
import { buildCalendar, combineBridges, findBridges } from '../lib/optimizer';
import type { BridgeCandidate, CalendarDay } from '../lib/optimizer';

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});
const dateFormatterWithYear = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day));
}

function formatRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(parseDate(startDate))} – ${dateFormatterWithYear.format(parseDate(endDate))}`;
}

interface MonthCell {
  date: string | null;
}

function buildMonthGrid(year: number, month: number): MonthCell[] {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay(): 0=Sun..6=Sat. Convert to a Monday-first offset.
  const leadingBlanks = (firstDay.getUTCDay() + 6) % 7;

  const cells: MonthCell[] = Array.from({ length: leadingBlanks }, () => ({
    date: null,
  }));
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month, day))
      .toISOString()
      .slice(0, 10);
    cells.push({ date });
  }
  return cells;
}

function dayClass(type: CalendarDay['type'] | 'pto'): string {
  switch (type) {
    case 'holiday':
      return 'bg-rose-100 text-rose-800';
    case 'weekend':
      return 'bg-slate-100 text-slate-500';
    case 'pto':
      return 'bg-amber-200 text-amber-900 font-semibold';
    default:
      return 'bg-white text-slate-700';
  }
}

function MonthGrid({
  year,
  month,
  calendarByDate,
  ptoDates,
}: {
  year: number;
  month: number;
  calendarByDate: Map<string, CalendarDay>;
  ptoDates: Set<string>;
}) {
  const cells = buildMonthGrid(year, month);
  const label = monthFormatter.format(new Date(Date.UTC(year, month, 1)));

  return (
    <div>
      <p className="text-sm font-medium capitalize text-slate-700">{label}</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((weekday, i) => (
          <div
            key={`${weekday}-${i}`}
            className="py-1 font-medium text-slate-400"
          >
            {weekday}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={`blank-${i}`} />;
          const day = calendarByDate.get(cell.date);
          const type =
            day && ptoDates.has(cell.date) ? 'pto' : (day?.type ?? 'workday');
          return (
            <div key={cell.date} className={`rounded py-1.5 ${dayClass(type)}`}>
              {Number(cell.date.slice(-2))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BridgeRow({ bridge }: { bridge: BridgeCandidate }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div>
        <p className="font-medium text-slate-800">
          {formatRange(bridge.startDate, bridge.endDate)}
        </p>
        <p className="text-sm text-slate-500">
          {t.results.ptoUsed(bridge.ptoUsed)} →{' '}
          {t.results.totalDaysOff(bridge.totalDaysOff)}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        {t.results.efficiency(bridge.efficiency)}
      </span>
    </li>
  );
}

export default function Calculator() {
  const [region, setRegion] = useState(regions[0]!.slug);
  const [year, setYear] = useState(years[0]!);
  const [availableDays, setAvailableDays] = useState(5);

  const holidayCalendar = useMemo(
    () => getHolidayCalendar(region, year),
    [region, year],
  );
  const calendar = useMemo(
    () => buildCalendar(year, holidayCalendar?.holidays ?? []),
    [year, holidayCalendar],
  );
  const calendarByDate = useMemo(
    () => new Map(calendar.map((day) => [day.date, day])),
    [calendar],
  );
  const candidates = useMemo(
    () => findBridges(calendar, availableDays),
    [calendar, availableDays],
  );
  const combinedPlan = useMemo(
    () => combineBridges(candidates, availableDays),
    [candidates, availableDays],
  );
  const topResult = candidates[0];

  const ptoDates = useMemo(() => {
    if (!topResult) return new Set<string>();
    const dates = new Set<string>();
    for (const day of calendar) {
      if (
        day.date >= topResult.startDate &&
        day.date <= topResult.endDate &&
        day.type === 'workday'
      ) {
        dates.add(day.date);
      }
    }
    return dates;
  }, [calendar, topResult]);

  const topMonths = useMemo(() => {
    if (!topResult) return [];
    const start = parseDate(topResult.startDate);
    const end = parseDate(topResult.endDate);
    const months: { year: number; month: number }[] = [
      { year: start.getUTCFullYear(), month: start.getUTCMonth() },
    ];
    if (
      start.getUTCMonth() !== end.getUTCMonth() ||
      start.getUTCFullYear() !== end.getUTCFullYear()
    ) {
      months.push({ year: end.getUTCFullYear(), month: end.getUTCMonth() });
    }
    return months;
  }, [topResult]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-lg border border-slate-200 p-6 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            {t.form.regionLabel}
          </span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            {t.form.yearLabel}
          </span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            {t.form.availableDaysLabel}
          </span>
          <input
            type="number"
            min={0}
            max={365}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={availableDays}
            onChange={(e) =>
              setAvailableDays(Math.max(0, Number(e.target.value)))
            }
          />
        </label>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {t.results.heading}
        </h2>

        {candidates.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.results.empty}</p>
        ) : (
          <>
            {combinedPlan.bridges.length > 1 && (
              <div className="mt-4 rounded-md bg-emerald-50 p-4">
                <h3 className="text-sm font-semibold text-emerald-900">
                  {t.results.combinedPlanHeading}
                </h3>
                <p className="text-sm text-emerald-800">
                  {t.results.combinedPlanSummary(
                    combinedPlan.ptoUsed,
                    combinedPlan.totalDaysOff,
                  )}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                  {combinedPlan.bridges.map((bridge) => (
                    <li key={bridge.startDate}>
                      {formatRange(bridge.startDate, bridge.endDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="mt-4 text-sm font-semibold text-slate-600">
              {t.results.individualHeading}
            </h3>
            <ul className="mt-1">
              {candidates.slice(0, 8).map((bridge) => (
                <BridgeRow key={bridge.startDate} bridge={bridge} />
              ))}
            </ul>
          </>
        )}
      </section>

      {topResult && (
        <section className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {t.calendar.heading}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {topMonths.map(({ year: y, month }) => (
              <MonthGrid
                key={`${y}-${month}`}
                year={y}
                month={month}
                calendarByDate={calendarByDate}
                ptoDates={ptoDates}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className={`rounded px-2 py-1 ${dayClass('holiday')}`}>
              {t.calendar.legend.holiday}
            </span>
            <span className={`rounded px-2 py-1 ${dayClass('weekend')}`}>
              {t.calendar.legend.weekend}
            </span>
            <span className={`rounded px-2 py-1 ${dayClass('pto')}`}>
              {t.calendar.legend.pto}
            </span>
            <span className={`rounded px-2 py-1 ${dayClass('workday')}`}>
              {t.calendar.legend.workday}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
