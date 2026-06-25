import { qs, el, mount } from "../../core/dom.js";
import { statusPill } from "../../ui/components.js";
import { statusLabels, statusDescriptions } from "../../shared/labels.js";
import { routes } from "../../shared/routes.js";

const steps = [
  { title: "Registro", text: "Você descreve a manifestação e recebe um protocolo para acompanhar." },
  { title: "Moderação", text: "A equipe revisa o conteúdo e publica, recusa ou solicita ajustes." },
  { title: "Encaminhamento", text: "A manifestação publicada é encaminhada ao setor responsável." },
  { title: "Análise", text: "O setor analisa a demanda e pode pedir informações complementares." },
  { title: "Resposta", text: "O setor responde institucionalmente à manifestação." },
  { title: "Avaliação", text: "Você avalia se a demanda foi resolvida ou não." },
  { title: "Encerramento", text: "Concluído o ciclo, a manifestação é encerrada." },
];

const processList = () =>
  el(
    "ol",
    { className: "process", attrs: { role: "list" } },
    steps.map((step, index) =>
      el("li", { className: "process__item" }, [
        el("span", { className: "process__num", text: String(index + 1) }),
        el("div", { className: "stack stack--tight" }, [
          el("h3", { text: step.title }),
          el("p", { className: "text-muted", text: step.text }),
        ]),
      ])
    )
  );

const glossary = () =>
  el(
    "div",
    { className: "glossary" },
    Object.keys(statusLabels).map((status) =>
      el("div", { className: "glossary__item" }, [
        statusPill(status),
        el("p", { className: "text-muted", text: statusDescriptions[status] }),
      ])
    )
  );

const cta = () =>
  el("div", { className: "cta" }, [
    el("div", { className: "stack stack--tight" }, [
      el("h2", { text: "Pronto para ser ouvido?" }),
      el("p", { text: "Registre sua manifestação e acompanhe cada etapa." }),
    ]),
    el("a", { className: "btn btn--primary", text: "Registrar manifestação", attrs: { href: routes.register } }),
  ]);

const render = () => {
  const host = qs("[data-how]");
  if (!host) return;

  mount(
    host,
    el("div", { className: "stack stack--loose" }, [
      el("div", { className: "stack stack--tight" }, [
        el("p", { className: "eyebrow", text: "Como funciona" }),
        el("h1", { text: "Do registro à resposta" }),
        el("p", { className: "text-muted", text: "Entenda o caminho de uma manifestação no RADAR UFC." }),
      ]),
      el("section", { className: "stack" }, [el("h2", { text: "O fluxo" }), processList()]),
      el("section", { className: "stack" }, [
        el("h2", { text: "Glossário de status" }),
        glossary(),
      ]),
      cta(),
    ])
  );
};

render();
