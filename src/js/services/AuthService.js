import { config } from "../core/config.js";
import { storage } from "../core/storage.js";
import { bus, events } from "../core/event-bus.js";
import { repositories } from "../data/repositories.js";
import { User } from "../models/User.js";
import { Role } from "../shared/enums.js";
import { createId } from "../shared/id.js";
import { Result } from "../shared/result.js";

export class AuthService {
  constructor(repository = repositories.users, store = storage) {
    this.repository = repository;
    this.store = store;
    this.key = config.storageKeys.session;
  }

  currentUser() {
    return User.fromJSON(this.store.read(this.key));
  }

  isAuthenticated() {
    return this.currentUser() != null;
  }

  hasRole(...roles) {
    const user = this.currentUser();
    return user != null && user.hasRole(...roles);
  }

  async login(email, password) {
    const user = await this.repository.findByCredentials(email, password);
    if (!user) return Result.failure("E-mail ou senha inválidos.");
    this.store.write(this.key, user.toJSON());
    bus.emit(events.sessionChanged, user);
    return Result.success(user);
  }

  async register({ name, email, password }) {
    const existing = await this.repository.findByEmail(email);
    if (existing) return Result.failure("Já existe uma conta com este e-mail.");
    const user = new User({ id: createId(), name, email, role: Role.user });
    user.password = password;
    await this.repository.save(user);
    this.store.write(this.key, user.toJSON());
    bus.emit(events.sessionChanged, user);
    return Result.success(user);
  }

  logout() {
    this.store.remove(this.key);
    bus.emit(events.sessionChanged, null);
  }
}

export const authService = new AuthService();
