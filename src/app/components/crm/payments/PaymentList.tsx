"use client";

import ListCard from "@/app/components/crm/ListCard";

export default function PaymentList({
  payments,
}: {
  payments: any[];
}) {
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
            <div style={{ display: "flex", flexDirection: "column" }}>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
              fontSize: 13,
              color: "var(--text-primary)",
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
            <span>
              <strong>Date:</strong>{" "}
              {new Date(payment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </ListCard>
      ))}
    </div>
  );
}