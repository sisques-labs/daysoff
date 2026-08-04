import { useEffect, useMemo, useRef, useState } from 'react';
import { locales, defaultLocale } from '../lib/i18n';
import type { Locale, Strings } from '../lib/i18n';
import { regions, years, getHolidayCalendar } from '../lib/holidays/registry';
import { buildCalendar, combineBridges, findBridges } from '../lib/optimizer';
import type { BridgeCandidate, CalendarDay } from '../lib/optimizer';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const LOCALE_STORAGE_KEY = 'daysoff:locale';
const THEME_STORAGE_KEY = 'daysoff:theme';

function createFormatters(locale: Locale) {
  const intlLocale = locale === 'en' ? 'en-US' : 'es-ES';
  return {
    day: new Intl.DateTimeFormat(intlLocale, {
      day: 'numeric',
      month: 'short',
    }),
    dayYear: new Intl.DateTimeFormat(intlLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    month: new Intl.DateTimeFormat(intlLocale, {
      month: 'long',
      year: 'numeric',
    }),
  };
}

type Formatters = ReturnType<typeof createFormatters>;

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day));
}

function formatRange(
  startDate: string,
  endDate: string,
  formatters: Formatters,
): string {
  return `${formatters.day.format(parseDate(startDate))} – ${formatters.dayYear.format(parseDate(endDate))}`;
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
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800/60';
    case 'weekend':
      return 'bg-stone-100 text-stone-400 dark:bg-stone-900 dark:text-stone-600';
    case 'pto':
      return 'bg-amber-400 text-white font-semibold shadow-sm shadow-amber-500/40 dark:shadow-amber-500/20';
    default:
      return 'bg-white text-stone-700 ring-1 ring-inset ring-stone-100 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700';
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
      return 'bg-white ring-1 ring-inset ring-stone-300 dark:bg-stone-800 dark:ring-stone-600';
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
      <span className={`h-2 w-2 rounded-full ${legendDotClass(type)}`} />
      {label}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-stone-100">
      <span className="h-5 w-1.5 shrink-0 rounded-full bg-amber-400" />
      {children}
    </h2>
  );
}

function SunriseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v7" />
      <circle cx="12" cy="14" r="3.5" fill="currentColor" stroke="none" />
      <path d="M4 19h16" />
      <path d="m7.5 16.5 1.5-1.5M16.5 16.5 15 15" />
    </svg>
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
  t,
}: {
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
  t: Strings;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={t.calendar.previousMonth}
        onClick={onPrevious}
        disabled={disablePrevious}
        className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label={t.calendar.nextMonth}
        onClick={onNext}
        disabled={disableNext}
        className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
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
  todayStr,
  weekdays,
  monthFormatter,
}: {
  year: number;
  month: number;
  calendarByDate: Map<string, CalendarDay>;
  ptoDates: Set<string>;
  todayStr: string;
  weekdays: string[];
  monthFormatter: Intl.DateTimeFormat;
}) {
  const cells = buildMonthGrid(year, month);
  const label = monthFormatter.format(new Date(Date.UTC(year, month, 1)));

  return (
    <div className="rounded-xl border border-stone-100 p-3 dark:border-stone-800">
      <p className="text-sm font-semibold capitalize text-stone-700 dark:text-stone-200">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs">
        {weekdays.map((weekday, i) => (
          <div
            key={`${weekday}-${i}`}
            className="py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500"
          >
            {weekday}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={`blank-${i}`} />;
          const day = calendarByDate.get(cell.date);
          const type =
            day && ptoDates.has(cell.date) ? 'pto' : (day?.type ?? 'workday');
          const isPast = cell.date < todayStr;
          return (
            <div
              key={cell.date}
              className={`rounded-lg py-2 ${dayClass(type)} ${isPast ? 'opacity-40' : ''}`}
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
  isSelected,
  onSelect,
  t,
  formatters,
}: {
  bridge: BridgeCandidate;
  rank: number;
  isTop: boolean;
  isSelected: boolean;
  onSelect: () => void;
  t: Strings;
  formatters: Formatters;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800/60 ${
          isSelected
            ? 'bg-amber-50 ring-1 ring-inset ring-amber-300 dark:bg-amber-400/10 dark:ring-amber-400/30'
            : ''
        }`}
      >
        <span className="w-8 shrink-0 text-center text-lg font-bold tabular-nums text-stone-200 transition group-hover:text-amber-400 dark:text-stone-700">
          {String(rank).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-medium text-stone-800 dark:text-stone-100">
            {formatRange(bridge.startDate, bridge.endDate, formatters)}
            {isTop && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                {t.results.topPick}
              </span>
            )}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t.results.ptoUsed(bridge.ptoUsed)} →{' '}
            {t.results.totalDaysOff(bridge.totalDaysOff)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
          {t.results.efficiency(bridge.efficiency)}
        </span>
      </button>
    </li>
  );
}

export default function Calculator() {
  // Both default to the server-rendered values so the first client render
  // matches the SSR output exactly; the real preference (storage, browser
  // language, prefers-color-scheme) is applied right after mount instead
  // of during the initial render, which would desync from the server HTML
  // and break hydration.
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const t = locales[locale];
  const formatters = useMemo(() => createFormatters(locale), [locale]);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale === 'es' || storedLocale === 'en') {
      setLocale(storedLocale);
    } else if (window.navigator.language.toLowerCase().startsWith('en')) {
      setLocale('en');
    }

    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
  // Past days are gone — there's no point suggesting PTO for a bridge
  // that's already over, so bridges are only ever found from today on.
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const upcomingCalendar = useMemo(
    () => calendar.filter((day) => day.date >= todayStr),
    [calendar, todayStr],
  );
  const candidates = useMemo(
    () => findBridges(upcomingCalendar, availableDays),
    [upcomingCalendar, availableDays],
  );
  const combinedPlan = useMemo(
    () => combineBridges(candidates, availableDays),
    [candidates, availableDays],
  );
  const topResult = candidates[0];

  // Which bridge is currently highlighted on the calendar. Defaults to the
  // top recommendation; clicking a row in either list overrides it.
  const [selectedStartDate, setSelectedStartDate] = useState<
    string | undefined
  >(undefined);

  const selectedBridge = useMemo(() => {
    if (selectedStartDate) {
      const fromCandidates = candidates.find(
        (b) => b.startDate === selectedStartDate,
      );
      if (fromCandidates) return fromCandidates;
      const fromPlan = combinedPlan.bridges.find(
        (b) => b.startDate === selectedStartDate,
      );
      if (fromPlan) return fromPlan;
    }
    return topResult;
  }, [selectedStartDate, candidates, combinedPlan, topResult]);

  // The candidate list is rebuilt from scratch whenever the inputs change,
  // so a stale selection should fall back to the new top pick rather than
  // silently pointing at a bridge that no longer exists.
  useEffect(() => {
    setSelectedStartDate(undefined);
  }, [region, year, availableDays]);

  const ptoDates = useMemo(() => {
    if (!selectedBridge) return new Set<string>();
    const dates = new Set<string>();
    for (const day of calendar) {
      if (
        day.date >= selectedBridge.startDate &&
        day.date <= selectedBridge.endDate &&
        day.type === 'workday'
      ) {
        dates.add(day.date);
      }
    }
    return dates;
  }, [calendar, selectedBridge]);

  const [viewMonth, setViewMonth] = useState(() => new Date().getUTCMonth());
  const calendarSectionRef = useRef<HTMLElement>(null);
  const selectedStart = selectedBridge?.startDate;

  // Jump the calendar to whichever bridge is selected (top recommendation
  // by default) whenever it changes, but leave it alone otherwise so
  // browsing with the arrows isn't reset on every render.
  useEffect(() => {
    if (selectedStart) setViewMonth(parseDate(selectedStart).getUTCMonth());
  }, [selectedStart]);

  function selectBridge(bridge: BridgeCandidate) {
    setSelectedStartDate(bridge.startDate);
    calendarSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 dark:shadow-amber-500/20">
            <SunriseIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              {t.heading}
            </h1>
            <p className="mt-1 max-w-xl text-stone-600 dark:text-stone-400">
              {t.tagline}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher
            locale={locale}
            onChange={setLocale}
            label={t.language.switcherLabel}
          />
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
            }
            t={t}
          />
        </div>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.form.regionLabel}
            </span>
            <select
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-800"
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
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.form.yearLabel}
            </span>
            <select
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-800"
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
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.form.availableDaysLabel}
            </span>
            <input
              type="number"
              min={0}
              max={365}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-800"
              value={availableDays}
              onChange={(e) =>
                setAvailableDays(Math.max(0, Number(e.target.value)))
              }
            />
          </label>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section
          ref={calendarSectionRef}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between gap-2">
            <SectionHeading>{t.calendar.heading}</SectionHeading>
            <MonthNav
              onPrevious={() => setViewMonth((m) => Math.max(0, m - 1))}
              onNext={() => setViewMonth((m) => Math.min(11, m + 1))}
              disablePrevious={viewMonth === 0}
              disableNext={viewMonth === 11}
              t={t}
            />
          </div>
          <div className="mt-4">
            <MonthGrid
              year={year}
              month={viewMonth}
              calendarByDate={calendarByDate}
              ptoDates={ptoDates}
              todayStr={todayStr}
              weekdays={t.calendar.weekdays}
              monthFormatter={formatters.month}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <LegendItem type="holiday" label={t.calendar.legend.holiday} />
            <LegendItem type="weekend" label={t.calendar.legend.weekend} />
            <LegendItem type="pto" label={t.calendar.legend.pto} />
            <LegendItem type="workday" label={t.calendar.legend.workday} />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <SectionHeading>{t.results.heading}</SectionHeading>

          {candidates.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              {t.results.empty}
            </p>
          ) : (
            <>
              {combinedPlan.bridges.length > 1 && (
                <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/70 p-4 dark:border-emerald-400 dark:bg-emerald-400/10">
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    {t.results.combinedPlanHeading}
                  </h3>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    {t.results.combinedPlanSummary(
                      combinedPlan.ptoUsed,
                      combinedPlan.totalDaysOff,
                    )}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800 dark:text-emerald-300">
                    {combinedPlan.bridges.map((bridge) => (
                      <li key={bridge.startDate}>
                        <button
                          type="button"
                          onClick={() => selectBridge(bridge)}
                          aria-pressed={
                            selectedBridge?.startDate === bridge.startDate
                          }
                          className={`w-full rounded-lg px-2 py-1 text-left transition hover:bg-emerald-100/70 dark:hover:bg-emerald-400/10 ${
                            selectedBridge?.startDate === bridge.startDate
                              ? 'bg-emerald-100 font-semibold dark:bg-emerald-400/20'
                              : ''
                          }`}
                        >
                          {formatRange(
                            bridge.startDate,
                            bridge.endDate,
                            formatters,
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                {t.results.individualHeading}
              </h3>
              <ul className="mt-1 divide-y divide-stone-100 dark:divide-stone-800">
                {candidates.slice(0, 8).map((bridge, i) => (
                  <BridgeRow
                    key={bridge.startDate}
                    bridge={bridge}
                    rank={i + 1}
                    isTop={i === 0}
                    isSelected={selectedBridge?.startDate === bridge.startDate}
                    onSelect={() => selectBridge(bridge)}
                    t={t}
                    formatters={formatters}
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
