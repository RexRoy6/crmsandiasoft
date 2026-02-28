import { requireAuth } from "@/lib/auth/requireAuth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm" 

export async function GET() {
  try {
    const auth = await requireAuth()
    const userId = auth.userId

    const data = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))

    return Response.json(data)

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}