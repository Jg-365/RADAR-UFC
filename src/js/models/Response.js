export class Response {
  constructor({ id, sector, author, body, at }) {
    this.id = id;
    this.sector = sector;
    this.author = author;
    this.body = body;
    this.at = at;
  }

  static fromJSON(data) {
    return new Response(data);
  }

  toJSON() {
    return {
      id: this.id,
      sector: this.sector,
      author: this.author,
      body: this.body,
      at: this.at,
    };
  }
}
