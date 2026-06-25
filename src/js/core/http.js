import { config } from "./config.js";
import { Result } from "../shared/result.js";

export class HttpClient {
  constructor(baseUrl = config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) return Result.failure(data);
      return Result.success(data);
    } catch (error) {
      return Result.failure(error.message);
    }
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, { method: "POST", body: JSON.stringify(body) });
  }

  put(path, body) {
    return this.request(path, { method: "PUT", body: JSON.stringify(body) });
  }

  delete(path) {
    return this.request(path, { method: "DELETE" });
  }
}

export const http = new HttpClient();
