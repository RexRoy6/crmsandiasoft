import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth/jwt"
import { isValidRole } from "@/lib/auth/roleUtils"
import { UserRole } from "@/db/schema"

export type AuthContext = {
  userId: number
  companyId: number | null
  role: UserRole
}

export async function getAuthContext(): Promise<AuthContext> {
  /* ---------- leer token desde cookie ---------- */
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    throw new Error("Unauthorized: no token")
  }

  try {
    /* ---------- verificar JWT ---------- */
    const payload = await verifyToken(token)

    const parsedUserId = Number(payload.userId)
    const parsedCompanyId = payload.companyId
      ? Number(payload.companyId)
      : null

    if (isNaN(parsedUserId)) {
      throw new Error("Invalid auth context")
    }

    /* ---------- validar role ---------- */
    if (!payload.role || !isValidRole(payload.role)) {
      throw new Error("Invalid role")
    }

    return {
      userId: parsedUserId,
      companyId: parsedCompanyId,
      role: payload.role
    }

  } catch {
    throw new Error("Unauthorized: invalid token")
  }
}