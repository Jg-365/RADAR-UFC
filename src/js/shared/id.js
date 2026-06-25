import { config } from "../core/config.js";

export const createId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const createProtocol = (date = new Date()) => {
  const year = date.getFullYear();
  const ceiling = 10 ** config.protocolDigits;
  const sequence = Math.floor(Math.random() * ceiling)
    .toString()
    .padStart(config.protocolDigits, "0");
  return `${config.protocolPrefix}-${year}-${sequence}`;
};
