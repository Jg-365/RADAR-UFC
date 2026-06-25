import { el } from "../core/dom.js";
import { statusPill, tag } from "./components.js";
import { categoryLabels, sectorLabels } from "../shared/labels.js";
import { formatRelative, truncate } from "../shared/formatters.js";
import { detailUrl } from "../shared/routes.js";

const SNIPPET_LENGTH = 160;

export const manifestationItem = (manifestation) =>
  el("article", { className: "m-item" }, [
    el("div", { className: "m-item__main stack stack--tight" }, [
      el("div", { className: "cluster" }, [
        tag(categoryLabels[manifestation.category]),
        tag(sectorLabels[manifestation.sector]),
        el("span", {
          className: "m-item__protocol",
          text: manifestation.protocol,
        }),
      ]),
      el("a", {
        className: "m-item__title",
        text: manifestation.title,
        attrs: { href: detailUrl(manifestation.protocol) },
      }),
      el("p", {
        className: "m-item__snippet",
        text: truncate(manifestation.body, SNIPPET_LENGTH),
      }),
    ]),
    el("div", { className: "m-item__side" }, [
      statusPill(manifestation.status),
      el("span", {
        className: "m-item__time",
        text: formatRelative(manifestation.updatedAt),
      }),
    ]),
  ]);
