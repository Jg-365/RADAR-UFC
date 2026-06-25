import { config } from "../../core/config.js";
import { qs, el, mount } from "../../core/dom.js";
import { manifestationService } from "../../services/ManifestationService.js";
import { statusPill, tag, timeline, emptyState } from "../../ui/components.js";
import { icon, icons } from "../../ui/icon.js";
import { toast } from "../../ui/toast.js";
import { categoryLabels, sectorLabels, statusLabels } from "../../shared/labels.js";
import { formatDate, formatDateTime } from "../../shared/formatters.js";
import { routes } from "../../shared/routes.js";

const SCORE_MAX = 5;

const backLink = () =>
  el("a", { className: "detail__back", attrs: { href: routes.manifestations } }, [
    icon(icons.chevronLeft),
    el("span", { text: "Voltar para manifestações" }),
  ]);

const copyButton = (protocol) => {
  const button = el("button", {
    className: "btn btn--ghost btn--sm",
    attrs: { type: "button" },
    on: {
      click: async () => {
        try {
          await navigator.clipboard.writeText(protocol);
          toast("Protocolo copiado.", { tone: "success" });
        } catch (error) {
          toast("Não foi possível copiar o protocolo.", { tone: "danger" });
        }
      },
    },
  });
  button.append(icon(icons.copy), el("span", { text: "Copiar" }));
  return button;
};

const renderHeader = (manifestation) =>
  el("header", { className: "detail__head stack stack--tight" }, [
    el("div", { className: "cluster" }, [
      statusPill(manifestation.status),
      tag(categoryLabels[manifestation.category]),
      tag(sectorLabels[manifestation.sector]),
    ]),
    el("h1", { text: manifestation.title }),
    el("div", { className: "cluster detail__protocol" }, [
      el("span", {
        className: "detail__protocol-code",
        text: manifestation.protocol,
      }),
      copyButton(manifestation.protocol),
    ]),
    el("p", { className: "text-muted detail__meta" }, [
      `Por ${manifestation.displayAuthor} · Aberta em ${formatDate(
        manifestation.createdAt
      )} · Atualizada em ${formatDate(manifestation.updatedAt)}`,
    ]),
  ]);

const renderResponses = (manifestation) => {
  if (manifestation.responses.length === 0) {
    return emptyState({
      iconName: icons.send,
      title: "Sem respostas ainda",
      text: "Quando o setor responder, a resposta aparece aqui.",
    });
  }

  return el(
    "div",
    { className: "stack" },
    manifestation.responses.map((response) =>
      el("article", { className: "response" }, [
        el("div", { className: "cluster cluster--between" }, [
          el("p", { className: "response__author", text: response.author }),
          el("span", {
            className: "response__time",
            text: formatDateTime(response.at),
          }),
        ]),
        el("p", { className: "response__body", text: response.body }),
      ])
    )
  );
};

const renderRating = (manifestation) => {
  const rating = manifestation.rating;
  if (!rating) return null;

  return el("section", { className: "stack stack--tight" }, [
    el("h2", { text: "Avaliação do usuário" }),
    el("div", { className: "rating-box" }, [
      el("div", { className: "cluster cluster--between" }, [
        statusPill(rating.resolution),
        el("span", {
          className: "rating-box__score",
          text: `${rating.score}/${SCORE_MAX}`,
        }),
      ]),
      rating.comment &&
        el("p", { className: "rating-box__comment", text: rating.comment }),
    ]),
  ]);
};

const renderNotFound = (host) => {
  mount(
    host,
    el("div", { className: "stack" }, [
      backLink(),
      emptyState({
        iconName: icons.alert,
        title: "Manifestação não encontrada",
        text: "O protocolo informado não existe ou não está disponível publicamente.",
      }),
    ])
  );
};

const render = async () => {
  const host = qs("[data-detail]");
  if (!host) return;

  const params = new URLSearchParams(window.location.search);
  const protocol = params.get(config.protocolParam);

  if (!protocol) {
    renderNotFound(host);
    return;
  }

  const manifestation = await manifestationService.getByProtocol(protocol);
  if (!manifestation) {
    renderNotFound(host);
    return;
  }

  document.title = `${manifestation.title} — ${config.appName}`;

  const main = el("div", { className: "detail__main stack stack--loose" }, [
    el("section", { className: "stack stack--tight" }, [
      el("h2", { text: "Manifestação" }),
      el("p", { className: "detail__body", text: manifestation.body }),
    ]),
    el("section", { className: "stack stack--tight" }, [
      el("h2", { text: "Respostas institucionais" }),
      renderResponses(manifestation),
    ]),
    renderRating(manifestation),
  ]);

  const aside = el("aside", { className: "detail__aside" }, [
    el("div", { className: "panel stack stack--tight" }, [
      el("h3", { text: "Acompanhamento" }),
      timeline(manifestation.history),
    ]),
  ]);

  mount(
    host,
    el("article", { className: "detail stack stack--loose" }, [
      backLink(),
      renderHeader(manifestation),
      el("div", { className: "detail__layout" }, [main, aside]),
    ])
  );
};

render();
