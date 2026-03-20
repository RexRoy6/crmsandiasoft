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

/* ---------- GET (company events) ---------- */
export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)

    const clientId = searchParams.get("clientId")

    /* filter by client */

    if (clientId) {

      const events = await getEvents(
        Number(clientId)
      )

      return Response.json(events)

    }

    /* all events */

    const events = await getEvents()

    return Response.json(events)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )

  }
}