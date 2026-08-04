import type { Locale } from '../lib/i18n';

const options: { value: Locale; label: string }[] = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
];

export default function LanguageSwitcher({
  locale,
  onChange,
  label,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex shrink-0 items-center rounded-full border border-stone-200 bg-white p-0.5 text-xs font-semibold dark:border-stone-700 dark:bg-stone-900"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={locale === option.value}
          className={`rounded-full px-2.5 py-1 transition ${
            locale === option.value
              ? 'bg-amber-400 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
