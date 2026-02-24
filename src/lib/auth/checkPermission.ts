import { match } from "path-to-regexp";
import { RBAC_CONFIG } from "./rbacConfig";
import { UserRole } from "@/db/schema";

export function checkPermission(
  pathname: string,
  method: string,
  role: UserRole,
) {
  for (const route of RBAC_CONFIG) {
    const isMatch = match(route.pattern)(pathname);

    if (!isMatch) continue;

    const allowedRoles = route.methods[method];

    if (!allowedRoles) return true;

    return allowedRoles.includes(role);
  }

  return true;
}
