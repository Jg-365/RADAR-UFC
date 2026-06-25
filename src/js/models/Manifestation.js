import {
  Status,
  PUBLIC_STATUSES,
  STATUS_TRANSITIONS,
} from "../shared/enums.js";
import { anonymizeName } from "../shared/formatters.js";
import { StatusHistory } from "./StatusHistory.js";
import { Response } from "./Response.js";
import { Rating } from "./Rating.js";

export class Manifestation {
  constructor({
    id,
    protocol,
    title,
    body,
    category,
    sector,
    status = Status.draft,
    authorId = null,
    authorName = "",
    anonymous = false,
    createdAt,
    updatedAt,
    history = [],
    responses = [],
    rating = null,
  }) {
    this.id = id;
    this.protocol = protocol;
    this.title = title;
    this.body = body;
    this.category = category;
    this.sector = sector;
    this.status = status;
    this.authorId = authorId;
    this.authorName = authorName;
    this.anonymous = anonymous;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.history = history.map(StatusHistory.fromJSON);
    this.responses = responses.map(Response.fromJSON);
    this.rating = Rating.fromJSON(rating);
  }

  get displayAuthor() {
    return this.anonymous ? "Anônimo" : anonymizeName(this.authorName);
  }

  get isPublic() {
    return PUBLIC_STATUSES.includes(this.status);
  }

  get latestResponse() {
    return this.responses[this.responses.length - 1] ?? null;
  }

  get isAwaitingRating() {
    return this.status === Status.answered && !this.rating;
  }

  canTransitionTo(status) {
    return (STATUS_TRANSITIONS[this.status] ?? []).includes(status);
  }

  applyStatus(status, { actor = null, note = "", at = new Date().toISOString() } = {}) {
    this.status = status;
    this.updatedAt = at;
    this.history.push(new StatusHistory({ status, at, actor, note }));
    return this;
  }

  addResponse(response) {
    this.responses.push(
      response instanceof Response ? response : new Response(response)
    );
    return this;
  }

  setRating(rating) {
    this.rating = rating instanceof Rating ? rating : new Rating(rating);
    return this;
  }

  matches(term) {
    if (!term) return true;
    const haystack = `${this.title} ${this.body} ${this.protocol}`.toLowerCase();
    return haystack.includes(term.toLowerCase());
  }

  static fromJSON(data) {
    return new Manifestation(data);
  }

  toJSON() {
    return {
      id: this.id,
      protocol: this.protocol,
      title: this.title,
      body: this.body,
      category: this.category,
      sector: this.sector,
      status: this.status,
      authorId: this.authorId,
      authorName: this.authorName,
      anonymous: this.anonymous,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      history: this.history.map((entry) => entry.toJSON()),
      responses: this.responses.map((entry) => entry.toJSON()),
      rating: this.rating ? this.rating.toJSON() : null,
    };
  }
}
