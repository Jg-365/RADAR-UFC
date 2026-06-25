const LOCALE = "pt-BR";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const RELATIVE_DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: "auto",
});

export const formatDate = (value) => dateFormatter.format(new Date(value));

export const formatDateTime = (value) =>
  dateTimeFormatter.format(new Date(value));

export const formatRelative = (value) => {
  let duration = (new Date(value).getTime() - Date.now()) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
};

export const formatNumber = (value) =>
  new Intl.NumberFormat(LOCALE).format(value);

export const formatPercent = (value) =>
  new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDays = (value) => {
  const rounded = Math.round(value);
  return `${rounded} ${rounded === 1 ? "dia" : "dias"}`;
};

export const anonymizeName = (name) => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anônimo";
  return parts
    .map((part, index) =>
      index === 0 ? part : `${part[0].toUpperCase()}.`
    )
    .join(" ");
};

export const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
