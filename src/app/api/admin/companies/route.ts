import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"

export async function GET() {
  try {
    await requireAuth({ roles: ["admin"] })

    const data = await db.select().from(companies)

    return Response.json(data)
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}