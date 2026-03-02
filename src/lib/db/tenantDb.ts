import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/db"
import { getAuthContext } from "@/lib/auth/getAuthContext"

export async function tenantDb() {
  const { companyId, role } = await getAuthContext()

  const isGlobalAdmin = role === "admin" && companyId === null

  function buildWhere(table: any, extraWhere?: any) {
    // admin global → no filtro tenant
    if (isGlobalAdmin) {
      return extraWhere ?? undefined
    }

    //  no permitir sin companyId
    if (!companyId) {
      throw new Error("Tenant required")
    }

    return extraWhere
      ? and(eq(table.companyId, companyId), extraWhere)
      : eq(table.companyId, companyId)
  }

  return {
    /* ---------- SELECT ---------- */
    findMany(table: any, extraWhere?: any) {
      const baseWhere = isNull(table.deletedAt)

      return db
        .select()
        .from(table)
        .where(
          extraWhere
            ? and(baseWhere, buildWhere(table, extraWhere))
            : baseWhere
        )
    },

    /* ---------- FIND ONE ---------- */
    findFirst(table: any, extraWhere?: any) {
      const baseWhere = isNull(table.deletedAt)

      return db
        .select()
        .from(table)
        .where(
          extraWhere
            ? and(baseWhere, buildWhere(table, extraWhere))
            : baseWhere
        )
        .limit(1)
        .then((rows) => rows[0] ?? null)
    },

    /* ---------- INSERT ---------- */
    insert(table: any, values: any) {
      if (isGlobalAdmin) {
        return db.insert(table).values(values)
      }

      if (!companyId) throw new Error("Tenant required")

      return db.insert(table).values({
        ...values,
        companyId
      })
    },

    /* ---------- UPDATE ---------- */
    update(table: any, values: any, extraWhere?: any) {
      return db.update(table)
        .set(values)
        .where(buildWhere(table, extraWhere))
    },

    /* ---------- DELETE ---------- */
    delete(table: any, extraWhere?: any) {
      return db.delete(table)
        .where(buildWhere(table, extraWhere))
    }
  }
}