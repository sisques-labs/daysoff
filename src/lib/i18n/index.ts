import { es } from './es';
import { en } from './en';
import type { Strings } from './es';

export type { Strings };
export type Locale = 'es' | 'en';

export const locales: Record<Locale, Strings> = { es, en };
export const defaultLocale: Locale = 'es';
