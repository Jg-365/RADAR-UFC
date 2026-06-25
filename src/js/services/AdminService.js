import { bus, events } from "../core/event-bus.js";
import { repositories } from "../data/repositories.js";
import { Response } from "../models/Response.js";
import { Status } from "../shared/enums.js";
import { createId } from "../shared/id.js";
import { Result } from "../shared/result.js";

export class AdminService {
  constructor(repository = repositories.manifestations) {
    this.repository = repository;
  }

  async transition(id, status, actor, note = "") {
    const manifestation = await this.repository.getById(id);
    if (!manifestation) return Result.failure("Manifestação não encontrada.");
    if (!manifestation.canTransitionTo(status)) {
      return Result.failure("Transição de status não permitida.");
    }
    manifestation.applyStatus(status, { actor, note });
    await this.repository.save(manifestation);
    bus.emit(events.manifestationChanged, manifestation);
    return Result.success(manifestation);
  }

  async forward(id, sector, actor) {
    const result = await this.transition(id, Status.forwarded, actor);
    if (result.ok) {
      result.value.sector = sector;
      await this.repository.save(result.value);
    }
    return result;
  }

  startReview(id, actor) {
    return this.transition(id, Status.underReview, actor);
  }

  async respond(id, { sector, author, body }, actor) {
    const manifestation = await this.repository.getById(id);
    if (!manifestation) return Result.failure("Manifestação não encontrada.");
    if (!manifestation.canTransitionTo(Status.answered)) {
      return Result.failure("Responda apenas manifestações em análise.");
    }
    manifestation.addResponse(
      new Response({ id: createId(), sector, author, body, at: new Date().toISOString() })
    );
    manifestation.applyStatus(Status.answered, { actor });
    await this.repository.save(manifestation);
    bus.emit(events.manifestationChanged, manifestation);
    return Result.success(manifestation);
  }

  close(id, actor, note) {
    return this.transition(id, Status.closed, actor, note);
  }
}

export const adminService = new AdminService();
