export type HolidayScope = 'national' | 'regional';

export interface Holiday {
  date: string;
  name: string;
  scope: HolidayScope;
}

export interface HolidayCalendar {
  country: string;
  region: string;
  year: number;
  holidays: Holiday[];
}

// On-disk shape (see es-<year>.json): national holidays are listed once and
// each region only carries the delta it adds on top — its own regional days,
// plus substitute days for a national holiday that region observes (moving
// a holiday off a Sunday is a per-region decision, not a national one).
// Mirrors how the date-holidays npm package structures its own data.
export interface RegionHolidays {
  label: string;
  holidays: Holiday[];
}

export interface CountryHolidayData {
  country: string;
  year: number;
  national: Holiday[];
  regions: Record<string, RegionHolidays>;
}
