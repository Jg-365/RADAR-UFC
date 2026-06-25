import { config } from "../../core/config.js";
import { qs, el, mount } from "../../core/dom.js";
import { storage } from "../../core/storage.js";
import { manifestationService } from "../../services/ManifestationService.js";
import { authService } from "../../services/AuthService.js";
import { statusPill } from "../../ui/components.js";
import { icon, icons } from "../../ui/icon.js";
import { toast } from "../../ui/toast.js";
import {
  categoryLabels,
  sectorLabels,
  toOptions,
} from "../../shared/labels.js";
import { Category, Sector, valuesOf } from "../../shared/enums.js";
import {
  required,
  minLength,
  oneOf,
  validateField,
} from "../../shared/validators.js";

const TITLE_MIN = 6;
const NAME_MIN = 3;
const BODY_MIN = 20;
const LAST_STEP = 2;

const steps = ["Identificação", "Conteúdo", "Revisão"];
const user = authService.currentUser();

const blank = () => ({
  anonymous: false,
  authorName: user?.name ?? "",
  title: "",
  category: "",
  sector: "",
  body: "",
});

let state = { step: 0, ...blank() };
let currentFields = {};
let draftTimer;

const stored = storage.read(config.storageKeys.draft);
if (stored) state = { step: 0, ...blank(), ...stored };

const persistDraft = () => {
  const { step, ...data } = state;
  storage.write(config.storageKeys.draft, data);
};

const scheduleDraft = () => {
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(persistDraft, config.draftAutosaveMs);
};

const setValue = (name, value) => {
  state[name] = value;
  scheduleDraft();
};

const field = (name, label, control, hint) => {
  const error = el("p", {
    className: "field__error",
    attrs: { hidden: true, role: "alert" },
  });
  const wrap = el("div", { className: "field", dataset: { field: name } }, [
    el("label", { className: "field__label", text: label, attrs: { for: `reg-${name}` } }),
    hint && el("p", { className: "field__hint", text: hint }),
    control,
    error,
  ]);
  currentFields[name] = { wrap, error };
  return wrap;
};

const textInput = (name, type = "text") =>
  el("input", {
    className: "input",
    attrs: { id: `reg-${name}`, name, type, value: state[name] },
    on: { input: (event) => setValue(name, event.target.value) },
  });

const textArea = (name) =>
  el(
    "textarea",
    {
      className: "textarea",
      attrs: { id: `reg-${name}`, name },
      on: { input: (event) => setValue(name, event.target.value) },
    },
    [state[name]]
  );

const select = (name, options, placeholder) => {
  const node = el("select", {
    className: "select",
    attrs: { id: `reg-${name}`, name },
    on: { change: (event) => setValue(name, event.target.value) },
  });
  node.append(el("option", { text: placeholder, attrs: { value: "" } }));
  options.forEach((option) =>
    node.append(
      el("option", {
        text: option.label,
        attrs: { value: option.value, selected: option.value === state[name] },
      })
    )
  );
  return node;
};

const anonymityChoice = () => {
  const option = (value, title, description) => {
    const id = `reg-anon-${value}`;
    const input = el("input", {
      attrs: {
        type: "radio",
        name: "anonymous",
        id,
        value,
        checked: String(state.anonymous) === value,
      },
      on: {
        change: () => {
          state.anonymous = value === "true";
          scheduleDraft();
          paint();
        },
      },
    });
    return el("label", { className: "choice choice--block", attrs: { for: id } }, [
      input,
      el("span", { className: "stack stack--tight" }, [
        el("strong", { text: title }),
        el("span", { className: "text-muted", text: description }),
      ]),
    ]);
  };

  return el(
    "div",
    { className: "stack stack--tight", attrs: { role: "radiogroup", "aria-label": "Identificação" } },
    [
      option("false", "Identificar-me", "Seu nome fica registrado e pode ser exibido de forma protegida."),
      option("true", "Enviar como anônimo", "Seu nome não será associado publicamente à manifestação."),
    ]
  );
};

const stepIdentify = () => {
  const blocks = [anonymityChoice()];
  if (!state.anonymous) {
    if (user) {
      blocks.push(
        el("p", { className: "register__info", text: `Registrando como ${user.name}.` })
      );
    } else {
      blocks.push(
        field("authorName", "Nome completo", textInput("authorName"), "Como você quer ser identificado.")
      );
    }
  }
  return el("div", { className: "stack" }, blocks);
};

const stepContent = () =>
  el("div", { className: "stack" }, [
    field("title", "Título", textInput("title"), "Resuma sua manifestação em uma frase."),
    el("div", { className: "grid grid--2" }, [
      field("category", "Categoria", select("category", toOptions(categoryLabels), "Selecione")),
      field("sector", "Setor", select("sector", toOptions(sectorLabels), "Selecione")),
    ]),
    field("body", "Descrição", textArea("body"), `Detalhe o ocorrido. Mínimo de ${BODY_MIN} caracteres.`),
  ]);

const summaryRow = (label, value) =>
  el("div", { className: "summary__row" }, [
    el("dt", { className: "summary__label", text: label }),
    el("dd", { className: "summary__value", text: value }),
  ]);

