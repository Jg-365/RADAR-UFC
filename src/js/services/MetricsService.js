import { repositories } from "../data/repositories.js";
import { Status, RESOLUTION } from "../shared/enums.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const countBy = (items, pick) => {
  const counts = {};
  for (const item of items) {
    const key = pick(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

const resolutionDays = (manifestation) => {
  const closure = manifestation.history.find((entry) =>
    [Status.resolved, Status.unresolved, Status.closed].includes(entry.status)
  );
  if (!closure) return null;
  const start = new Date(manifestation.createdAt).getTime();
  const end = new Date(closure.at).getTime();
  return (end - start) / MS_PER_DAY;
};

export class MetricsService {
  constructor(repository = repositories.manifestations) {
    this.repository = repository;
  }

  async overview({ since = "" } = {}) {
    let items = await this.repository.list();
    if (since) items = items.filter((item) => item.createdAt >= since);
    const total = items.length;
    const resolved = items.filter(
      (item) => item.rating?.resolution === RESOLUTION.resolved
    ).length;
    const durations = items.map(resolutionDays).filter((value) => value != null);
    const avgResolutionDays =
      durations.length === 0
        ? 0
        : durations.reduce((sum, value) => sum + value, 0) / durations.length;

    return {
      total,
      resolved,
      resolutionRate: total === 0 ? 0 : resolved / total,
      avgResolutionDays,
      byStatus: countBy(items, (item) => item.status),
      byCategory: countBy(items, (item) => item.category),
      bySector: countBy(items, (item) => item.sector),
    };
  }
}

export const metricsService = new MetricsService();
