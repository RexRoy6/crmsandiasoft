import { getCompanyService } from "@/lib/services/serviceService"


export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // params is a Promise
) {
    try {

        // unwrap params
        const { id } = await params

        const serviceId = Number(id)

        /* ---------- validate id ---------- */
        if (Number.isNaN(serviceId)) {
            return Response.json(
                { error: "invalid service id" },
                { status: 400 }
            )
        }

        // query
        const data = await getCompanyService(serviceId)
        if (data == null) {

            return Response.json(
                { error: "service not found" },
                { status: 404 }
            )


        }
        return Response.json(data)


    } catch (error) {
        console.error(error)
        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}