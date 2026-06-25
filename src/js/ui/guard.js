import { config } from "../core/config.js";
import { authService } from "../services/AuthService.js";
import { routes } from "../shared/routes.js";

const currentFile = () => window.location.pathname.split("/").pop() || routes.home;

export const requireRoles = (...roles) => {
  const user = authService.currentUser();
  if (!user || (roles.length > 0 && !user.hasRole(...roles))) {
    const next = encodeURIComponent(currentFile());
    window.location.replace(`${routes.login}?${config.nextParam}=${next}`);
    return null;
  }
  return user;
};
