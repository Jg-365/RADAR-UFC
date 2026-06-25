import { Role } from "../shared/enums.js";

export class User {
  constructor({ id, name, email, role = Role.user, sector = null }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.sector = sector;
  }

  isStaff() {
    return this.role === Role.moderator || this.role === Role.admin;
  }

  hasRole(...roles) {
    return roles.includes(this.role);
  }

  static fromJSON(data) {
    return data ? new User(data) : null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      sector: this.sector,
    };
  }
}
