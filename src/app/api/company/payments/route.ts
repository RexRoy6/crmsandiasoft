import {
  getCompanyPayments
} from "@/lib/services/paymentService"

export async function GET() {

  try {

    const payments = await getCompanyPayments()

    return Response.json(payments)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}