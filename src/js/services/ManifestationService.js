import { config } from "../core/config.js";
import { bus, events } from "../core/event-bus.js";
import { repositories } from "../data/repositories.js";
import { Manifestation } from "../models/Manifestation.js";
import { Status } from "../shared/enums.js";
import { createId, createProtocol } from "../shared/id.js";

export const Sort = Object.freeze({
  recent: "recent",
  oldest: "oldest",
  updated: "updated",
});

const sorters = {
  [Sort.recent]: (a, b) => b.createdAt.localeCompare(a.createdAt),
  [Sort.oldest]: (a, b) => a.createdAt.localeCompare(b.createdAt),
  [Sort.updated]: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
};

export class ManifestationService {
  constructor(repository = repositories.manifestations) {
    this.repository = repository;
  }

  async query({
    term = "",
    category = "",
    sector = "",
    status = "",
    authorId = "",
    since = "",
    onlyPublic = false,
    sort = Sort.recent,
    page = 1,
    pageSize = config.pageSize,
  } = {}) {
    let items = await this.repository.list();

    if (onlyPublic) items = items.filter((item) => item.isPublic);
    if (authorId) items = items.filter((item) => item.authorId === authorId);
    if (category) items = items.filter((item) => item.category === category);
    if (sector) items = items.filter((item) => item.sector === sector);
    if (status) items = items.filter((item) => item.status === status);
    if (since) items = items.filter((item) => item.createdAt >= since);
    if (term) items = items.filter((item) => item.matches(term));

    items.sort(sorters[sort] ?? sorters[Sort.recent]);

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(Math.max(1, page), pages);
    const start = (current - 1) * pageSize;

    return {
      items: items.slice(start, start + pageSize),
      total,
      page: current,
      pages,
      pageSize,
    };
  }

  getById(id) {
    return this.repository.getById(id);
  }

  getByProtocol(protocol) {
    return this.repository.getByProtocol(protocol);
  }

  async create({ title, body, category, sector, author, anonymous }) {
    const now = new Date().toISOString();
    const manifestation = new Manifestation({
      id: createId(),
      protocol: createProtocol(),
      title,
      body,
      category,
      sector,
      status: Status.draft,
      authorId: author?.id ?? null,
      authorName: author?.name ?? "",
      anonymous,
      createdAt: now,
      updatedAt: now,
    });

    manifestation.applyStatus(Status.sent, { actor: author?.id ?? null, at: now });
    manifestation.applyStatus(Status.awaitingModeration, { at: now });

    await this.repository.save(manifestation);
    bus.emit(events.manifestationChanged, manifestation);
    return manifestation;
  }

  async addComplement(id, text, actorId) {
    const manifestation = await this.repository.getById(id);
    if (!manifestation) return null;
    manifestation.applyStatus(Status.underReview, {
      actor: actorId,
      note: text,
    });
    await this.repository.save(manifestation);
    bus.emit(events.manifestationChanged, manifestation);
    return manifestation;
  }

  async rate(id, { resolution, score, comment }, actorId) {
    const manifestation = await this.repository.getById(id);
    if (!manifestation) return null;
    const at = new Date().toISOString();
    manifestation.setRating({ resolution, score, comment, at });
    manifestation.applyStatus(resolution, { actor: actorId, at });
    await this.repository.save(manifestation);
    bus.emit(events.manifestationChanged, manifestation);
    return manifestation;
  }
}

export const manifestationService = new ManifestationService();
