import { db } from "@/db"
import { users } from "@/db/schema"
import { hashPassword } from "@/lib/auth/password"

export async function POST(req: Request) {
  const { email, password, companyId } = await req.json()

  const passwordHash = await hashPassword(password)

  const result = await db.insert(users)
    .values({
      email,
      passwordHash,
      companyId,
      role: "owner"
    })
    .$returningId()

  return Response.json(result)
}