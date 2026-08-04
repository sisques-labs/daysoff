export const es = {
  siteTitle: 'daysoff — calculadora de puentes vacacionales',
  heading: 'daysoff',
  tagline:
    'Encuentra la combinación óptima de días de vacaciones para maximizar tu tiempo libre consecutivo.',

  form: {
    regionLabel: 'Comunidad autónoma',
    yearLabel: 'Año',
    availableDaysLabel: 'Días de vacaciones disponibles',
  },

  results: {
    heading: 'Resultados',
    empty: 'No hay puentes disponibles con estos días de vacaciones.',
    combinedPlanHeading: 'Plan combinado',
    combinedPlanSummary: (ptoUsed: number, totalDaysOff: number) =>
      `${ptoUsed} ${ptoUsed === 1 ? 'día' : 'días'} de vacaciones → ${totalDaysOff} ${totalDaysOff === 1 ? 'día libre' : 'días libres'}`,
    individualHeading: 'Puentes individuales',
    topPick: 'Mejor opción',
    ptoUsed: (n: number) =>
      `${n} ${n === 1 ? 'día de vacaciones' : 'días de vacaciones'}`,
    totalDaysOff: (n: number) =>
      `${n} ${n === 1 ? 'día libre' : 'días libres'}`,
    efficiency: (ratio: number) => `${ratio.toFixed(2)}× eficiencia`,
  },

  calendar: {
    heading: 'Calendario',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    weekdays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as string[],
    legend: {
      holiday: 'Festivo',
      weekend: 'Fin de semana',
      workday: 'Día laborable',
      pto: 'Vacaciones sugeridas',
    },
  },

  theme: {
    switchToLight: 'Cambiar a tema claro',
    switchToDark: 'Cambiar a tema oscuro',
  },

  language: {
    switcherLabel: 'Idioma',
  },
};

export type Strings = typeof es;
