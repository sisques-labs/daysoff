import type { CountryHolidayData, HolidayCalendar } from './types';
import es2026 from './es-2026.json';

export interface RegionOption {
  slug: string;
  label: string;
}

// One entry per supported year — JSON module imports widen `scope` to
// `string`, not the `HolidayScope` literal union, so this cast just
// restores the type we already know the generated data holds.
const dataByYear: Record<number, CountryHolidayData> = {
  2026: es2026 as CountryHolidayData,
};

export const years: number[] = Object.keys(dataByYear).map(Number);

export const regions: RegionOption[] = Object.entries(dataByYear[2026]!.regions)
  .map(([slug, region]) => ({ slug, label: region.label }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'));

export function getHolidayCalendar(
  region: string,
  year: number,
): HolidayCalendar | undefined {
  const data = dataByYear[year];
  const regionData = data?.regions[region];
  if (!data || !regionData) return undefined;

  return {
    country: data.country,
    region,
    year: data.year,
    holidays: [...data.national, ...regionData.holidays].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
}
