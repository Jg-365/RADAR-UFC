export class StatusHistory {
  constructor({ status, at, actor = null, note = "" }) {
    this.status = status;
    this.at = at;
    this.actor = actor;
    this.note = note;
  }

  static fromJSON(data) {
    return new StatusHistory(data);
  }

  toJSON() {
    return {
      status: this.status,
      at: this.at,
      actor: this.actor,
      note: this.note,
    };
  }
}
