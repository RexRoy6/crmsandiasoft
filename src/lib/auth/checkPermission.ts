import { RBAC_CONFIG } from "./rbacConfig"
import { UserRole } from "@/db/schema"

export function checkPermission(
  pathname: string,
  method: string,
  role: UserRole
) {
  const routeConfig = RBAC_CONFIG[pathname]

  if (!routeConfig) return true // sin config = permitido

  const allowedRoles = routeConfig[method]

  if (!allowedRoles) return true

  return allowedRoles.includes(role)
}