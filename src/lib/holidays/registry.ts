import type { HolidayCalendar } from './types';
import andalucia from './es-andalucia-2026.json';
import aragon from './es-aragon-2026.json';
import asturias from './es-asturias-2026.json';
import canarias from './es-canarias-2026.json';
import cantabria from './es-cantabria-2026.json';
import castillaLaMancha from './es-castilla-la-mancha-2026.json';
import castillaYLeon from './es-castilla-y-leon-2026.json';
import cataluna from './es-cataluna-2026.json';
import comunidadValenciana from './es-comunidad-valenciana-2026.json';
import extremadura from './es-extremadura-2026.json';
import galicia from './es-galicia-2026.json';
import islasBaleares from './es-islas-baleares-2026.json';
import laRioja from './es-la-rioja-2026.json';
import madrid from './es-madrid-2026.json';
import murcia from './es-murcia-2026.json';
import navarra from './es-navarra-2026.json';
import paisVasco from './es-pais-vasco-2026.json';

export interface RegionOption {
  slug: string;
  label: string;
}

// Sorted alphabetically by label for the region selector.
export const regions: RegionOption[] = [
  { slug: 'andalucia', label: 'Andalucía' },
  { slug: 'aragon', label: 'Aragón' },
  { slug: 'asturias', label: 'Asturias' },
  { slug: 'islas-baleares', label: 'Islas Baleares' },
  { slug: 'canarias', label: 'Canarias' },
  { slug: 'cantabria', label: 'Cantabria' },
  { slug: 'castilla-la-mancha', label: 'Castilla-La Mancha' },
  { slug: 'castilla-y-leon', label: 'Castilla y León' },
  { slug: 'cataluna', label: 'Cataluña' },
  { slug: 'comunidad-valenciana', label: 'Comunidad Valenciana' },
  { slug: 'extremadura', label: 'Extremadura' },
  { slug: 'galicia', label: 'Galicia' },
  { slug: 'madrid', label: 'Madrid' },
  { slug: 'murcia', label: 'Murcia' },
  { slug: 'navarra', label: 'Navarra' },
  { slug: 'pais-vasco', label: 'País Vasco' },
  { slug: 'la-rioja', label: 'La Rioja' },
];

export const years: number[] = [2026];

// JSON module imports widen `scope` to `string`, not the `HolidayScope`
// literal union — the data is generated from a JSON schema (see the region
// files), so this cast just restores the type we already know holds.
const calendarsByYear: Record<number, Record<string, HolidayCalendar>> = {
  2026: {
    andalucia,
    aragon,
    asturias,
    'islas-baleares': islasBaleares,
    canarias,
    cantabria,
    'castilla-la-mancha': castillaLaMancha,
    'castilla-y-leon': castillaYLeon,
    cataluna,
    'comunidad-valenciana': comunidadValenciana,
    extremadura,
    galicia,
    madrid,
    murcia,
    navarra,
    'pais-vasco': paisVasco,
    'la-rioja': laRioja,
  } as Record<string, HolidayCalendar>,
};

export function getHolidayCalendar(
  region: string,
  year: number,
): HolidayCalendar | undefined {
  return calendarsByYear[year]?.[region];
}
