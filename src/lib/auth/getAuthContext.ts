import { headers } from "next/headers"

export type AuthContext = {
  userId: number
  companyId: number
  role: string
}

export async function getAuthContext():  Promise<AuthContext> {

  const h = await headers()

  const userId = h.get("x-user-id")
  const companyId = h.get("x-company-id")
  const role = h.get("x-role")

  if(!userId || !companyId || !role){
    throw new Error("Unauthorized: missing auth context")
  }

  const parsedUserId = Number(userId)
  const parsedCompanyId = Number(companyId)

  if(isNaN(parsedUserId) || isNaN(parsedCompanyId)){
    throw new Error("Invalid auth context")
  }

  return {
    userId: parsedUserId,
    companyId: parsedCompanyId,
    role
  }
}