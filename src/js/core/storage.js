export class Storage {
  constructor(backend = window.localStorage) {
    this.backend = backend;
  }

  read(key, fallback = null) {
    try {
      const raw = this.backend.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  write(key, value) {
    try {
      this.backend.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key) {
    this.backend.removeItem(key);
  }
}

export const storage = new Storage();
