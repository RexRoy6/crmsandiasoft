import { UserRole } from "@/db/schema"

export type RbacRoute = {
  pattern: string
  methods: Partial<Record<string, UserRole[]>>
}

export const RBAC_CONFIG: RbacRoute[] = [
    {
  pattern: "/api/admin/:path*",
  methods: {
    GET: ["admin"],
    POST: ["admin"],
    PATCH: ["admin"],
    DELETE: ["admin"]
  }
},
  {
    pattern: "/api/companies",
    methods: {
      GET: ["admin"],
      POST: ["admin"]
    }
  },

  {
    pattern: "/api/companies/:id",
    methods: {
      DELETE: ["admin"],
      PATCH: ["admin"]
    }
  },

  {
    pattern: "/api/clients",
    methods: {
      GET: ["admin", "owner"],
      POST: ["admin", "owner"]
    }
  },

  {
    pattern: "/api/clients/:id",
    methods: {
      GET: ["admin", "owner"],
      PATCH: ["admin", "owner"]
    }
  }
]