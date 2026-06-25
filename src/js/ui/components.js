import { el, fragment } from "../core/dom.js";
import { icon, icons } from "./icon.js";
import { statusLabels, statusTones } from "../shared/labels.js";
import { formatDateTime } from "../shared/formatters.js";

export const statusPill = (status) =>
  el("span", {
    className: "pill",
    dataset: { tone: statusTones[status] ?? "neutral" },
    text: statusLabels[status] ?? status,
  });

export const tag = (label) => el("span", { className: "tag", text: label });

export const timeline = (entries) => {
  const ordered = [...entries].reverse();
  return el(
    "ol",
    { className: "timeline", attrs: { role: "list" } },
    ordered.map((entry, index) =>
      el(
        "li",
        { className: "timeline__item", dataset: { current: String(index === 0) } },
        [
          el("span", {
            className: "timeline__time",
            text: formatDateTime(entry.at),
          }),
          el("p", {
            className: "timeline__title",
            text: statusLabels[entry.status] ?? entry.status,
          }),
          entry.note && el("p", { className: "timeline__note", text: entry.note }),
        ]
      )
    )
  );
};

export const emptyState = ({ iconName, title, text }) =>
  el("div", { className: "empty-state" }, [
    iconName && icon(iconName, { className: "icon empty-state__icon" }),
    el("h3", { className: "empty-state__title", text: title }),
    text && el("p", { className: "empty-state__text", text }),
  ]);

export const metric = ({ value, label }) =>
  el("div", { className: "metric" }, [
    el("p", { className: "metric__value", text: value }),
    el("p", { className: "metric__label", text: label }),
  ]);

export const selectField = ({ label, name, value = "", options, placeholder, onChange }) => {
  const select = el("select", {
    className: "select",
    attrs: { name, id: `field-${name}`, "aria-label": label },
    on: onChange ? { change: (event) => onChange(event.target.value) } : undefined,
  });

  if (placeholder) {
    select.append(
      el("option", { text: placeholder, attrs: { value: "" } })
    );
  }

  options.forEach((option) =>
    select.append(
      el("option", {
        text: option.label,
        attrs: { value: option.value, selected: option.value === value },
      })
    )
  );

  return el("div", { className: "field field--inline" }, [
    el("label", {
      className: "field__label",
      text: label,
      attrs: { for: `field-${name}` },
    }),
    select,
  ]);
};

export const skeletonList = (count) =>
  fragment(
    Array.from({ length: count }, () =>
      el("div", { className: "m-item" }, [
        el("div", { className: "m-item__main stack stack--tight" }, [
          el("div", { className: "skeleton skeleton--line skeleton--meta" }),
          el("div", { className: "skeleton skeleton--title" }),
          el("div", { className: "skeleton skeleton--line" }),
        ]),
      ])
    )
  );

export const pagination = ({ page, pages, onSelect }) => {
  const nav = el("nav", {
    className: "pagination",
    attrs: { "aria-label": "Paginação" },
  });

  const step = (target, label, iconName, disabled) => {
    const button = el("button", {
      className: "pagination__page",
      attrs: { type: "button", "aria-label": label, "aria-disabled": disabled },
      on: disabled ? undefined : { click: () => onSelect(target) },
    });
    button.append(icon(iconName));
    return button;
  };

  nav.append(step(page - 1, "Página anterior", icons.chevronLeft, page <= 1));

  for (let index = 1; index <= pages; index += 1) {
    nav.append(
      el("button", {
        className: "pagination__page",
        text: String(index),
        attrs: {
          type: "button",
          "aria-current": index === page ? "true" : false,
        },
        on: { click: () => onSelect(index) },
      })
    );
  }

  nav.append(step(page + 1, "Próxima página", icons.chevronRight, page >= pages));
  return nav;
};
