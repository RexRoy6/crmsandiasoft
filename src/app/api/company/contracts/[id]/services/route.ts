import {
  addServiceToContract,
  getContractServices
} from "@/lib/services/contractItemService"

import {
  createContractItemSchema
} from "@/lib/validations/contractItemValidation"

import { requireAuth } from "@/lib/auth/requireAuth"

/* ---------- POST ---------- */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {

    const { id } = await params
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "invalid contract id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const parsed =
      createContractItemSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const created = await addServiceToContract(
      contractId,
      parsed.data
    )

    return Response.json(created, { status: 201 })

  } catch (error: any) {

    //console.error(error)

    if (error.message === "contract not found") {
      return Response.json(
        { error: "contract not found" },
        { status: 404 }
      )
    }

    if (error.message === "service not found") {
      return Response.json(
        { error: "service not found" },
        { status: 404 }
      )
    }

    if (error.code === "STOCK_EXCEEDED") {
      return Response.json(
        {
          error: "You exceeded available stock",
          available: error.available
        },
        { status: 400 }
      )
    }

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )

  }
}



/* ---------- GET ---------- */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {

    const { id } = await params
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "invalid contract id" },
        { status: 400 }
      )
    }

    const items =
      await getContractServices(contractId)

    return Response.json(items)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}