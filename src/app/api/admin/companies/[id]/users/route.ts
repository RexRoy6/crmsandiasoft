import { db } from "@/db"
import { users, companies } from "@/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { eq, isNull, and } from "drizzle-orm"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {


        const { email, password } = await req.json()
        /* ---------- unwrap params ---------- */
        const { id } = await params
        const companyId = Number(id)

        /* ---------- validate input ---------- */
        if (!email || !password || !companyId) {
            return Response.json(
                { error: "missing required fields" },
                { status: 400 }
            )
        }

        // const id = Number(companyId)

        if (Number.isNaN(id)) {
            return Response.json(
                { error: "invalid company id" },
                { status: 400 }
            )
        }

        /* ---------- check company exists & active ---------- */
        const company = await db.query.companies.findFirst({
            where: and(
                eq(companies.id, companyId),
                isNull(companies.deletedAt)
            )
        })

        if (!company) {
            return Response.json(
                { error: "company not found or inactive" },
                { status: 404 }
            )
        }

        /* ---------- create user ---------- */
        const passwordHash = await hashPassword(password)

        const result = await db.insert(users)
            .values({
                email,
                passwordHash,
                companyId: companyId,
                role: "owner"
            })
            .$returningId()

        return Response.json(result, { status: 201 })

    } catch (error) {
        console.error(error)

        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}