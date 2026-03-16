import { Company, Contract, User } from "../types/admin";

export async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/admin/me", {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  return res.json();
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/admin/companies", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error("Error al cargar empresas");
  }

  return data;
}

export async function createCompany(name: string) {
  const res = await fetch("/api/admin/companies", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Error al crear empresa");
  }

  return res.json();
}

export async function fetchContracts(): Promise<Contract[]> {
  const res = await fetch("/api/company/contracts", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error("Error al cargar eventos");
  }

  return data;
}
