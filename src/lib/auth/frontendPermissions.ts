import { UserRole } from "@/db/schema"

export type RoutePermission = {
  path: string
  roles: UserRole[]
}

export const FRONTEND_PERMISSIONS: RoutePermission[] = [

  {
    path: "/company/contracts",
    roles: ["owner", "employee"]
  },

  {
    path: "/company/contracts/new",
    roles: ["owner", "employee"]
  },

  {
    path: "/company/clients",
    roles: ["owner", "employee"]
  },

  {
    path: "/company/payments",
    roles: ["owner", "employee"]
  },

  {
    path: "/company/users",
    roles: ["owner"]
  },

  {
    path: "/company/settings",
    roles: ["owner"]
  }
]