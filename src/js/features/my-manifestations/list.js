import { qs, el, mount } from "../../core/dom.js";
import {
  manifestationService,
  Sort,
} from "../../services/ManifestationService.js";
import { requireRoles } from "../../ui/guard.js";
import { openDialog } from "../../ui/dialog.js";
import { toast } from "../../ui/toast.js";
import {
  selectField,
  skeletonList,
  emptyState,
} from "../../ui/components.js";
import { manifestationItem } from "../../ui/manifestation-item.js";
import { icons } from "../../ui/icon.js";
import { statusLabels, toOptions } from "../../shared/labels.js";
import { Status, RESOLUTION } from "../../shared/enums.js";
import { required, minLength, validateField } from "../../shared/validators.js";
import { formatNumber } from "../../shared/formatters.js";

const COMPLEMENT_MIN = 10;
const SKELETON_COUNT = 3;
const SCORES = [5, 4, 3, 2, 1];

const user = requireRoles();

const filters = { status: "", sort: Sort.recent };

const sortOptions = [
  { value: Sort.recent, label: "Mais recentes" },
  { value: Sort.oldest, label: "Mais antigas" },
  { value: Sort.updated, label: "Atualizadas" },
];

const openComplement = (manifestation) => {
  const textarea = el("textarea", {
    className: "textarea",
    attrs: { "aria-label": "Complemento", id: "complement-input" },
  });
  const error = el("p", { className: "field__error", attrs: { hidden: true, role: "alert" } });

  openDialog({
    title: "Enviar complemento",
    body: el("div", { className: "stack stack--tight" }, [
      el("p", { className: "text-muted", text: "Adicione as informações solicitadas pelo setor." }),
      textarea,
      error,
    ]),
    actions: (close) => [
      el("button", { className: "btn btn--ghost", text: "Cancelar", attrs: { type: "button" }, on: { click: close } }),
      el("button", {
        className: "btn btn--primary",
        text: "Enviar",
        attrs: { type: "button" },
        on: {
          click: async (event) => {
            const message = validateField(textarea.value.trim(), [required, minLength(COMPLEMENT_MIN)]);
            if (message) {
              error.textContent = message;
              error.hidden = false;
              textarea.focus();
              return;
            }
            event.currentTarget.disabled = true;
            await manifestationService.addComplement(manifestation.id, textarea.value.trim(), user.id);
            close();
            toast("Complemento enviado.", { tone: "success" });
            render();
          },
        },
      }),
    ],
  });
};

const openRate = (manifestation) => {
  let resolution = RESOLUTION.resolved;

  const resolutionChoice = (value) => {
    const id = `rate-${value}`;
    return el("label", { className: "choice", attrs: { for: id } }, [
      el("input", {
        attrs: { type: "radio", name: "resolution", id, value, checked: value === resolution },
        on: { change: () => { resolution = value; } },
      }),
      el("span", { text: statusLabels[value] }),
    ]);
  };

  const score = el("select", { className: "select", attrs: { "aria-label": "Nota" } });
  SCORES.forEach((value) =>
    score.append(el("option", { text: `${value}`, attrs: { value: String(value) } }))
  );

  const comment = el("textarea", { className: "textarea", attrs: { "aria-label": "Comentário" } });

  openDialog({
    title: "Avaliar resposta",
    body: el("div", { className: "stack" }, [
      el("div", { className: "cluster" }, [
        resolutionChoice(RESOLUTION.resolved),
        resolutionChoice(RESOLUTION.unresolved),
      ]),
      el("div", { className: "field" }, [
        el("label", { className: "field__label", text: "Nota" }),
        score,
      ]),
      el("div", { className: "field" }, [
        el("label", { className: "field__label", text: "Comentário" }),
        comment,
      ]),
    ]),
    actions: (close) => [
      el("button", { className: "btn btn--ghost", text: "Cancelar", attrs: { type: "button" }, on: { click: close } }),
      el("button", {
        className: "btn btn--primary",
        text: "Enviar avaliação",
        attrs: { type: "button" },
        on: {
          click: async (event) => {
            event.currentTarget.disabled = true;
            await manifestationService.rate(
              manifestation.id,
              { resolution, score: Number(score.value), comment: comment.value.trim() },
              user.id
            );
            close();
            toast("Avaliação registrada.", { tone: "success" });
            render();
          },
        },
      }),
    ],
  });
};

const myItem = (manifestation) => {
  const node = el("div", { className: "my-item" }, [manifestationItem(manifestation)]);
  const actions = [];

  if (manifestation.status === Status.awaitingComplement) {
    actions.push(
      el("button", {
        className: "btn btn--secondary btn--sm",
        text: "Enviar complemento",
        attrs: { type: "button" },
        on: { click: () => openComplement(manifestation) },
      })
    );
  }

  if (manifestation.isAwaitingRating) {
    actions.push(
      el("button", {
        className: "btn btn--primary btn--sm",
        text: "Avaliar resposta",
        attrs: { type: "button" },
        on: { click: () => openRate(manifestation) },
      })
    );
  }

  if (actions.length > 0) {
    node.append(el("div", { className: "my-item__actions" }, actions));
  }

  return node;
};

const filtersRow = () =>
  el("div", { className: "cluster" }, [
    selectField({
      label: "Status",
      name: "status",
      value: filters.status,
      placeholder: "Todos",
      options: toOptions(statusLabels),
      onChange: (value) => { filters.status = value; render(); },
    }),
    selectField({
      label: "Ordenar",
      name: "sort",
      value: filters.sort,
      options: sortOptions,
      onChange: (value) => { filters.sort = value; render(); },
    }),
  ]);

async function render() {
  const host = qs("[data-my]");
  if (!host || !user) return;

  const results = el("div", { className: "stack" });

  mount(
    host,
    el("div", { className: "stack stack--loose" }, [
      el("div", { className: "stack stack--tight" }, [
        el("p", { className: "eyebrow", text: "Sua conta" }),
        el("h1", { text: "Minhas manifestações" }),
      ]),
      filtersRow(),
      results,
    ])
  );

  mount(results, skeletonList(SKELETON_COUNT));

  const { items } = await manifestationService.query({
    authorId: user.id,
    status: filters.status,
    sort: filters.sort,
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  if (items.length === 0) {
    mount(
      results,
      emptyState({
        iconName: icons.radar,
        title: "Você ainda não tem manifestações",
        text: "Registre uma manifestação para acompanhá-la por aqui.",
      })
    );
    return;
  }

  mount(
    results,
    el("div", { className: "stack" }, [
      el("p", {
        className: "results-count",
        text: `${formatNumber(items.length)} ${items.length === 1 ? "manifestação" : "manifestações"}`,
      }),
      ...items.map(myItem),
    ])
  );
}

if (user) render();
