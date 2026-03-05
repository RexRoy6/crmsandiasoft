import { getClients, createClient } from "@/lib/services/clientService"
import { createClientSchema } from "@/lib/validations/clientValidation"

export async function GET() {
  const data = await getClients()
  return Response.json(data)
}
export async function POST(req: Request) {

  const body = await req.json()

  const parsed = createClientSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const result = await createClient(parsed.data)

  return Response.json(result, { status: 201 })
}