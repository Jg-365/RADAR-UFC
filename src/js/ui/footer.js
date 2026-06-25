import { config } from "../core/config.js";
import { el } from "../core/dom.js";
import { routes } from "../shared/routes.js";

const linkColumns = [
  {
    title: "Plataforma",
    links: [
      { label: "Manifestações", route: routes.manifestations },
      { label: "Registrar", route: routes.register },
      { label: "Como funciona", route: routes.howItWorks },
    ],
  },
  {
    title: "Transparência",
    links: [
      { label: "Indicadores", route: routes.transparency },
      { label: "Entrar", route: routes.login },
    ],
  },
];

const buildColumn = (column) =>
  el("div", {}, [
    el("p", { className: "site-footer__title", text: column.title }),
    el(
      "div",
      { className: "site-footer__links" },
      column.links.map((link) =>
        el("a", { text: link.label, attrs: { href: link.route } })
      )
    ),
  ]);

export const renderFooter = () => {
  const inner = el("div", { className: "container site-footer__inner" }, [
    el("div", {}, [
      el("img", {
        className: "site-footer__brand",
        attrs: { src: config.logoWordmark, alt: config.appName, height: "48" },
      }),
      el("p", {
        text: "Canal de escuta, manifestações e transparência institucional.",
      }),
    ]),
    ...linkColumns.map(buildColumn),
  ]);

  const bottom = el("div", { className: "site-footer__bottom" }, [
    el("div", { className: "container" }, [
      el("span", {
        text: `${config.appName} · ${config.institution}`,
      }),
    ]),
  ]);

  return el("footer", { className: "site-footer" }, [inner, bottom]);
};
