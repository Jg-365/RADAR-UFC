import { config } from "../core/config.js";

export const routes = Object.freeze({
  home: "index.html",
  manifestations: "manifestacoes.html",
  manifestationDetail: "detalhe-manifestacao.html",
  register: "registrar.html",
  login: "login.html",
  myManifestations: "minhas-manifestacoes.html",
  moderation: "moderacao.html",
  admin: "admin-dashboard.html",
  transparency: "transparencia.html",
  howItWorks: "como-funciona.html",
});

export const detailUrl = (protocol) =>
  `${routes.manifestationDetail}?${config.protocolParam}=${encodeURIComponent(
    protocol
  )}`;

export const searchUrl = (term) =>
  `${routes.manifestations}?${config.searchParam}=${encodeURIComponent(term)}`;
