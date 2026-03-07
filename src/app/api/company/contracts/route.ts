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

    if (error.message === "event not found") {
      return Response.json(
        { error: "event not found" },
        { status: 404 }
      )
    }

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}



/* ---------- GET (company contracts) ---------- */

export async function GET() {

  try {

    const contracts = await getCompanyContracts()

    return Response.json(contracts)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}