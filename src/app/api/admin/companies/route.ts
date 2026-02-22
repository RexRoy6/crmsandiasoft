import { db } from "@/db"
import { companies } from "@/db/schema"

export async function GET() {
  const data = await db.select().from(companies)
  return Response.json(data)
}

export async function POST(req: Request) {
  const { name } = await req.json()

  const result = await db.insert(companies)
    .values({ name })
    .$returningId()

  return Response.json(result)
}