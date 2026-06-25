export class Rating {
  constructor({ resolution, score, comment = "", at }) {
    this.resolution = resolution;
    this.score = score;
    this.comment = comment;
    this.at = at;
  }

  static fromJSON(data) {
    return data ? new Rating(data) : null;
  }

  toJSON() {
    return {
      resolution: this.resolution,
      score: this.score,
      comment: this.comment,
      at: this.at,
    };
  }
}
