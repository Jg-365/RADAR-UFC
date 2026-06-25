import { User } from "../models/User.js";
import { Repository } from "./Repository.js";
import { seedUsers } from "./seed/users.js";

const toUser = ({ password, ...data }) => User.fromJSON(data);

export class MockUserRepository extends Repository {
  constructor(records = seedUsers) {
    super();
    this.records = records.slice();
  }

  async list() {
    return this.records.map(toUser);
  }

  async getById(id) {
    const found = this.records.find((record) => record.id === id);
    return found ? toUser(found) : null;
  }

  async findByEmail(email) {
    const found = this.records.find(
      (record) => record.email.toLowerCase() === String(email).toLowerCase()
    );
    return found ? toUser(found) : null;
  }

  async findByCredentials(email, password) {
    const found = this.records.find(
      (record) =>
        record.email.toLowerCase() === String(email).toLowerCase() &&
        record.password === password
    );
    return found ? toUser(found) : null;
  }

  async save(user) {
    const data = { ...user.toJSON(), password: user.password ?? "ufc123" };
    const index = this.records.findIndex((record) => record.id === data.id);
    if (index === -1) this.records.push(data);
    else this.records[index] = { ...this.records[index], ...data };
    return toUser(data);
  }
}
