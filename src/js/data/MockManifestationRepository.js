import { config } from "../core/config.js";
import { storage } from "../core/storage.js";
import { Manifestation } from "../models/Manifestation.js";
import { Repository } from "./Repository.js";
import { seedManifestations } from "./seed/manifestations.js";

export class MockManifestationRepository extends Repository {
  constructor(store = storage) {
    super();
    this.store = store;
    this.key = config.storageKeys.store;
  }

  load() {
    const persisted = this.store.read(this.key);
    if (persisted) return persisted;
    this.store.write(this.key, seedManifestations);
    return seedManifestations;
  }

  persist(records) {
    this.store.write(this.key, records);
  }

  async list() {
    return this.load().map(Manifestation.fromJSON);
  }

  async getById(id) {
    const found = this.load().find((record) => record.id === id);
    return found ? Manifestation.fromJSON(found) : null;
  }

  async getByProtocol(protocol) {
    const found = this.load().find((record) => record.protocol === protocol);
    return found ? Manifestation.fromJSON(found) : null;
  }

  async save(manifestation) {
    const records = this.load();
    const data = manifestation.toJSON();
    const index = records.findIndex((record) => record.id === data.id);
    if (index === -1) records.unshift(data);
    else records[index] = data;
    this.persist(records);
    return manifestation;
  }
}
