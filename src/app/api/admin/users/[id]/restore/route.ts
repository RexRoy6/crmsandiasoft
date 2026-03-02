import { db } from "@/db"
import { users } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"

/* ---------- restore soft deleted company ---------- */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------- AUTH ---------- */
    let auth
      auth = await requireAuth({ roles: ["admin"] })
   /* ---------- unwrap params ---------- */
        const { id } = await params
        const userId = Number(id)
    /* ---------- validate id ---------- */
    if (Number.isNaN(userId)) {
      return Response.json(
        { error: "invalid id" },
        { status: 400 }
      )
    }
    /* ---------- check if company exists ---------- */
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })
    if (!user) {
      return Response.json(
        { error: "user not found" },
        { status: 404 }
      )
    }
    /* ---------- check if already active ---------- */
    if (user.deletedAt === null) {
      return Response.json(
        { error: "user already active" },
        { status: 409 } // conflict
      )
    }
    /* ---------- restore company ---------- */
    await db
      .update(users)
      .set({ deletedAt: null })
      .where(eq(users.id, userId))
    /* ---------- success ---------- */
    return Response.json(
      {
        success: true,
        message: "user re-activated"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}