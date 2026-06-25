import { bus, events } from "../core/event-bus.js";
import { repositories } from "../data/repositories.js";
import { Status } from "../shared/enums.js";
import { Result } from "../shared/result.js";

export class ModerationService {
  constructor(repository = repositories.manifestations) {
    this.repository = repository;
  }

  async queue() {
    const items = await this.repository.list();
    return items.filter((item) => item.status === Status.awaitingModeration);
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

  approve(id, actor, note) {
    return this.transition(id, Status.published, actor, note);
  }

  reject(id, actor, note) {
    return this.transition(id, Status.rejected, actor, note);
  }

  requestAdjustment(id, actor, note) {
    return this.transition(id, Status.adjustmentRequested, actor, note);
  }
}

export const moderationService = new ModerationService();
