import { UserRole } from "@/db/schema"

/*
  Ruta → método → roles permitidos
  este archivo permite modificar que ruta se puede acceder segun el rol
*/

export const RBAC_CONFIG: Record<
  string,
  Partial<Record<string, UserRole[]>>
> = {
  "/api/companies": {
    GET: ["admin"],
    POST: ["admin"]
  },

  "/api/clients": {
    GET: ["admin", "owner"],
    POST: ["admin", "owner"]
  },

  "/api/services": {
    GET: ["admin", "owner"],
    POST: ["owner"]
  }
}