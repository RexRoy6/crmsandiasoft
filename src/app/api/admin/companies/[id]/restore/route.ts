import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"



/* ---------- reactivar compañia desactivada ---------- */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth({ roles: ["admin"] })

    await db.update(companies)
      .set({ deletedAt: null })
      .where(eq(companies.id, Number(params.id)))

    return Response.json({
      success: true,
      message: "company re-activated"
    })

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}