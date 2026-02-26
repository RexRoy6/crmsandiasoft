import { match } from "path-to-regexp"
import { RBAC_CONFIG } from "./rbacConfig"
import { UserRole } from "@/db/schema"

export function checkPermission(
  pathname: string,
  method: string,
  role: UserRole
) {
  for (const route of RBAC_CONFIG) {
    const matcher = match(route.pattern, {
      decode: decodeURIComponent
    })

    const result = matcher(pathname)

    if (!result) continue

    const allowedRoles = route.methods[method]

    // si la ruta existe pero el método no está definido → DENEGAR
    if (!allowedRoles) return false

    return allowedRoles.includes(role)
  }

  // si no hay regla → DENEGAR (secure by default)
  return false
}