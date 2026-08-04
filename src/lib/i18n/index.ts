import { es } from './es';

// Only one locale for now — this indirection is what lets us add more
// (e.g. `en`) later without touching call sites.
export const t = es;
export type Strings = typeof es;
