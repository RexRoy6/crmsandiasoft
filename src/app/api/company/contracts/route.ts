import { contractService } from "@/lib/modules/contracts/contract.service";
import { createContractSchema } from "@/lib/validations/contractValidation";
import { requireAuth } from "@/lib/auth/requireAuth";
import {
  ContractConflictError,
  EventNotFoundError,
} from "@/lib/modules/contracts/domain/contract.errors";

/* ---------- POST (create contract) ---------- */
export async function POST(req: Request) {
  const auth = await requireAuth();

  try {
    const body = await req.json();

    const parsed = createContractSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await contractService.create({
      ...parsed.data,
      companyId: auth.companyId, // 🔥 multi-tenant obligatorio
    });

    return Response.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof EventNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ContractConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    console.error(error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ---------- GET (company contracts) ---------- */

export async function GET(req: Request) {
  const auth = await requireAuth();

  try {
    const { searchParams } = new URL(req.url);

    const result = await contractService.getAll({
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
      eventId: searchParams.get("eventId")
        ? Number(searchParams.get("eventId"))
        : undefined,
      status: searchParams.get("status") ?? undefined,
      companyId: auth.companyId, // 🔥 filtro obligatorio
    });

    return Response.json(result);
  } catch (error) {
    console.error(error);

    return Response.json({ error: "internal server error" }, { status: 500 });
  }
}
