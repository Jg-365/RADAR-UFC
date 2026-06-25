import { config } from "../core/config.js";
import { storage } from "../core/storage.js";
import { bus, events } from "../core/event-bus.js";
import { el } from "../core/dom.js";
import { icon, icons } from "./icon.js";

const root = document.documentElement;

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const resolveInitialTheme = () =>
  storage.read(config.storageKeys.theme) ??
  (prefersDark() ? config.themes.dark : config.themes.light);

export const applyTheme = (theme) => {
  root.dataset.theme = theme;
  storage.write(config.storageKeys.theme, theme);
  bus.emit(events.themeChanged, theme);
};

const isDark = () => root.dataset.theme === config.themes.dark;

export const createThemeToggle = () => {
  const button = el("button", {
    className: "icon-btn",
    attrs: { type: "button", "aria-label": "Alternar tema claro e escuro" },
    on: {
      click: () =>
        applyTheme(isDark() ? config.themes.light : config.themes.dark),
    },
  });

  const render = () => {
    button.replaceChildren(icon(isDark() ? icons.sun : icons.moon));
    button.setAttribute("aria-pressed", String(isDark()));
  };

  bus.on(events.themeChanged, render);
  render();
  return button;
};
