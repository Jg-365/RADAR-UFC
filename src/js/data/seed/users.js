import { Role, Sector } from "../../shared/enums.js";

export const seedUsers = [
  {
    id: "u-ana",
    name: "Ana Carvalho",
    email: "ana@alu.ufc.br",
    password: "ufc123",
    role: Role.user,
    sector: null,
  },
  {
    id: "u-bruno",
    name: "Bruno Tavares",
    email: "bruno@alu.ufc.br",
    password: "ufc123",
    role: Role.user,
    sector: null,
  },
  {
    id: "u-marina",
    name: "Marina Lopes",
    email: "marina@ufc.br",
    password: "mod123",
    role: Role.moderator,
    sector: null,
  },
  {
    id: "u-diretor",
    name: "Carlos Mendes",
    email: "carlos@ufc.br",
    password: "adm123",
    role: Role.admin,
    sector: Sector.prograd,
  },
];
