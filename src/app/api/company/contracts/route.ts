import {
  createContract,
  getCompanyContracts
} from "@/lib/services/contractService"

import {
  createContractSchema
} from "@/lib/validations/contractValidation"



/* ---------- POST (create contract) ---------- */

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const parsed = createContractSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const created = await createContract(parsed.data)

    return Response.json(created, { status: 201 })

  } catch (error: any) {

    console.error(error)

    if (error.message === "Event not found") {
      return Response.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }
    

    if (error.message === "Contract already exists for this event") {
      return Response.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }

}



/* ---------- GET (company contracts) ---------- */

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") ?? undefined
    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 10)

    const result = await getCompanyContracts({
      search,
      page,
      limit
    })

    return Response.json(result)

  } catch (error) {

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}