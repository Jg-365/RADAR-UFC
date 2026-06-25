import { config } from "../../core/config.js";
import { qs, el, mount } from "../../core/dom.js";
import {
  manifestationService,
  Sort,
} from "../../services/ManifestationService.js";
import {
  selectField,
  pagination,
  skeletonList,
  emptyState,
} from "../../ui/components.js";
import { manifestationItem } from "../../ui/manifestation-item.js";
import { icons } from "../../ui/icon.js";
import {
  categoryLabels,
  sectorLabels,
  statusLabels,
  toOptions,
} from "../../shared/labels.js";
import { PUBLIC_STATUSES } from "../../shared/enums.js";
import { Period, periodOptions, periodSince } from "../../shared/periods.js";
import { formatNumber } from "../../shared/formatters.js";

const SKELETON_COUNT = 4;
const SEARCH_DEBOUNCE_MS = 300;

const PARAMS = Object.freeze({
  term: config.searchParam,
  category: "categoria",
  sector: "setor",
  status: "status",
  sort: "ordenar",
  period: "periodo",
  page: "pagina",
});

const sortOptions = [
  { value: Sort.recent, label: "Mais recentes" },
  { value: Sort.oldest, label: "Mais antigas" },
  { value: Sort.updated, label: "Atualizadas" },
];

const statusOptions = PUBLIC_STATUSES.map((status) => ({
  value: status,
  label: statusLabels[status],
}));

const readState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    term: params.get(PARAMS.term) ?? "",
    category: params.get(PARAMS.category) ?? "",
    sector: params.get(PARAMS.sector) ?? "",
    status: params.get(PARAMS.status) ?? "",
    sort: params.get(PARAMS.sort) ?? Sort.recent,
    period: params.get(PARAMS.period) ?? Period.all,
    page: Number(params.get(PARAMS.page)) || 1,
  };
};

const writeState = (state) => {
  const params = new URLSearchParams();
  if (state.term) params.set(PARAMS.term, state.term);
  if (state.category) params.set(PARAMS.category, state.category);
  if (state.sector) params.set(PARAMS.sector, state.sector);
  if (state.status) params.set(PARAMS.status, state.status);
  if (state.sort !== Sort.recent) params.set(PARAMS.sort, state.sort);
  if (state.period !== Period.all) params.set(PARAMS.period, state.period);
  if (state.page > 1) params.set(PARAMS.page, String(state.page));
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname
  );
};

let state = readState();

const update = (patch) => {
  const resetsPage = !("page" in patch);
  state = { ...state, ...patch, ...(resetsPage ? { page: 1 } : {}) };
  writeState(state);
  renderResults();
};

const renderFilters = () => {
  const host = qs("[data-filters]");
  if (!host) return;

  const search = el("input", {
    className: "input",
    attrs: {
      type: "search",
      value: state.term,
      placeholder: "Buscar por título, texto ou protocolo",
      "aria-label": "Buscar manifestações",
    },
  });

  let timer;
  search.addEventListener("input", (event) => {
    window.clearTimeout(timer);
    const value = event.target.value.trim();
    timer = window.setTimeout(() => update({ term: value }), SEARCH_DEBOUNCE_MS);
  });

  const controls = el("div", { className: "filters__controls" }, [
    selectField({
      label: "Categoria",
      name: PARAMS.category,
      value: state.category,
      placeholder: "Todas",
      options: toOptions(categoryLabels),
      onChange: (value) => update({ category: value }),
    }),
    selectField({
      label: "Setor",
      name: PARAMS.sector,
      value: state.sector,
      placeholder: "Todos",
      options: toOptions(sectorLabels),
      onChange: (value) => update({ sector: value }),
    }),
    selectField({
      label: "Status",
      name: PARAMS.status,
      value: state.status,
      placeholder: "Todos",
      options: statusOptions,
      onChange: (value) => update({ status: value }),
    }),
    selectField({
      label: "Período",
      name: PARAMS.period,
      value: state.period,
      options: periodOptions(),
      onChange: (value) => update({ period: value }),
    }),
  ]);

  mount(
    host,
    el("div", { className: "filters" }, [
      el("div", { className: "filters__search" }, [search]),
      controls,
    ])
  );
};

const renderToolbar = (total) => {
  const host = qs("[data-toolbar]");
  if (!host) return;

  mount(
    host,
    el("div", { className: "cluster cluster--between" }, [
      el("p", {
        className: "results-count",
        text: `${formatNumber(total)} ${
          total === 1 ? "manifestação" : "manifestações"
        }`,
      }),
      selectField({
        label: "Ordenar",
        name: PARAMS.sort,
        value: state.sort,
        options: sortOptions,
        onChange: (value) => update({ sort: value }),
      }),
    ])
  );
};

async function renderResults() {
  const results = qs("[data-results]");
  const pager = qs("[data-pagination]");
  if (!results) return;

  mount(results, skeletonList(SKELETON_COUNT));
  if (pager) pager.replaceChildren();

  const { items, total, page, pages } = await manifestationService.query({
    term: state.term,
    category: state.category,
    sector: state.sector,
    status: state.status,
    since: periodSince(state.period),
    sort: state.sort,
    page: state.page,
    onlyPublic: true,
  });

  state.page = page;
  renderToolbar(total);

  if (items.length === 0) {
    mount(
      results,
      emptyState({
        iconName: icons.search,
        title: "Nenhuma manifestação encontrada",
        text: "Ajuste os filtros ou a busca para ver outros resultados.",
      })
    );
    return;
  }

  mount(results, el("div", { className: "stack" }, items.map(manifestationItem)));

  if (pager && pages > 1) {
    mount(pager, pagination({ page, pages, onSelect: (value) => update({ page: value }) }));
  }
}

renderFilters();
renderResults();
