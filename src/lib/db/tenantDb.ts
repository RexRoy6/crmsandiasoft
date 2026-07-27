import { and, eq, isNull, count, sum } from "drizzle-orm"
import { db } from "@/db"
import { requireAuth } from "@/lib/auth/requireAuth"

export async function tenantDb() {
  const { companyId, role } = await requireAuth()

  const isGlobalAdmin = role === "admin" && companyId === null

  function buildWhere(table: any, extraWhere?: any) {

    /* admin global → sin filtro tenant */
    if (isGlobalAdmin) {
      return extraWhere ?? undefined
    }

    if (!companyId) {
      throw new Error("Tenant required")
    }

    /* tabla sin companyId → no aplicar filtro tenant */
    if (!("companyId" in table)) {
      return extraWhere ?? undefined
    }

    /* tabla con companyId */
    return extraWhere
      ? and(eq(table.companyId, companyId), extraWhere)
      : eq(table.companyId, companyId)
  }

  return {
    // count chido\

    //    count(table: any, extraWhere?: any) {
    //   const baseWhere = isNull(table.deletedAt)

    //   return db
    //     .select({
    //       count: count()
    //     })
    //     .from(table)
    //     .where(
    //       buildWhere(
    //         table,
    //         extraWhere
    //           ? and(baseWhere, extraWhere)
    //           : baseWhere
    //       )
    //     )
    // },

    async count(table: any, extraWhere?: any) {

      const baseWhere = isNull(table.deletedAt)

      const [result] = await db
        .select({
          count: count()
        })
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )

      return Number(result.count ?? 0)
    },
    ////sum viejito
    // sum(table: any, column: any, extraWhere?: any) {

    //   const baseWhere = isNull(table.deletedAt)

    //   return db
    //     .select({
    //       total: sum(column)
    //     })
    //     .from(table)
    //     .where(
    //       buildWhere(
    //         table,
    //         extraWhere
    //           ? and(baseWhere, extraWhere)
    //           : baseWhere
    //       )
    //     )
    // },

    async sum(table: any, column: any, extraWhere?: any) {

  const baseWhere = isNull(table.deletedAt)

  const [result] = await db
    .select({
      total: sum(column)
    })
    .from(table)
    .where(
      buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere
      )
    )

  return Number(result.total ?? 0)
},

    exists(table: any, extraWhere?: any) {

      const baseWhere = isNull(table.deletedAt)

      return db
        .select({
          exists: count()
        })
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )
        .limit(1)
    },

    /* ---------- SELECT ---------- */
    findMany(table: any, extraWhere?: any) {
      const baseWhere = isNull(table.deletedAt)

      return db
        .select()
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )
    },
    /* ---------- SELECT (including soft deleted) ---------- */
    findManyRaw(table: any, extraWhere?: any) {
      return db
        .select()
        .from(table)
        .where(
          extraWhere
            ? buildWhere(table, extraWhere)
            : undefined
        )
    },

    /* ---------- FIND ONE ---------- */
    findFirst(table: any, extraWhere?: any) {
      const baseWhere = isNull(table.deletedAt)

      return db
        .select()
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )
        .limit(1)
        .then((rows) => rows[0] ?? null)
    },
    /* ---------- FIND ONE (including soft deleted) ---------- */
    findFirstRaw(table: any, extraWhere?: any) {
      return db
        .select()
        .from(table)
        .where(
          extraWhere
            ? buildWhere(table, extraWhere)
            : undefined
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

      const baseWhere = isNull(table.deletedAt)

      return db
        .update(table)
        .set(values)
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )
    },

    /* ---------- DELETE ---------- */
    delete(table: any, extraWhere?: any) {

      if (!table.deletedAt) {
        throw new Error("Soft delete not supported on this table")
      }

      const baseWhere = isNull(table.deletedAt)

      return db
        .update(table)
        .set({
          deletedAt: new Date()
        })
        .where(
          buildWhere(
            table,
            extraWhere
              ? and(baseWhere, extraWhere)
              : baseWhere
          )
        )
    },
    /* ---------- delete admin ---------- */

    /* ---------- FORCE DELETE ---------- */
    forceDelete(table: any, extraWhere?: any) {

      if (!isGlobalAdmin) {
        throw new Error("Force delete requires global admin")
      }

      return db
        .delete(table)
        .where(extraWhere)
    },

  }
}