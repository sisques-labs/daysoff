import type { Strings } from './es';

export const en: Strings = {
  siteTitle: 'daysoff — vacation bridge calculator',
  heading: 'DaysOff',
  tagline:
    'Find the optimal combination of PTO days to maximize your consecutive time off.',

  form: {
    regionLabel: 'Region',
    yearLabel: 'Year',
    availableDaysLabel: 'Available PTO days',
  },

  results: {
    heading: 'Results',
    empty: 'No bridges available with this many PTO days.',
    combinedPlanHeading: 'Combined plan',
    combinedPlanSummary: (ptoUsed: number, totalDaysOff: number) =>
      `${ptoUsed} PTO ${ptoUsed === 1 ? 'day' : 'days'} → ${totalDaysOff} ${totalDaysOff === 1 ? 'day off' : 'days off'}`,
    individualHeading: 'Individual bridges',
    topPick: 'Top pick',
    ptoUsed: (n: number) => `${n} PTO ${n === 1 ? 'day' : 'days'}`,
    totalDaysOff: (n: number) => `${n} ${n === 1 ? 'day off' : 'days off'}`,
    efficiency: (ratio: number) => `${ratio.toFixed(2)}× efficiency`,
  },

  calendar: {
    heading: 'Calendar',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    legend: {
      holiday: 'Holiday',
      weekend: 'Weekend',
      workday: 'Workday',
      pto: 'Suggested PTO',
    },
  },

  theme: {
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
  },

  language: {
    switcherLabel: 'Language',
  },
};