const stepReview = () =>
  el("div", { className: "stack" }, [
    el("p", { className: "text-muted", text: "Revise antes de enviar." }),
    el("dl", { className: "summary" }, [
      summaryRow("Identificação", state.anonymous ? "Anônima" : user?.name ?? state.authorName),
      summaryRow("Categoria", categoryLabels[state.category] ?? "—"),
      summaryRow("Setor", sectorLabels[state.sector] ?? "—"),
      summaryRow("Título", state.title),
      summaryRow("Descrição", state.body),
    ]),
  ]);

const stepViews = [stepIdentify, stepContent, stepReview];

const validateStep = () => {
  const errors = {};
  if (state.step === 0 && !state.anonymous && !user) {
    const message = validateField(state.authorName, [required, minLength(NAME_MIN)]);
    if (message) errors.authorName = message;
  }
  if (state.step === 1) {
    const schema = {
      title: [required, minLength(TITLE_MIN)],
      category: [required, oneOf(valuesOf(Category))],
      sector: [required, oneOf(valuesOf(Sector))],
      body: [required, minLength(BODY_MIN)],
    };
    for (const [name, rules] of Object.entries(schema)) {
      const message = validateField(state[name], rules);
      if (message) errors[name] = message;
    }
  }
  return errors;
};

const showErrors = (errors) => {
  Object.values(currentFields).forEach((entry) => {
    entry.wrap.dataset.invalid = "false";
    entry.error.hidden = true;
  });
  Object.entries(errors).forEach(([name, message]) => {
    const entry = currentFields[name];
    if (!entry) return;
    entry.wrap.dataset.invalid = "true";
    entry.error.textContent = message;
    entry.error.hidden = false;
  });
};

const stepper = () =>
  el(
    "ol",
    { className: "stepper", attrs: { role: "list" } },
    steps.map((label, index) =>
      el(
        "li",
        {
          className: "stepper__item",
          dataset: {
            state: index < state.step ? "done" : index === state.step ? "current" : "todo",
          },
        },
        [
          el("span", { className: "stepper__num", text: String(index + 1) }),
          el("span", { className: "stepper__label", text: label }),
        ]
      )
    )
  );

const submit = async (button) => {
  button.disabled = true;
  const author = user
    ? { id: user.id, name: user.name }
    : { id: null, name: state.anonymous ? "" : state.authorName };
  const manifestation = await manifestationService.create({
    title: state.title,
    body: state.body,
    category: state.category,
    sector: state.sector,
    author,
    anonymous: state.anonymous,
  });
  storage.remove(config.storageKeys.draft);
  renderConfirmation(manifestation);
};

const navButtons = () => {
  const wrap = el("div", { className: "cluster cluster--between register__nav" });

  const back = el("button", {
    className: "btn btn--ghost",
    text: "Voltar",
    attrs: { type: "button", hidden: state.step === 0 },
    on: { click: () => { state.step = Math.max(0, state.step - 1); paint(); } },
  });

  const advance =
    state.step === LAST_STEP
      ? el("button", {
          className: "btn btn--primary",
          text: "Enviar manifestação",
          attrs: { type: "button" },
          on: { click: (event) => submit(event.currentTarget) },
        })
      : el("button", {
          className: "btn btn--primary",
          text: "Avançar",
          attrs: { type: "button" },
          on: {
            click: () => {
              const errors = validateStep();
              if (Object.keys(errors).length > 0) {
                showErrors(errors);
                return;
              }
              state.step = Math.min(LAST_STEP, state.step + 1);
              paint();
            },
          },
        });

  wrap.append(back, advance);
  return wrap;
};

const renderConfirmation = (manifestation) => {
  const host = qs("[data-register]");
  if (!host) return;

  const copy = el("button", {
    className: "btn btn--ghost",
    attrs: { type: "button" },
    on: {
      click: async () => {
        try {
          await navigator.clipboard.writeText(manifestation.protocol);
          toast("Protocolo copiado.", { tone: "success" });
        } catch (error) {
          toast("Não foi possível copiar.", { tone: "danger" });
        }
      },
    },
  });
  copy.append(icon(icons.copy), el("span", { text: "Copiar protocolo" }));

  mount(
    host,
    el("div", { className: "confirmation stack stack--loose" }, [
      el("div", { className: "confirmation__seal" }, [icon(icons.check)]),
      el("div", { className: "stack stack--tight" }, [
        el("h1", { text: "Manifestação enviada" }),
        el("p", {
          className: "text-muted",
          text: "Guarde seu protocolo para acompanhar o andamento.",
        }),
      ]),
      el("div", { className: "confirmation__protocol" }, [
        el("span", { className: "confirmation__code", text: manifestation.protocol }),
        statusPill(manifestation.status),
      ]),
      el("div", { className: "cluster" }, [
        copy,
        el("a", { className: "btn btn--ghost", text: "Ir para o início", attrs: { href: "index.html" } }),
        el("button", {
          className: "btn btn--primary",
          text: "Registrar outra",
          attrs: { type: "button" },
          on: {
            click: () => {
              state = { step: 0, ...blank() };
              paint();
            },
          },
        }),
      ]),
    ])
  );
};

function paint() {
  const host = qs("[data-register]");
  if (!host) return;
  currentFields = {};
  mount(
    host,
    el("div", { className: "register stack stack--loose" }, [
      el("div", { className: "stack stack--tight" }, [
        el("p", { className: "eyebrow", text: "Nova manifestação" }),
        el("h1", { text: "Registrar manifestação" }),
      ]),
      stepper(),
      stepViews[state.step](),
      navButtons(),
    ])
  );
}

paint();
