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
