"use client";

import { useState } from "react";
import ListCard from "./ListCard";

type Props = {
  item: any;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => void;
};

export default function ContractItemCard({
  item,
  onUpdate,
  onDelete,
}: Props) {

  const [editing, setEditing] = useState(false);

  const toLocal = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 16);
  };


  const [form, setForm] = useState({
    serviceId: String(item.service?.id),
    quantity: String(item.quantity),
    serviceNotes: item.serviceNotes || "",
    operationStart: toLocal(item.operationStart),
    operationEnd: toLocal(item.operationEnd),
  });

  const service = item.service;

  const subtotal =
    Number(item.quantity) *
    Number(item.unitPrice);

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        padding: 12,
        borderRadius: 10,
        background: "var(--bg-primary)",
      }}
    >

      {!editing ? (
        <>
          <ListCard
            title={service?.name || "Service"}
            extra={[
              service?.description || "",
              `Quantity: ${item.quantity}`,
              `Unit Price: $${item.unitPrice}`,
              `Subtotal: $${subtotal}`,
              item.serviceNotes
                ? `Notes:\n${item.serviceNotes}`
                : "",

              item.operationStart && item.operationEnd
                //? `Schedule: ${new Date(item.operationStart).toLocaleTimeString()} - ${new Date(item.operationEnd).toLocaleTimeString()}`
                ? `🕒 ${new Date(item.operationStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.operationEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : ""
            ]}
            link="#"
          />

          <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
            <button onClick={() => setEditing(true)}>
              Edit
            </button>

            <button onClick={() => onDelete(item.id)}>
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontWeight: "bold" }}>
            Edit Service
          </p>

          <input
            type="number"
            placeholder="Service ID"
            value={form.serviceId}
            onChange={(e) =>
              setForm({ ...form, serviceId: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <textarea
            placeholder="Notes"
            value={form.serviceNotes}
            onChange={(e) =>
              setForm({ ...form, serviceNotes: e.target.value })
            }
            rows={3}
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              resize: "vertical",
            }}
          />

          <input
            type="datetime-local"
            value={form.operationStart || ""}
            onChange={(e) =>
              setForm({ ...form, operationStart: e.target.value })
            }
          />

          <input
            type="datetime-local"
            value={form.operationEnd || ""}
            onChange={(e) =>
              setForm({ ...form, operationEnd: e.target.value })
            }
          />

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                onUpdate(item.id, {
                  serviceId: Number(form.serviceId),
                  quantity: Number(form.quantity),
                  serviceNotes: form.serviceNotes,
                  operationEnd: form.operationEnd,
                  operationStart: form.operationStart
                });
                setEditing(false);
              }}
            >
              Save
            </button>

            <button onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </>
      )}

    </div>
  );
}