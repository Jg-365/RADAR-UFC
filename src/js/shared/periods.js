const DAY_MS = 1000 * 60 * 60 * 24;

export const Period = Object.freeze({
  all: "all",
  week: "week",
  month: "month",
  quarter: "quarter",
  year: "year",
});

export const periodLabels = Object.freeze({
  [Period.all]: "Qualquer data",
  [Period.week]: "Últimos 7 dias",
  [Period.month]: "Últimos 30 dias",
  [Period.quarter]: "Últimos 90 dias",
  [Period.year]: "Último ano",
});

const periodDays = Object.freeze({
  [Period.week]: 7,
  [Period.month]: 30,
  [Period.quarter]: 90,
  [Period.year]: 365,
});

export const periodSince = (value) => {
  const days = periodDays[value];
  if (!days) return "";
  return new Date(Date.now() - days * DAY_MS).toISOString();
};

export const periodOptions = () =>
  Object.entries(periodLabels).map(([value, label]) => ({ value, label }));
