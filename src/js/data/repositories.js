import { config } from "../core/config.js";
import { MockManifestationRepository } from "./MockManifestationRepository.js";
import { MockUserRepository } from "./MockUserRepository.js";

const factories = {
  mock: () => ({
    manifestations: new MockManifestationRepository(),
    users: new MockUserRepository(),
  }),
  api: () => {
    throw new Error("API repositories not configured yet.");
  },
};

const build = factories[config.dataSource] ?? factories.mock;

export const repositories = build();
