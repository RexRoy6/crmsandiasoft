import { db } from "@/db"
import { users, companies } from "@/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { eq, isNull, and } from "drizzle-orm"
import { requireAuth } from "@/lib/auth/requireAuth"
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
         /* ---------- AUTH ---------- */
        await requireAuth({ roles: ["admin"] })
        /* ---------- unwrap params ---------- */
        const { id } = await params
        const companyId = Number(id)

        if (Number.isNaN(companyId)) {
            return Response.json(
                { error: "invalid company id" },
                { status: 400 }
            )
        }

        /* ---------- parse body ---------- */
        const body = await req.json().catch(() => null)

        if (!body) {
            return Response.json(
                { error: "invalid json body" },
                { status: 400 }
            )
        }

        const email = body.email?.trim().toLowerCase()
        const password = body.password

        /* ---------- validate input ---------- */
        if (!email || !password) {
            return Response.json(
                { error: "email and password required" },
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

        /* ---------- prevent duplicate email ---------- */
        const existing = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (existing) {
            return Response.json(
                { error: "email already exists" },
                { status: 409 }
            )
        }

        /* ---------- create user ---------- */
        const passwordHash = await hashPassword(password)

        const result = await db.insert(users)
            .values({
                email,
                passwordHash,
                companyId,
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

// funcion para sacar todos los users de una company

/* ---------- GET ONE (aunque esté desactivada) ---------- */


export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        /* ---------- AUTH ---------- */
        await requireAuth({ roles: ["admin"] })

        /* ---------- unwrap params ---------- */
        const { id } = await params
        const companyId = Number(id)

        if (Number.isNaN(companyId)) {
            return Response.json(
                { error: "invalid company id" },
                { status: 400 }
            )
        }

        /* ---------- check company exists ---------- */
        const company = await db.query.companies.findFirst({
            where: and(
                eq(companies.id, companyId),
                isNull(companies.deletedAt)
            )
        })

        if (!company) {
            return Response.json(
                { error: "company not found" },
                { status: 404 }
            )
        }

        /* ---------- query users ---------- */
        const data = await db
            .select({
                id: users.id,
                companyId: users.companyId,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(
                and(
                    eq(users.companyId, companyId),
                    isNull(users.deletedAt) // exclude soft deleted users
                )
            )

        return Response.json(data)

    } catch (error) {
        console.error(error)

        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}