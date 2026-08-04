import { en } from './en';

// Only one locale for now — this indirection is what lets us add more
// (e.g. `es`) later without touching call sites.
export const t = en;
export type Strings = typeof en;
