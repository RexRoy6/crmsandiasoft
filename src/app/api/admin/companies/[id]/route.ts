import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"

/* ---------- GET ONE (aunque esté desactivada) ---------- */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    //await requireAuth({ roles: ["admin"] })

    const company = await db.query.companies.findFirst({
      where: eq(companies.id, Number(params.id))
    })

    if (!company) {
      return Response.json(
        { error: "not found" },
        { status: 404 }
      )
    }

    return Response.json(company)

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }

  
}

/* ---------- DELETE = soft delete ---------- */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    //await requireAuth({ roles: ["admin"] })

    await db.update(companies)
      .set({ deletedAt: new Date() })
      .where(eq(companies.id, Number(params.id)))

    return Response.json({
      success: true,
      message: "company deactivated"
    })

  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }
}