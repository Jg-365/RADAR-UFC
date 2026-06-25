import { config } from "../../core/config.js";
import { qs, el, mount } from "../../core/dom.js";
import { authService } from "../../services/AuthService.js";
import { toast } from "../../ui/toast.js";
import { roleLabels } from "../../shared/labels.js";
import { routes } from "../../shared/routes.js";
import {
  required,
  email,
  minLength,
  validateForm,
} from "../../shared/validators.js";

const NAME_MIN = 3;
const PASSWORD_MIN = 6;

const Mode = Object.freeze({ login: "login", register: "register" });

const nextTarget = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get(config.nextParam) || routes.home;
};

const makeField = ({ name, label, type = "text", autocomplete, hint }) => {
  const input = el("input", {
    className: "input",
    attrs: { id: `auth-${name}`, name, type, autocomplete },
  });
  const error = el("p", {
    className: "field__error",
    attrs: { id: `auth-${name}-error`, hidden: true, role: "alert" },
  });
  const wrap = el("div", { className: "field", dataset: { field: name } }, [
    el("label", {
      className: "field__label",
      text: label,
      attrs: { for: `auth-${name}` },
    }),
    hint && el("p", { className: "field__hint", text: hint }),
    input,
    error,
  ]);
  return { name, wrap, input, error };
};

const applyErrors = (fields, errors) => {
  fields.forEach((field) => {
    const message = errors[field.name];
    field.wrap.dataset.invalid = message ? "true" : "false";
    field.error.textContent = message ?? "";
    field.error.hidden = !message;
  });
};

const collect = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name, field.input.value.trim()]));

const buildForm = ({ fields, schema, submitLabel, onValid }) => {
  const built = fields.map(makeField);
  const formError = el("p", {
    className: "form-error",
    attrs: { hidden: true, role: "alert" },
  });
  const submit = el("button", {
    className: "btn btn--primary btn--block",
    text: submitLabel,
    attrs: { type: "submit" },
  });

  const form = el(
    "form",
    {
      className: "stack",
      attrs: { novalidate: true },
      on: {
        submit: async (event) => {
          event.preventDefault();
          formError.hidden = true;
          const data = collect(built);
          const { valid, errors } = validateForm(data, schema);
          applyErrors(built, errors);
          if (!valid) {
            built.find((field) => errors[field.name])?.input.focus();
            return;
          }
          submit.disabled = true;
          const result = await onValid(data);
          submit.disabled = false;
          if (result && !result.ok) {
            formError.textContent = result.error;
            formError.hidden = false;
          }
        },
      },
    },
    [...built.map((field) => field.wrap), formError, submit]
  );

  return form;
};

const loginForm = () =>
  buildForm({
    submitLabel: "Entrar",
    schema: {
      email: [required, email],
      password: [required],
    },
    fields: [
      { name: "email", label: "E-mail", type: "email", autocomplete: "email" },
      {
        name: "password",
        label: "Senha",
        type: "password",
        autocomplete: "current-password",
      },
    ],
    onValid: async (data) => {
      const result = await authService.login(data.email, data.password);
      if (result.ok) {
        toast(`Bem-vindo, ${result.value.name}.`, { tone: "success" });
        window.location.assign(nextTarget());
      }
      return result;
    },
  });

const registerForm = () =>
  buildForm({
    submitLabel: "Criar conta",
    schema: {
      name: [required, minLength(NAME_MIN)],
      email: [required, email],
      password: [required, minLength(PASSWORD_MIN)],
    },
    fields: [
      { name: "name", label: "Nome completo", autocomplete: "name" },
      { name: "email", label: "E-mail", type: "email", autocomplete: "email" },
      {
        name: "password",
        label: "Senha",
        type: "password",
        autocomplete: "new-password",
        hint: `Mínimo de ${PASSWORD_MIN} caracteres.`,
      },
    ],
    onValid: async (data) => {
      const result = await authService.register(data);
      if (result.ok) {
        toast(`Conta criada. Bem-vindo, ${result.value.name}.`, {
          tone: "success",
        });
        window.location.assign(nextTarget());
      }
      return result;
    },
  });

const renderAuth = (host) => {
  let mode = Mode.login;
  const panel = el("div", { className: "auth__panel" });

  const tab = (value, label) =>
    el("button", {
      className: "auth__tab",
      text: label,
      attrs: { type: "button", "aria-selected": String(mode === value) },
      on: {
        click: () => {
          if (mode === value) return;
          mode = value;
          paint();
        },
      },
    });

  const paint = () => {
    const tabs = el("div", { className: "auth__tabs", attrs: { role: "tablist" } }, [
      tab(Mode.login, "Entrar"),
      tab(Mode.register, "Criar conta"),
    ]);
    mount(panel, mode === Mode.login ? loginForm() : registerForm());
    mount(
      host,
      el("div", { className: "auth stack stack--loose" }, [
        el("img", {
          className: "auth__logo",
          attrs: { src: config.logo, alt: config.appName, height: "48" },
        }),
        tabs,
        panel,
      ])
    );
  };

  paint();
};

const renderSignedIn = (host, user) => {
  mount(
    host,
    el("div", { className: "auth stack stack--loose" }, [
      el("img", {
        className: "auth__logo",
        attrs: { src: config.logo, alt: config.appName, height: "48" },
      }),
      el("div", { className: "stack stack--tight" }, [
        el("h1", { text: "Você já está conectado" }),
        el("p", {
          className: "text-muted",
          text: `${user.name} · ${roleLabels[user.role]}`,
        }),
      ]),
      el("div", { className: "cluster" }, [
        el("a", { className: "btn btn--primary", text: "Ir para o início", attrs: { href: routes.home } }),
        el("button", {
          className: "btn btn--ghost",
          text: "Sair",
          attrs: { type: "button" },
          on: {
            click: () => {
              authService.logout();
              renderAuth(host);
            },
          },
        }),
      ]),
    ])
  );
};

const render = () => {
  const host = qs("[data-auth]");
  if (!host) return;
  const user = authService.currentUser();
  if (user) renderSignedIn(host, user);
  else renderAuth(host);
};

render();
