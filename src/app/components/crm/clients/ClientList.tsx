"use client";

import ListCard from "@/app/components/crm/ListCard";

import type { Client } from "@/types/client";

import { useRouter } from "next/navigation";

export default function ClientList({
  clients,
  onDelete,
}: {
  clients: Client[];

  onDelete?: (id: number) => void;
}) {
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <p style={{ color: "var(--text-secondary)" }}>
        No clients found.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {clients.map((client) => (
        <ListCard
          key={client.id}
          title={client.name}
          content={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 6,
              }}
            >
              <div>
                <strong>Email:</strong>{" "}
                {client.email || "—"}
              </div>

              <div>
                <strong>Phone:</strong>{" "}
                {client.phone}
              </div>
            </div>
          }
          actions={[
            {
              label: "Manage →",
              onClick: () =>
                router.push(`/company/clients/${client.id}`),
            },
          ]}
        >
          {onDelete && (
            <button
              onClick={() => onDelete(client.id)}
            >
              Delete
            </button>
          )}
        </ListCard>
      ))}
    </div>
  );
}