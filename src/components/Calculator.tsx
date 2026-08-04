import { useEffect, useMemo, useState } from 'react';
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
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
    case 'weekend':
      return 'bg-stone-100 text-stone-400';
    case 'pto':
      return 'bg-amber-400 text-white font-semibold shadow-sm shadow-amber-500/40';
    default:
      return 'bg-white text-stone-700 ring-1 ring-inset ring-stone-100';
  }
}

function legendDotClass(type: CalendarDay['type'] | 'pto'): string {
  switch (type) {
    case 'holiday':
      return 'bg-rose-400';
    case 'weekend':
      return 'bg-stone-400';
    case 'pto':
      return 'bg-amber-400';
    default:
      return 'bg-white ring-1 ring-inset ring-stone-300';
  }
}

function LegendItem({
  type,
  label,
}: {
  type: CalendarDay['type'] | 'pto';
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
      <span className={`h-2 w-2 rounded-full ${legendDotClass(type)}`} />
      {label}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
      <span className="h-5 w-1.5 shrink-0 rounded-full bg-amber-400" />
      {children}
    </h2>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
    </svg>
  );
}

function MonthNav({
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={t.calendar.previousMonth}
        onClick={onPrevious}
        disabled={disablePrevious}
        className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label={t.calendar.nextMonth}
        onClick={onNext}
        disabled={disableNext}
        className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
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
    <div className="rounded-xl border border-stone-100 p-3">
      <p className="text-sm font-semibold capitalize text-stone-700">{label}</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((weekday, i) => (
          <div
            key={`${weekday}-${i}`}
            className="py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400"
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
            <div
              key={cell.date}
              className={`rounded-lg py-2 ${dayClass(type)}`}
            >
              {Number(cell.date.slice(-2))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BridgeRow({
  bridge,
  rank,
  isTop,
}: {
  bridge: BridgeCandidate;
  rank: number;
  isTop: boolean;
}) {
  return (
    <li className="group flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-stone-50">
      <span className="w-8 shrink-0 text-center text-lg font-bold tabular-nums text-stone-200 transition group-hover:text-amber-400">
        {String(rank).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-stone-800">
          {formatRange(bridge.startDate, bridge.endDate)}
          {isTop && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              {t.results.topPick}
            </span>
          )}
        </p>
        <p className="text-sm text-stone-500">
          {t.results.ptoUsed(bridge.ptoUsed)} →{' '}
          {t.results.totalDaysOff(bridge.totalDaysOff)}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
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

  const [viewMonth, setViewMonth] = useState(() => new Date().getUTCMonth());
  const topStartDate = topResult?.startDate;

  // Jump the calendar to the top recommendation whenever it changes, but
  // leave it alone otherwise so browsing with the arrows isn't reset on
  // every render.
  useEffect(() => {
    if (topStartDate) setViewMonth(parseDate(topStartDate).getUTCMonth());
  }, [topStartDate]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {t.form.regionLabel}
            </span>
            <select
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
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
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {t.form.yearLabel}
            </span>
            <select
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
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
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {t.form.availableDaysLabel}
            </span>
            <input
              type="number"
              min={0}
              max={365}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              value={availableDays}
              onChange={(e) =>
                setAvailableDays(Math.max(0, Number(e.target.value)))
              }
            />
          </label>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2">
            <SectionHeading>{t.calendar.heading}</SectionHeading>
            <MonthNav
              onPrevious={() => setViewMonth((m) => Math.max(0, m - 1))}
              onNext={() => setViewMonth((m) => Math.min(11, m + 1))}
              disablePrevious={viewMonth === 0}
              disableNext={viewMonth === 11}
            />
          </div>
          <div className="mt-4">
            <MonthGrid
              year={year}
              month={viewMonth}
              calendarByDate={calendarByDate}
              ptoDates={ptoDates}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <LegendItem type="holiday" label={t.calendar.legend.holiday} />
            <LegendItem type="weekend" label={t.calendar.legend.weekend} />
            <LegendItem type="pto" label={t.calendar.legend.pto} />
            <LegendItem type="workday" label={t.calendar.legend.workday} />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <SectionHeading>{t.results.heading}</SectionHeading>

          {candidates.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.results.empty}</p>
          ) : (
            <>
              {combinedPlan.bridges.length > 1 && (
                <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/70 p-4">
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

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-stone-400">
                {t.results.individualHeading}
              </h3>
              <ul className="mt-1 divide-y divide-stone-100">
                {candidates.slice(0, 8).map((bridge, i) => (
                  <BridgeRow
                    key={bridge.startDate}
                    bridge={bridge}
                    rank={i + 1}
                    isTop={i === 0}
                  />
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
