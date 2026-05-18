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
    <div>
      {items.map((item, index) => {
        const total = item.quantity * Number(item.unitPrice);
        const paid = item.paidAmount || 0;
        const remaining = item.remainingAmount ?? total - paid;

        const value = formItems[index]?.amount || "";

        return (
          <div key={item.id} style={styles.row}>
            {/* LEFT */}
            <div style={styles.left}>
              <strong>{item.service.name}</strong>

              <span style={styles.meta}>
                {item.quantity} × ${Number(item.unitPrice)} = ${total}
              </span>

              <span style={styles.paid}>Paid: ${paid}</span>
            </div>

            {/* RIGHT */}
            <div style={styles.right}>
              <span style={styles.remaining}>Remaining: ${remaining}</span>

              <input
                type="number"
                value={value}
                max={remaining}
                min={0}
                style={styles.input}
                onChange={(e) => {
                  let val = Number(e.target.value);

                  // 🔒 HARD LIMIT (clave)
                  if (val > remaining) val = remaining;
                  if (val < 0) val = 0;

                  setForm((prev: any) => {
                    const updated = [...prev.items];

                    updated[index] = {
                      ...updated[index],
                      amount: val,
                    };

                    return {
                      ...prev,
                      items: updated,
                    };
                  });
                }}
              />
            </div>
          </div>
        );
      })}

      <p style={styles.total}>
        Total Payment: ${formItems.reduce((sum, i) => sum + i.amount, 0)}
      </p>

      <div
        style={{ marginTop: 10, height: 1, background: "var(--border-color)" }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    marginBottom: 10,
    background: "var(--bg-primary)",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  meta: {
    fontSize: 13,
    color: "var(--text-secondary)",
  },

  paid: {
    fontSize: 13,
    color: "#16a34a",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  remaining: {
    fontSize: 13,
    color: "var(--text-secondary)",
  },

  input: {
    width: 80,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: 13,
  },

  total: {
    marginTop: 10,
    fontWeight: 600,
  },
};
