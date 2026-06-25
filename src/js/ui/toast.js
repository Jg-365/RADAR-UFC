import { config } from "../core/config.js";
import { el, qs } from "../core/dom.js";
import { icon, icons } from "./icon.js";

const REGION_ID = "toast-region";

const region = () => {
  let node = qs(`#${REGION_ID}`);
  if (!node) {
    node = el("div", {
      className: "toast-region",
      attrs: { id: REGION_ID, role: "status", "aria-live": "polite" },
    });
    document.body.append(node);
  }
  return node;
};

export const toast = (message, { tone = "neutral", timeout = config.toastTimeoutMs } = {}) => {
  const close = el("button", {
    className: "icon-btn toast__close",
    attrs: { type: "button", "aria-label": "Fechar aviso" },
    on: { click: () => item.remove() },
  });
  close.append(icon(icons.close));

  const item = el("div", { className: "toast", dataset: { tone } }, [
    el("p", { className: "toast__body", text: message }),
    close,
  ]);

  region().append(item);
  if (timeout) window.setTimeout(() => item.remove(), timeout);
  return item;
};
