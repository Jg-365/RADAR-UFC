export const Role = Object.freeze({
  visitor: "visitor",
  user: "user",
  moderator: "moderator",
  admin: "admin",
});

export const Category = Object.freeze({
  complaint: "complaint",
  suggestion: "suggestion",
  praise: "praise",
  report: "report",
  question: "question",
  request: "request",
});

export const Sector = Object.freeze({
  prograd: "prograd",
  prae: "prae",
  library: "library",
  it: "it",
  infrastructure: "infrastructure",
  restaurant: "restaurant",
  secretariat: "secretariat",
  others: "others",
});

export const Status = Object.freeze({
  draft: "draft",
  sent: "sent",
  awaitingModeration: "awaiting_moderation",
  rejected: "rejected",
  adjustmentRequested: "adjustment_requested",
  published: "published",
  forwarded: "forwarded",
  underReview: "under_review",
  awaitingComplement: "awaiting_complement",
  answered: "answered",
  resolved: "resolved",
  unresolved: "unresolved",
  closed: "closed",
});

export const RESOLUTION = Object.freeze({
  resolved: "resolved",
  unresolved: "unresolved",
});

export const PUBLIC_STATUSES = Object.freeze([
  Status.published,
  Status.forwarded,
  Status.underReview,
  Status.answered,
  Status.resolved,
  Status.unresolved,
  Status.closed,
]);

export const STATUS_TRANSITIONS = Object.freeze({
  [Status.draft]: [Status.sent],
  [Status.sent]: [Status.awaitingModeration],
  [Status.awaitingModeration]: [
    Status.published,
    Status.rejected,
    Status.adjustmentRequested,
  ],
  [Status.adjustmentRequested]: [Status.awaitingModeration],
  [Status.published]: [Status.forwarded],
  [Status.forwarded]: [Status.underReview],
  [Status.underReview]: [Status.answered, Status.awaitingComplement],
  [Status.awaitingComplement]: [Status.underReview],
  [Status.answered]: [Status.resolved, Status.unresolved],
  [Status.resolved]: [Status.closed],
  [Status.unresolved]: [Status.closed, Status.underReview],
  [Status.rejected]: [],
  [Status.closed]: [],
});

export const valuesOf = (enumObject) => Object.freeze(Object.values(enumObject));
