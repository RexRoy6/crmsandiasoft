import { db } from "../../db"
import { companies } from "../../db/schema"

export async function GET(){
  const result = await db.select().from(companies)
  return Response.json(result)
}
