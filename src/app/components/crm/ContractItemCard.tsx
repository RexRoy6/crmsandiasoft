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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--bg-secondary)",
            padding: 16,
            borderRadius: 10,
          }}
        >
          {/* Header */}
          <div>
            <h3 style={{ margin: 0 }}>
              {service?.name}
            </h3>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              {service?.description}
            </p>
          </div>

          {/* Quantity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Quantity
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Subtotal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: 6,
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              Subtotal
            </span>
            <strong>
              ${Number(form.quantity || 0) * Number(item.unitPrice)}
            </strong>
          </div>

          {/* Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Notes
            </label>
            <textarea
              value={form.serviceNotes}
              onChange={(e) =>
                setForm({ ...form, serviceNotes: e.target.value })
              }
              rows={3}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                resize: "vertical",
              }}
            />
          </div>

          {/* Schedule */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Start
              </label>
              <input
                type="datetime-local"
                value={form.operationStart || ""}
                onChange={(e) =>
                  setForm({ ...form, operationStart: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                End
              </label>
              <input
                type="datetime-local"
                value={form.operationEnd || ""}
                onChange={(e) =>
                  setForm({ ...form, operationEnd: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Preview */}
          {form.operationStart && form.operationEnd && (
            <div
              style={{
                fontSize: 13,
                background: "var(--bg-primary)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              🕒{" "}
              {new Date(form.operationStart).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(form.operationEnd).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                onUpdate(item.id, {
                  quantity: Number(form.quantity),
                  serviceNotes: form.serviceNotes,
                  operationEnd: form.operationEnd,
                  operationStart: form.operationStart,
                });
                setEditing(false);
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}