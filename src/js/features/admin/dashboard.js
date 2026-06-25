import { qs, el, mount, fragment } from "../../core/dom.js";
import { metricsService } from "../../services/MetricsService.js";
import {
  manifestationService,
  Sort,
} from "../../services/ManifestationService.js";
import { adminService } from "../../services/AdminService.js";
import { requireRoles } from "../../ui/guard.js";
import { openDialog } from "../../ui/dialog.js";
import { toast } from "../../ui/toast.js";
import {
  statusPill,
  metric,
  emptyState,
  skeletonList,
} from "../../ui/components.js";
import { icons } from "../../ui/icon.js";
import {
  sectorLabels,
  statusLabels,
  toOptions,
} from "../../shared/labels.js";
import { Role, Status } from "../../shared/enums.js";
import { required, minLength, validateField } from "../../shared/validators.js";
import {
  formatDate,
  formatNumber,
  formatPercent,
} from "../../shared/formatters.js";
import { detailUrl } from "../../shared/routes.js";

const RESPONSE_MIN = 15;
const SKELETON_COUNT = 4;

const user = requireRoles(Role.admin);

const filters = { status: "", sector: "", sort: Sort.updated };

const sortOptions = [
  { value: Sort.updated, label: "Atualizadas" },
  { value: Sort.recent, label: "Mais recentes" },
  { value: Sort.oldest, label: "Mais antigas" },
];

const handle = async (promise, message) => {
  const result = await promise;
  if (!result.ok) {
    toast(result.error, { tone: "danger" });
    return;
  }
  toast(message, { tone: "success" });
  render();
};

const openRespond = (manifestation) => {
  const textarea = el("textarea", { className: "textarea", attrs: { "aria-label": "Resposta" } });
  const error = el("p", { className: "field__error", attrs: { hidden: true, role: "alert" } });

  openDialog({
    title: "Responder manifestação",
    body: el("div", { className: "stack stack--tight" }, [
      el("p", { className: "text-muted", text: `Resposta do setor ${sectorLabels[manifestation.sector]}.` }),
      textarea,
      error,
    ]),
    actions: (close) => [
      el("button", { className: "btn btn--ghost", text: "Cancelar", attrs: { type: "button" }, on: { click: close } }),
      el("button", {
        className: "btn btn--primary",
        text: "Enviar resposta",
        attrs: { type: "button" },
        on: {
          click: async (event) => {
            const message = validateField(textarea.value.trim(), [required, minLength(RESPONSE_MIN)]);
            if (message) {
              error.textContent = message;
              error.hidden = false;
              textarea.focus();
              return;
            }
            event.currentTarget.disabled = true;
            await handle(
              adminService.respond(
                manifestation.id,
                { sector: manifestation.sector, author: sectorLabels[manifestation.sector], body: textarea.value.trim() },
                user.id
              ),
              "Resposta publicada."
            );
            close();
          },
        },
      }),
    ],
  });
};

const openForward = (manifestation) => {
  const select = el("select", { className: "select", attrs: { "aria-label": "Setor" } });
  toOptions(sectorLabels).forEach((option) =>
    select.append(
      el("option", {
        text: option.label,
        attrs: { value: option.value, selected: option.value === manifestation.sector },
      })
    )
  );

  openDialog({
    title: "Encaminhar manifestação",
    body: el("div", { className: "field" }, [
      el("label", { className: "field__label", text: "Setor responsável" }),
      select,
    ]),
    actions: (close) => [
      el("button", { className: "btn btn--ghost", text: "Cancelar", attrs: { type: "button" }, on: { click: close } }),
      el("button", {
        className: "btn btn--primary",
        text: "Encaminhar",
        attrs: { type: "button" },
        on: {
          click: async (event) => {
            event.currentTarget.disabled = true;
            await handle(
              adminService.forward(manifestation.id, select.value, user.id),
              "Manifestação encaminhada."
            );
            close();
          },
        },
      }),
    ],
  });
};

