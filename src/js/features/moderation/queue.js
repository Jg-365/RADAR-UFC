import { qs, el, mount } from "../../core/dom.js";
import { moderationService } from "../../services/ModerationService.js";
import { requireRoles } from "../../ui/guard.js";
import { openDialog } from "../../ui/dialog.js";
import { toast } from "../../ui/toast.js";
import { statusPill, tag, emptyState, skeletonList } from "../../ui/components.js";
import { icons } from "../../ui/icon.js";
import { categoryLabels, sectorLabels } from "../../shared/labels.js";
import { Role } from "../../shared/enums.js";
import { required, minLength, validateField } from "../../shared/validators.js";
import { formatRelative, formatNumber } from "../../shared/formatters.js";

const REASON_MIN = 10;
const SKELETON_COUNT = 3;

const user = requireRoles(Role.moderator, Role.admin);

const askReason = ({ title, confirmLabel, confirmVariant, onConfirm }) => {
  const textarea = el("textarea", {
    className: "textarea",
    attrs: { "aria-label": "Motivo" },
  });
  const error = el("p", { className: "field__error", attrs: { hidden: true, role: "alert" } });

  openDialog({
    title,
    body: el("div", { className: "stack stack--tight" }, [
      el("p", { className: "text-muted", text: "Descreva o motivo para o autor." }),
      textarea,
      error,
    ]),
    actions: (close) => [
      el("button", { className: "btn btn--ghost", text: "Cancelar", attrs: { type: "button" }, on: { click: close } }),
      el("button", {
        className: `btn ${confirmVariant}`,
        text: confirmLabel,
        attrs: { type: "button" },
        on: {
          click: async (event) => {
            const message = validateField(textarea.value.trim(), [required, minLength(REASON_MIN)]);
            if (message) {
              error.textContent = message;
              error.hidden = false;
              textarea.focus();
              return;
            }
            event.currentTarget.disabled = true;
            await onConfirm(textarea.value.trim());
            close();
          },
        },
      }),
    ],
  });
};

const handle = async (result, successMessage) => {
  if (!result.ok) {
    toast(result.error, { tone: "danger" });
    return;
  }
  toast(successMessage, { tone: "success" });
  render();
};

const modItem = (manifestation) =>
  el("article", { className: "mod-item stack" }, [
    el("div", { className: "cluster cluster--between" }, [
      el("div", { className: "cluster" }, [
        tag(categoryLabels[manifestation.category]),
        tag(sectorLabels[manifestation.sector]),
        el("span", { className: "mod-item__protocol", text: manifestation.protocol }),
      ]),
      statusPill(manifestation.status),
    ]),
    el("h2", { text: manifestation.title }),
    el("p", {
      className: "mod-item__meta text-muted",
      text: `Por ${manifestation.displayAuthor} · ${formatRelative(manifestation.createdAt)}`,
    }),
    el("p", { className: "mod-item__body", text: manifestation.body }),
    el("div", { className: "mod-item__actions" }, [
      el("button", {
        className: "btn btn--primary btn--sm",
        text: "Aprovar e publicar",
        attrs: { type: "button" },
        on: {
          click: () =>
            handle(
              moderationService.approve(manifestation.id, user.id),
              "Manifestação publicada."
            ),
        },
      }),
      el("button", {
        className: "btn btn--secondary btn--sm",
        text: "Solicitar ajuste",
        attrs: { type: "button" },
        on: {
          click: () =>
            askReason({
              title: "Solicitar ajuste",
              confirmLabel: "Solicitar ajuste",
              confirmVariant: "btn--secondary",
              onConfirm: (reason) =>
                handle(
                  moderationService.requestAdjustment(manifestation.id, user.id, reason),
                  "Ajuste solicitado ao autor."
                ),
            }),
        },
      }),
      el("button", {
        className: "btn btn--danger btn--sm",
        text: "Recusar",
        attrs: { type: "button" },
        on: {
          click: () =>
            askReason({
              title: "Recusar manifestação",
              confirmLabel: "Recusar",
              confirmVariant: "btn--danger",
              onConfirm: (reason) =>
                handle(
                  moderationService.reject(manifestation.id, user.id, reason),
                  "Manifestação recusada."
                ),
            }),
        },
      }),
    ]),
  ]);

async function render() {
  const host = qs("[data-moderation]");
  if (!host || !user) return;

  const results = el("div", { className: "stack" });

  mount(
    host,
    el("div", { className: "stack stack--loose" }, [
      el("div", { className: "stack stack--tight" }, [
        el("p", { className: "eyebrow", text: "Painel restrito" }),
        el("h1", { text: "Fila de moderação" }),
      ]),
      results,
    ])
  );

  mount(results, skeletonList(SKELETON_COUNT));

  const queue = await moderationService.queue();

  if (queue.length === 0) {
    mount(
      results,
      emptyState({
        iconName: icons.check,
        title: "Fila vazia",
        text: "Não há manifestações aguardando moderação no momento.",
      })
    );
    return;
  }

  mount(
    results,
    el("div", { className: "stack stack--loose" }, [
      el("p", {
        className: "results-count",
        text: `${formatNumber(queue.length)} aguardando moderação`,
      }),
      ...queue.map(modItem),
    ])
  );
}

if (user) render();
