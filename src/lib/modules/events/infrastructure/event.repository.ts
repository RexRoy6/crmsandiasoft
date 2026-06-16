import { db } from "@/lib/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export const eventRepository = {
  async findById(id: number) {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    return result[0] ?? null;
  },
};
