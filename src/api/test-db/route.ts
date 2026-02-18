import { db } from "../../db"
import { companies } from "../../db/schema"

export async function GET() {
  const data = await db.select().from(companies)

  return Response.json({
    success: true,
    data
  })
}