import { headers } from "next/headers"
import { isValidRole } from "@/lib/auth/roleUtils"
import { UserRole } from "@/db/schema"

export type AuthContext = {
  userId: number
  companyId: number | null
  role: UserRole
}

export async function getAuthContext(): Promise<AuthContext> {
  const h = await headers()

  const userId = h.get("x-user-id")
  const companyId = h.get("x-company-id")
  const role = h.get("x-role")

  if (!userId || !role) {
    throw new Error("Unauthorized: missing auth context")
  }

  const parsedUserId = Number(userId)
  const parsedCompanyId = companyId ? Number(companyId) : null

  if (isNaN(parsedUserId)) {
    throw new Error("Invalid auth context")
  }

  //VALIDACIÓN DEL ROLE
  if (!isValidRole(role)) {
    throw new Error("Invalid role")
  }

  return {
    userId: parsedUserId,
    companyId: parsedCompanyId,
    role
  }
}