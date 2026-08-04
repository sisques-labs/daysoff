import type { Strings } from '../lib/i18n';

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export default function ThemeToggle({
  theme,
  onToggle,
  t,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
  t: Strings;
}) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? t.theme.switchToLight : t.theme.switchToDark}
      aria-pressed={isDark}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-amber-300 hover:text-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
