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
              padding: 10,
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <strong>{item.service.name}</strong>

            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {item.service.description}
            </p>

            <p>
              Qty: {item.quantity} × ${Number(item.unitPrice)} ={" "}
              <strong>${total}</strong>
            </p>

            <p style={{ fontSize: 12, color: "#16a34a" }}>
              Paid: ${paid}
            </p>

            <p style={{ fontSize: 12, color: "#dc2626" }}>
              Remaining: ${remaining}
            </p>


            <input
              type="number"
              placeholder="Amount"
              value={formItems[index]?.amount || ""}
              //max={total}
              max={remaining}
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