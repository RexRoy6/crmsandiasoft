import {
  getCompanyPayments
} from "@/lib/services/paymentService"

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    const result = await getCompanyPayments({
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