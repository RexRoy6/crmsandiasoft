import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { isNull } from "drizzle-orm"

/* ---------- GET: solo activas ---------- */
export async function GET() {
  try {
    await requireAuth({ roles: ["admin"] })

    const data = await db
      .select()
      .from(companies)
      .where(isNull(companies.deletedAt))

    return Response.json(data)

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}

/* ---------- POST: crear ---------- */
export async function POST(req: Request) {
  try {
    await requireAuth({ roles: ["admin"] })

    const { name } = await req.json()

    if (!name?.trim()) {
      return Response.json(
        { error: "name required" },
        { status: 400 }
      )
    }

    const result = await db.insert(companies)
      .values({
        name: name.trim()
      })
      .$returningId()

    return Response.json(result)

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}