import {
  createEvent,
  getEvents,getEventsByClient
} from "@/lib/services/eventService"

import {
  createEventSchema
} from "@/lib/validations/eventValidation"


/* ---------- POST (create event) ---------- */
export async function POST(req: Request) {
  try {

    const body = await req.json()

    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const created = await createEvent(parsed.data)

    return Response.json(created, { status: 201 })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}


/* ---------- GET (company events) ---------- */
export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)

    const clientId = searchParams.get("clientId")
    const search = searchParams.get("search") || undefined
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    const result = await getEvents({
      clientId: clientId ? Number(clientId) : undefined,
      search,
      page,
      limit
    })

    return Response.json(result)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}
/* ---------- GET (company events) ---------- */
