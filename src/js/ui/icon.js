import { config } from "../core/config.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export const icons = Object.freeze({
  radar: "radar",
  search: "search",
  sun: "sun",
  moon: "moon",
  menu: "menu",
  close: "close",
  arrowRight: "arrow-right",
  chevronLeft: "chevron-left",
  chevronRight: "chevron-right",
  check: "check",
  alert: "alert",
  clock: "clock",
  user: "user",
  logout: "logout",
  send: "send",
  filter: "filter",
  copy: "copy",
  shield: "shield",
  chart: "chart",
});

export const icon = (name, { className = "icon" } = {}) => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `${config.iconSprite}#icon-${name}`);
  svg.append(use);
  return svg;
};
