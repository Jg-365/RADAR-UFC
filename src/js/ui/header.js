import { config } from "../core/config.js";
import { el } from "../core/dom.js";
import { bus, events } from "../core/event-bus.js";
import { routes, searchUrl } from "../shared/routes.js";
import { Role } from "../shared/enums.js";
import { authService } from "../services/AuthService.js";
import { icon, icons } from "./icon.js";
import { createThemeToggle } from "./theme.js";

const navItems = [
  { route: routes.manifestations, label: "Manifestações" },
  { route: routes.transparency, label: "Transparência" },
  { route: routes.howItWorks, label: "Como funciona" },
  { route: routes.moderation, label: "Moderação", roles: [Role.moderator, Role.admin] },
  { route: routes.admin, label: "Painel", roles: [Role.admin] },
];

const currentRoute = () =>
  window.location.pathname.split("/").pop() || routes.home;

const buildBrand = () =>
  el("a", { className: "brand", attrs: { href: routes.home, "aria-label": config.appName } }, [
    el("img", {
      className: "brand__logo",
      attrs: { src: config.logo, alt: config.appName, height: "56" },
    }),
  ]);

const buildNav = (active, user) => {
  const nav = el("nav", {
    className: "main-nav",
    attrs: { id: "main-nav", "aria-label": "Navegação principal", hidden: true },
  });

  navItems
    .filter((item) => !item.roles || (user && user.hasRole(...item.roles)))
    .forEach((item) => {
      nav.append(
        el("a", {
          className: "main-nav__link",
          text: item.label,
          attrs: {
            href: item.route,
            "aria-current": item.route === active ? "page" : false,
          },
        })
      );
    });

  return nav;
};

const buildSearch = () => {
  const input = el("input", {
    className: "search__input",
    attrs: {
      type: "search",
      name: config.searchParam,
      placeholder: "Buscar manifestações",
      "aria-label": "Buscar manifestações",
    },
  });

  const submit = el("button", {
    className: "search__submit",
    attrs: { type: "submit", "aria-label": "Buscar" },
  });
  submit.append(icon(icons.search));

  return el(
    "form",
    {
      className: "search",
      attrs: { role: "search" },
      on: {
        submit: (event) => {
          event.preventDefault();
          window.location.href = searchUrl(input.value.trim());
        },
      },
    },
    [input, submit]
  );
};

const actionControl = ({ variant, iconName, label, href, onClick }) => {
  const node = el(href ? "a" : "button", {
    className: `btn btn--expand ${variant}`,
    attrs: href ? { href } : { type: "button" },
    on: onClick ? { click: onClick } : undefined,
  });
  node.append(icon(iconName), el("span", { className: "btn__label", text: label }));
  return node;
};

const buildSession = (user) => {
  const wrap = el("div", { className: "header-session" });

  if (user) {
    wrap.append(
      actionControl({
        variant: "btn--ghost",
        iconName: icons.user,
        label: user.name,
        href: routes.myManifestations,
      }),
      actionControl({
        variant: "btn--ghost",
        iconName: icons.logout,
        label: "Sair",
        onClick: () => authService.logout(),
      })
    );
  } else {
    wrap.append(
      actionControl({
        variant: "btn--ghost",
        iconName: icons.user,
        label: "Entrar",
        href: routes.login,
      })
    );
  }

  wrap.append(
    actionControl({
      variant: "btn--primary",
      iconName: icons.send,
      label: "Registrar",
      href: routes.register,
    })
  );

  return wrap;
};

export const renderHeader = () => {
  const host = el("header", { className: "site-header" });
  const active = currentRoute();

  const paint = () => {
    const user = authService.currentUser();
    const nav = buildNav(active, user);

    const toggle = el("button", {
      className: "nav-toggle",
      attrs: { type: "button", "aria-controls": "main-nav", "aria-expanded": false, "aria-label": "Abrir menu" },
      on: {
        click: () => {
          const open = nav.hasAttribute("hidden");
          nav.toggleAttribute("hidden", !open);
          toggle.setAttribute("aria-expanded", String(open));
        },
      },
    });
    toggle.append(icon(icons.menu));

    const inner = el("div", { className: "container site-header__inner" }, [
      buildBrand(),
      nav,
      el("div", { className: "header-actions" }, [
        buildSearch(),
        createThemeToggle(),
        buildSession(user),
        toggle,
      ]),
    ]);

    host.replaceChildren(inner);
  };

  bus.on(events.sessionChanged, paint);
  paint();
  return host;
};