const rowActions = (manifestation) => {
  const actions = [];
  const button = (label, variant, onClick) =>
    el("button", {
      className: `btn ${variant} btn--sm`,
      text: label,
      attrs: { type: "button" },
      on: { click: onClick },
    });

  if (manifestation.status === Status.published) {
    actions.push(button("Encaminhar", "btn--secondary", () => openForward(manifestation)));
  } else if (manifestation.status === Status.forwarded) {
    actions.push(
      button("Iniciar análise", "btn--secondary", () =>
        handle(adminService.startReview(manifestation.id, user.id), "Manifestação em análise.")
      )
    );
  } else if (manifestation.status === Status.underReview) {
    actions.push(button("Responder", "btn--primary", () => openRespond(manifestation)));
  } else if (
    manifestation.status === Status.resolved ||
    manifestation.status === Status.unresolved
  ) {
    actions.push(
      button("Encerrar", "btn--ghost", () =>
        handle(adminService.close(manifestation.id, user.id), "Manifestação encerrada.")
      )
    );
  }

  return actions.length > 0
    ? el("div", { className: "data-table__actions" }, actions)
    : el("span", { className: "text-muted", text: "—" });
};

const tableRow = (manifestation) =>
  el("tr", {}, [
    el("td", {}, [el("span", { className: "admin__protocol", text: manifestation.protocol })]),
    el("td", {}, [
      el("a", { className: "admin__title", text: manifestation.title, attrs: { href: detailUrl(manifestation.protocol) } }),
    ]),
    el("td", { text: sectorLabels[manifestation.sector] }),
    el("td", {}, [statusPill(manifestation.status)]),
    el("td", { text: formatDate(manifestation.updatedAt) }),
    el("td", {}, [rowActions(manifestation)]),
  ]);

const tableHead = () =>
  el("thead", {}, [
    el("tr", {}, ["Protocolo", "Título", "Setor", "Status", "Atualizada", "Ações"].map((label) =>
      el("th", { text: label })
    )),
  ]);

const filtersRow = () =>
  el("div", { className: "cluster" }, [
    field("Status", "status", filters.status, toOptions(statusLabels), "Todos"),
    field("Setor", "sector", filters.sector, toOptions(sectorLabels), "Todos"),
    field("Ordenar", "sort", filters.sort, sortOptions),
  ]);

function field(label, name, value, options, placeholder) {
  const select = el("select", {
    className: "select",
    attrs: { "aria-label": label },
    on: { change: (event) => { filters[name] = event.target.value; render(); } },
  });
  if (placeholder) select.append(el("option", { text: placeholder, attrs: { value: "" } }));
  options.forEach((option) =>
    select.append(
      el("option", { text: option.label, attrs: { value: option.value, selected: option.value === value } })
    )
  );
  return el("div", { className: "field field--inline" }, [
    el("label", { className: "field__label", text: label }),
    select,
  ]);
}

const renderKpis = async (host) => {
  const overview = await metricsService.overview();
  const cards = [
    { value: formatNumber(overview.total), label: "Total" },
    { value: formatNumber(overview.byStatus[Status.awaitingModeration] ?? 0), label: "Aguardando moderação" },
    { value: formatNumber(overview.byStatus[Status.underReview] ?? 0), label: "Em análise" },
    { value: formatPercent(overview.resolutionRate), label: "Taxa de resolução" },
  ];
  mount(host, fragment(cards.map(metric)));
};

const renderTable = async (host) => {
  mount(host, skeletonList(SKELETON_COUNT));
  const { items } = await manifestationService.query({
    status: filters.status,
    sector: filters.sector,
    sort: filters.sort,
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  if (items.length === 0) {
    mount(
      host,
      emptyState({
        iconName: icons.filter,
        title: "Nenhuma manifestação",
        text: "Ajuste os filtros para ver outros registros.",
      })
    );
    return;
  }

  mount(
    host,
    el("div", { className: "data-table" }, [
      el("table", {}, [tableHead(), el("tbody", {}, items.map(tableRow))]),
    ])
  );
};

function render() {
  const host = qs("[data-admin]");
  if (!host || !user) return;

  const kpis = el("div", { className: "grid grid--4" });
  const table = el("div", {});

  mount(
    host,
    el("div", { className: "stack stack--loose" }, [
      el("div", { className: "stack stack--tight" }, [
        el("p", { className: "eyebrow", text: "Painel restrito" }),
        el("h1", { text: "Painel administrativo" }),
      ]),
      kpis,
      filtersRow(),
      table,
    ])
  );

  renderKpis(kpis);
  renderTable(table);
}

if (user) render();
