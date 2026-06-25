import { qs, el, mount, fragment } from "../../core/dom.js";
import { metricsService } from "../../services/MetricsService.js";
import { manifestationService } from "../../services/ManifestationService.js";
import { metric, emptyState, skeletonList } from "../../ui/components.js";
import { manifestationItem } from "../../ui/manifestation-item.js";
import { icons } from "../../ui/icon.js";
import {
  formatNumber,
  formatPercent,
  formatDays,
} from "../../shared/formatters.js";

const RECENT_LIMIT = 3;
const METRIC_COUNT = 3;

const skeletonMetric = () =>
  el("div", { className: "metric" }, [
    el("div", { className: "skeleton skeleton--title" }),
    el("div", { className: "skeleton skeleton--line skeleton--meta" }),
  ]);

const renderMetrics = async () => {
  const host = qs("[data-home-metrics]");
  if (!host) return;

  mount(host, fragment(Array.from({ length: METRIC_COUNT }, skeletonMetric)));

  const data = await metricsService.overview();
  const cards = [
    { value: formatNumber(data.total), label: "Manifestações registradas" },
    { value: formatPercent(data.resolutionRate), label: "Taxa de resolução" },
    { value: formatDays(data.avgResolutionDays), label: "Tempo médio de resposta" },
  ];
  mount(host, fragment(cards.map(metric)));
};

const renderRecent = async () => {
  const host = qs("[data-home-recent]");
  if (!host) return;

  mount(host, skeletonList(RECENT_LIMIT));

  const { items } = await manifestationService.query({
    onlyPublic: true,
    pageSize: RECENT_LIMIT,
  });

  if (items.length === 0) {
    mount(
      host,
      emptyState({
        iconName: icons.radar,
        title: "Nenhuma manifestação pública ainda",
        text: "Quando houver manifestações publicadas, elas aparecem aqui.",
      })
    );
    return;
  }

  mount(host, fragment(items.map(manifestationItem)));
};

renderMetrics();
renderRecent();
