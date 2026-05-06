"use client";

type Item = {
  id: number;
  quantity: number;
  unitPrice: number | string;
  paidAmount?: number;
  remainingAmount?: number;
  service: {
    name: string;
    description?: string;
  };
};

type Props = {
  items: Item[];
  formItems: {
    contractItemId: number;
    amount: number;
  }[];
  setForm: (fn: (prev: any) => any) => void;
};

export default function PaymentAllocationCard({
  items,
  formItems,
  setForm,
}: Props) {
  return (
    <div style={{ marginTop: 20 }}>

      <h3>Allocate Payment</h3>

      {items.map((item, index) => {

        const total =
          item.quantity * Number(item.unitPrice);

        const paid = item.paidAmount || 0;
        const remaining = item.remainingAmount ?? (total - paid);

        return (
          <div
            key={item.id}
            style={{
              padding: 16,
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              marginBottom: 12,
              background: "var(--bg-primary)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 15 }}>
                  {item.service.name}
                </strong>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  {item.service.description}
                </p>
              </div>

              {/* TOTAL BADGE */}
              <div
                style={{
                  background: "var(--bg-secondary)",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ${total}
              </div>
            </div>

            {/* DETAILS */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span>
                Qty: {item.quantity} × ${Number(item.unitPrice)}
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div
              style={{
                height: 6,
                borderRadius: 6,
                background: "var(--bg-secondary)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(paid / total) * 100}%`,
                  background: "#22c55e",
                  height: "100%",
                }}
              />
            </div>

            {/* PAID / REMAINING */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#16a34a" }}>
                Paid: ${paid}
              </span>

              <span style={{ color: "#dc2626" }}>
                Remaining: ${remaining}
              </span>
            </div>

            {/* INPUT */}
            <input
              type="number"
              placeholder="Enter amount"
              value={formItems[index]?.amount || ""}
              max={remaining}
              style={{
                marginTop: 6,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
              }}
              onChange={(e) => {
                const value = Number(e.target.value);

                setForm((prev: any) => {
                  const updated = [...prev.items];

                  updated[index] = {
                    ...updated[index],
                    amount: value,
                  };

                  return {
                    ...prev,
                    items: updated,
                  };
                });
              }}
            />
          </div>
        );
      })}

      <p style={{ marginTop: 10 }}>
        Total Payment: $
        {formItems.reduce((sum, i) => sum + i.amount, 0)}
      </p>

    </div>
  );
}