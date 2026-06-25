import { qs, el, mount } from "../../core/dom.js";
import { bus, events } from "../../core/event-bus.js";
import { metricsService } from "../../services/MetricsService.js";
import { barChart } from "../../ui/chart.js";
import { metric, emptyState, selectField } from "../../ui/components.js";
import { icons } from "../../ui/icon.js";
import { statusLabels, categoryLabels, sectorLabels } from "../../shared/labels.js";
import { Period, periodOptions, periodSince } from "../../shared/periods.js";
import {
  formatNumber,
  formatPercent,
  formatDays,
} from "../../shared/formatters.js";

const RESIZE_DEBOUNCE_MS = 150;

const periodState = { period: Period.all };
let charts = [];

const toItems = (counts, labels) =>
  Object.entries(counts)
    .map(([key, value]) => ({ label: labels[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);

const drawAll = () => charts.forEach((entry) => barChart(entry.canvas, entry.items));

const chartCard = (title, items) => {
  const canvas = el("canvas", { className: "chart" });
  charts.push({ canvas, items });
  return el("div", { className: "chart-card stack stack--tight" }, [
    el("h3", { text: title }),
    canvas,
  ]);
};

const kpiRow = (overview) =>
  el("div", { className: "grid grid--4" }, [
    metric({ value: formatNumber(overview.total), label: "Manifestações" }),
    metric({ value: formatNumber(overview.resolved), label: "Resolvidas" }),
    metric({ value: formatPercent(overview.resolutionRate), label: "Taxa de resolução" }),
    metric({ value: formatDays(overview.avgResolutionDays), label: "Tempo médio" }),
  ]);

const filterRow = () =>
  el("div", { className: "cluster cluster--between" }, [
    el("p", { className: "text-muted", text: "Dados agregados, sem identificação pessoal." }),
    selectField({
      label: "Período",
      name: "period",
      value: periodState.period,
      options: periodOptions(),
      onChange: (value) => {
        periodState.period = value;
        load();
      },
    }),
  ]);

const render = (host, overview) => {
  charts = [];

  const header = el("div", { className: "stack stack--tight" }, [
    el("p", { className: "eyebrow", text: "Transparência" }),
    el("h1", { text: "Indicadores públicos" }),
  ]);

  if (overview.total === 0) {
    mount(
      host,
      el("div", { className: "stack stack--loose" }, [
        header,
        filterRow(),
        emptyState({
          iconName: icons.chart,
          title: "Sem dados no período",
          text: "Não há manifestações registradas para o período selecionado.",
        }),
      ])
    );
    return;
  }

  mount(
    host,
    el("div", { className: "stack stack--loose" }, [
      header,
      filterRow(),
      kpiRow(overview),
      el("div", { className: "grid grid--3 transparency__charts" }, [
        chartCard("Por status", toItems(overview.byStatus, statusLabels)),
        chartCard("Por categoria", toItems(overview.byCategory, categoryLabels)),
        chartCard("Por setor", toItems(overview.bySector, sectorLabels)),
      ]),
    ])
  );

  drawAll();
};

async function load() {
  const host = qs("[data-transparency]");
  if (!host) return;
  const overview = await metricsService.overview({
    since: periodSince(periodState.period),
  });
  render(host, overview);
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(drawAll, RESIZE_DEBOUNCE_MS);
});

bus.on(events.themeChanged, drawAll);

load();
