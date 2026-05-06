"use client";

import ListCard from "@/app/components/crm/ListCard";
import { formatDate } from "@/lib/utils/date";

export default function PaymentList({
  payments,
  onDeleteSuccess,
}: {
  payments: any[];
  onDeleteSuccess?: () => void;
}) {

  async function handleDelete(id: number) {
    if (!confirm("Delete this payment?")) return;

    try {
      const res = await fetch(`/api/company/payments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Failed to delete payment");
        return;
      }

      onDeleteSuccess?.();
    } catch {
      alert("Connection error");
    }
  }

  if (payments.length === 0) {
    return (
      <p style={{ color: "var(--text-secondary)" }}>
        No payments yet.
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
      {payments.map((payment) => (
        <ListCard
          key={payment.id}
          title={`Payment #${payment.id}`}
          link="#"
          content={
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              
              {/* 🔥 ticket */}
              {payment.ticketNumber && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    padding: "4px 8px",
                    borderRadius: 6,
                    width: "fit-content",
                  }}
                >
                  🧾 Ticket: {payment.ticketNumber}
                </div>
              )}

              {/* items */}
              {payment.items.map((item: any) => (
                <div
                  key={`p${payment.id}-c${payment.contractId}-i${item.contractItemId}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--bg-secondary)",
                    padding: "8px 10px",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {item.service.name}
                      {item.service.description && (
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {" "}
                          - {item.service.description}
                        </span>
                      )}
                    </span>
                  </div>

                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    ${item.amount}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          {/* meta info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
              fontSize: 13,
            }}
          >
            <span>
              <strong>Currency:</strong> {payment.currency}
            </span>

            <span>
              <strong>Amount:</strong> ${payment.amount}
            </span>

            <span>
              <strong>Method:</strong> {payment.paymentMethod}
            </span>

            {/* 🔥 fecha REAL */}
            <span>
              <strong>Payment Date:</strong>{" "}
              {payment.paidAt
                ? formatDate(payment.paidAt)
                : "—"}
            </span>

            {/* 🔥 fecha sistema */}
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
              Recorded: {formatDate(payment.createdAt)}
            </span>
          </div>

          {/* delete */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: 12,
            }}
          >
            <button
              onClick={() => handleDelete(payment.id)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--error-color)",
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--error-color)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--error-bg)";
                e.currentTarget.style.color = "var(--error-color)";
              }}
            >
              🗑 Delete
            </button>
          </div>
        </ListCard>
      ))}
    </div>
  );
}