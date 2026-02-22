import { getAuthContext } from "@/lib/auth/getAuthContext"
import { UserRole } from "@/db/schema"

export type RequireAuthOptions = {
  roles?: UserRole[]
}

export async function requireAuth(options?: RequireAuthOptions) {
  const auth = await getAuthContext()

  if (!auth.userId) {
    throw new Error("Unauthorized")
  }

  if (options?.roles?.length && !options.roles.includes(auth.role)) {
    throw new Error("Forbidden")
  }

 return auth as Readonly<typeof auth>
}