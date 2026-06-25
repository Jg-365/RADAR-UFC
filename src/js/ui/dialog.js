import { el } from "../core/dom.js";
import { icon, icons } from "./icon.js";

export const openDialog = ({ title, body, actions }) => {
  const dialog = el("dialog", { className: "dialog" });

  const close = () => {
    dialog.close();
    dialog.remove();
  };

  const closeButton = el("button", {
    className: "icon-btn",
    attrs: { type: "button", "aria-label": "Fechar" },
    on: { click: close },
  });
  closeButton.append(icon(icons.close));

  dialog.append(
    el("div", { className: "dialog__header" }, [
      el("h2", { className: "dialog__title", text: title }),
      closeButton,
    ]),
    el("div", { className: "dialog__body" }, body),
    el("div", { className: "dialog__footer" }, actions(close))
  );

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  document.body.append(dialog);
  dialog.showModal();
  return { dialog, close };
};
