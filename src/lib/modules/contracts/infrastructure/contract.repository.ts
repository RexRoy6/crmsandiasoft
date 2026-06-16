import { db } from "@/lib/db";
import { contracts } from "@/db/schema";
import { eq, and, like } from "drizzle-orm";

export const contractRepository = {
  async create(data: any) {
    const [result] = await db.insert(contracts).values(data);

    return result;
  },

  async existsByEvent(eventId: number) {
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.eventId, eventId))
      .limit(1);

    return result.length > 0;
  },

  async getAll(filters: any) {
    const { search, page, limit, eventId, status, companyId } = filters;

    const conditions = [
      eq(contracts.companyId, companyId),
      eventId ? eq(contracts.eventId, eventId) : undefined,
      status ? eq(contracts.status, status) : undefined,
      search ? like(contracts.name, `%${search}%`) : undefined,
    ].filter(Boolean);

    return db
      .select()
      .from(contracts)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit);
  },
};
