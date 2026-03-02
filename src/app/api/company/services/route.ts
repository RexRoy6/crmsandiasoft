import { createService, getCompanyServices } from "@/lib/services/serviceService"
import { createServiceSchema } from "@/lib/validations/serviceValidation"

export async function GET() {
  try {
    const data = await getCompanyServices()
    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    /* ---------- validate ---------- */
    const parsed = createServiceSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    /* ---------- create ---------- */
    const result = await createService(parsed.data)

    return Response.json(result, { status: 201 })

  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}