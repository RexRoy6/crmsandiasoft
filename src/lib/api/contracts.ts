import type { ContractStatus } from "@/db/schema";

export interface CreateContractPayload {
  eventId: number;

  status: ContractStatus;

  totalAmount: number;
}

export interface ContractResponse {
  id: number;

  status: ContractStatus;
}

/* ---------- CREATE CONTRACT ---------- */

export async function createContract(
  payload: CreateContractPayload
): Promise<ContractResponse> {

  const res = await fetch(
    "/api/company/contracts",
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to create contract"
    );
  }

  return res.json();
}