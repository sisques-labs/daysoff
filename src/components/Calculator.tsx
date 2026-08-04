import { t } from '../lib/i18n';

export default function Calculator() {
  return (
    <section className="rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold">{t.calculatorHeading}</h2>
      <p className="mt-2 text-sm text-slate-500">{t.calculatorComingSoon}</p>
    </section>
  );
}
