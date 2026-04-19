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

  const toLocalInput = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);

    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
  };


  const [form, setForm] = useState({
    serviceId: String(item.service?.id),
    quantity: String(item.quantity),
    serviceNotes: item.serviceNotes || "",

    operationStart: toLocalInput(item.operationStart),
    operationEnd: toLocalInput(item.operationEnd),
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Header */}
          <div>
            <h4 style={{ margin: 0 }}>
              {service?.name}
            </h4>
            <p style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: 13
            }}>
              {service?.description}
            </p>
          </div>

          {/* Row */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </div>


          </div>

          {/* Subtotal dinámico */}
          <p style={{ fontSize: 13 }}>
            Subtotal: $
            {Number(form.quantity || 0) * Number(item.unitPrice)}
          </p>

          {/* Notes */}
          <div>
            <label>Notes</label>
            <textarea
              value={form.serviceNotes}
              onChange={(e) =>
                setForm({ ...form, serviceNotes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Schedule */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label>Start</label>
              <input
                type="datetime-local"
                value={form.operationStart || ""}
                onChange={(e) =>
                  setForm({ ...form, operationStart: e.target.value })
                }
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>End</label>
              <input
                type="datetime-local"
                value={form.operationEnd || ""}
                onChange={(e) =>
                  setForm({ ...form, operationEnd: e.target.value })
                }
              />
            </div>
          </div>

          {/* Preview horario */}
          {form.operationStart && form.operationEnd && (
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)"
            }}>
              🕒 {new Date(form.operationStart).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} - {new Date(form.operationEnd).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                onUpdate(item.id, {
                  //  serviceId: Number(form.serviceId),
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

        </div>
      )}

    </div>
  );
}