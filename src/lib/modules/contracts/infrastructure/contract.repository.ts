import { db } from "@/lib/db";
import { contracts } from "@/db/schema";
import { and, eq, like, count } from "drizzle-orm";

type GetAllFilters = {
  search?: string;
  page: number;
  limit: number;
  eventId?: number;
  status?: string;
  companyId: number;
};

export const contractRepository = {
  async getAll(filters: any) {
    const { search, page, limit, eventId, status, companyId } = filters;

    const conditions = [];

    // 🔒 multi-tenant obligatorio
    conditions.push(eq(contracts.companyId, companyId));

    if (eventId) conditions.push(eq(contracts.eventId, eventId));
    if (status) conditions.push(eq(contracts.status, status));
    if (search) conditions.push(like(contracts.name, `%${search}%`));

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(contracts)
        .where(whereClause)
        .limit(limit)
        .offset((page - 1) * limit),

      db.select({ count: count() }).from(contracts).where(whereClause),
    ]);

    return {
      data,
      total: totalResult[0]?.count ?? 0,
      page,
      limit,
    };
  },

  async getById(id: number, companyId: number) {
    const result = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.companyId, companyId)))
      .limit(1);

    return result[0] ?? null;
  },

  async create(data: typeof contracts.$inferInsert) {
    const result = await db.insert(contracts).values(data).returning();

    return result[0];
  },

  async update(
    id: number,
    companyId: number,
    data: Partial<typeof contracts.$inferInsert>,
  ) {
    const result = await db
      .update(contracts)
      .set(data)
      .where(and(eq(contracts.id, id), eq(contracts.companyId, companyId)))
      .returning();

    return result[0] ?? null;
  },

  async remove(id: number, companyId: number) {
    const result = await db
      .delete(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.companyId, companyId)))
      .returning();

    return result[0] ?? null;
  },
};
