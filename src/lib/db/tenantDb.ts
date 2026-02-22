import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { getAuthContext } from "@/lib/auth/getAuthContext"

/*
  Wrapper multi-tenant seguro.
  Fuerza companyId en todas las queries.
*/

export async function tenantDb() {
  const { companyId } = await getAuthContext()

  return {
    /* ---------- SELECT ---------- */
    findMany(table: any, extraWhere?: any) {
      return db.select().from(table).where(
        extraWhere
          ? and(eq(table.companyId, companyId), extraWhere)
          : eq(table.companyId, companyId)
      )
    },

    /* ---------- FIND ONE ---------- */
    findFirst(table: any, extraWhere?: any) {
      return db.select().from(table).where(
        extraWhere
          ? and(eq(table.companyId, companyId), extraWhere)
          : eq(table.companyId, companyId)
      ).limit(1)
    },

    /* ---------- INSERT ---------- */
    insert(table: any, values: any) {
      return db.insert(table).values({
        ...values,
        companyId
      })
    },

    /* ---------- UPDATE ---------- */
    update(table: any, values: any, extraWhere?: any) {
      return db.update(table)
        .set(values)
        .where(
          extraWhere
            ? and(eq(table.companyId, companyId), extraWhere)
            : eq(table.companyId, companyId)
        )
    },

    /* ---------- DELETE ---------- */
    delete(table: any, extraWhere?: any) {
      return db.delete(table).where(
        extraWhere
          ? and(eq(table.companyId, companyId), extraWhere)
          : eq(table.companyId, companyId)
      )
    }
  }
}