import { Role, Category, Sector, Status } from "./enums.js";

export const roleLabels = Object.freeze({
  [Role.visitor]: "Visitante",
  [Role.user]: "Usuário",
  [Role.moderator]: "Moderador",
  [Role.admin]: "Administrador",
});

export const categoryLabels = Object.freeze({
  [Category.complaint]: "Reclamação",
  [Category.suggestion]: "Sugestão",
  [Category.praise]: "Elogio",
  [Category.report]: "Denúncia",
  [Category.question]: "Dúvida",
  [Category.request]: "Solicitação",
});

export const sectorLabels = Object.freeze({
  [Sector.prograd]: "PROGRAD",
  [Sector.prae]: "PRAE",
  [Sector.library]: "Biblioteca",
  [Sector.it]: "STI / TI",
  [Sector.infrastructure]: "Infraestrutura",
  [Sector.restaurant]: "Restaurante Universitário",
  [Sector.secretariat]: "Secretaria",
  [Sector.others]: "Outros",
});

export const statusLabels = Object.freeze({
  [Status.draft]: "Rascunho",
  [Status.sent]: "Enviada",
  [Status.awaitingModeration]: "Aguardando moderação",
  [Status.rejected]: "Recusada na moderação",
  [Status.adjustmentRequested]: "Ajuste solicitado",
  [Status.published]: "Publicada",
  [Status.forwarded]: "Encaminhada",
  [Status.underReview]: "Em análise",
  [Status.awaitingComplement]: "Aguardando complemento",
  [Status.answered]: "Respondida",
  [Status.resolved]: "Resolvida",
  [Status.unresolved]: "Não resolvida",
  [Status.closed]: "Encerrada",
});

export const statusTones = Object.freeze({
  [Status.draft]: "neutral",
  [Status.sent]: "neutral",
  [Status.awaitingModeration]: "warning",
  [Status.rejected]: "danger",
  [Status.adjustmentRequested]: "warning",
  [Status.published]: "info",
  [Status.forwarded]: "info",
  [Status.underReview]: "info",
  [Status.awaitingComplement]: "warning",
  [Status.answered]: "primary",
  [Status.resolved]: "success",
  [Status.unresolved]: "danger",
  [Status.closed]: "neutral",
});

export const statusDescriptions = Object.freeze({
  [Status.draft]: "Manifestação salva, ainda não enviada.",
  [Status.sent]: "Enviada para triagem inicial.",
  [Status.awaitingModeration]: "Aguardando revisão da equipe de moderação.",
  [Status.rejected]: "Recusada na moderação por não atender aos critérios.",
  [Status.adjustmentRequested]: "A moderação solicitou ajustes ao autor.",
  [Status.published]: "Publicada e visível na listagem pública.",
  [Status.forwarded]: "Encaminhada ao setor responsável.",
  [Status.underReview]: "Em análise pelo setor responsável.",
  [Status.awaitingComplement]: "Aguardando informações complementares do autor.",
  [Status.answered]: "Respondida institucionalmente pelo setor.",
  [Status.resolved]: "O autor considerou a demanda resolvida.",
  [Status.unresolved]: "O autor considerou a demanda não resolvida.",
  [Status.closed]: "Manifestação encerrada.",
});

export const toOptions = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
