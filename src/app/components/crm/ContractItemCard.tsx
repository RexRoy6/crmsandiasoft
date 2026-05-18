"use client";

import { useEffect, useState } from "react";

import ListCard from "./ListCard";

import {
  formatTime,
  toLocalInput,
} from "@/lib/utils/date";

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

  const [form, setForm] = useState({
    serviceId: "",
    quantity: "",
    serviceNotes: "",
    operationStart: "",
    operationEnd: "",
  });

  useEffect(() => {
    setForm({
      serviceId: String(item.service?.id || ""),
      quantity: String(item.quantity || ""),
      serviceNotes: item.serviceNotes || "",
      operationStart: toLocalInput(item.operationStart),
      operationEnd: toLocalInput(item.operationEnd),
    });
  }, [item]);

  const service = item.service;

  const subtotalView =
    Number(item.quantity || 0) *
    Number(item.unitPrice || 0);

  const subtotalEdit =
    Number(form.quantity || 0) *
    Number(item.unitPrice || 0);

  return (
    <>
      {!editing ? (
        <ListCard
          title={service?.name || "Service"}
          subtitle={service?.description}
          content={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 6,
              }}
            >
              {/* Quantity */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  Quantity
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {item.quantity}
                </span>
              </div>

              {/* Unit Price */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  Unit Price
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  ${item.unitPrice}
                </span>
              </div>

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  Subtotal
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ${subtotalView}
                </span>
              </div>

              {/* Schedule */}
              {item.operationStart &&
                item.operationEnd && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      Schedule
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                      }}
                    >
                      {formatTime(
                        item.operationStart
                      )}{" "}
                      -{" "}
                      {formatTime(
                        item.operationEnd
                      )}
                    </span>
                  </div>
                )}

              {/* Notes */}
              {item.serviceNotes && (
                <div
                  style={{
                    marginTop: 4,
                    padding: "8px 10px",
                    background:
                      "var(--bg-primary)",
                    borderRadius: 8,
                    border:
                      "1px solid var(--border-color)",
                    fontSize: 12,
                  }}
                >
                  {item.serviceNotes}
                </div>
              )}
            </div>
          }
          actions={[
            {
              label: "Edit",
              onClick: () =>
                setEditing(true),
            },
            {
              label: "Remove",
              onClick: () =>
                onDelete(item.id),
            },
          ]}
        />
      ) : (
        <div
          style={{
            border:
              "1px solid var(--border-color)",
            padding: 12,
            borderRadius: 10,
            background:
              "var(--bg-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background:
                "var(--bg-secondary)",
              padding: 16,
              borderRadius: 10,
              animation:
                "fadeIn 0.2s ease",
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
                  color:
                    "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                {service?.description}
              </p>
            </div>

            {/* Quantity */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color:
                    "var(--text-secondary)",
                }}
              >
                Quantity
              </label>

              <input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity:
                      e.target.value,
                  })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border:
                    "1px solid var(--border-color)",
                  background:
                    "var(--bg-primary)",
                  color:
                    "var(--text-primary)",
                }}
              />
            </div>

            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: 14,
                borderBottom:
                  "1px solid var(--border-color)",
                paddingBottom: 6,
              }}
            >
              <span
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                💰 Subtotal
              </span>

              <strong>
                ${subtotalEdit}
              </strong>
            </div>

            {/* Notes */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color:
                    "var(--text-secondary)",
                }}
              >
                📝 Notes
              </label>

              <textarea
                value={form.serviceNotes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serviceNotes:
                      e.target.value,
                  })
                }
                rows={3}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border:
                    "1px solid var(--border-color)",
                  background:
                    "var(--bg-primary)",
                  color:
                    "var(--text-primary)",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Schedule */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Start */}
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  🕒 Start
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.operationStart ||
                    ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      operationStart:
                        e.target.value,
                    })
                  }
                  style={{
                    padding:
                      "10px 12px",
                    borderRadius: 8,
                    border:
                      "1px solid var(--border-color)",
                    background:
                      "var(--bg-primary)",
                    color:
                      "var(--text-primary)",
                  }}
                />
              </div>

              {/* End */}
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  🕒 End
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.operationEnd ||
                    ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      operationEnd:
                        e.target.value,
                    })
                  }
                  style={{
                    padding:
                      "10px 12px",
                    borderRadius: 8,
                    border:
                      "1px solid var(--border-color)",
                    background:
                      "var(--bg-primary)",
                    color:
                      "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Preview */}
            {form.operationStart &&
              form.operationEnd && (
                <div
                  style={{
                    fontSize: 13,
                    background:
                      "var(--bg-primary)",
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  🕒{" "}
                  {formatTime(
                    form.operationStart
                  )}{" "}
                  -{" "}
                  {formatTime(
                    form.operationEnd
                  )}
                </div>
              )}

            {/* Actions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                onClick={() => {
                  onUpdate(item.id, {
                    quantity: Number(
                      form.quantity
                    ),
                    serviceNotes:
                      form.serviceNotes,
                    operationEnd:
                      form.operationEnd,
                    operationStart:
                      form.operationStart,
                  });

                  setEditing(false);
                }}
                style={{
                  padding:
                    "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.opacity =
                    "0.85")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.opacity =
                    "1")
                }
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditing(false)
                }
                style={{
                  padding:
                    "10px 16px",
                  borderRadius: 8,
                  border:
                    "1px solid var(--border-color)",
                  color: "white",
                  cursor: "pointer",
                  transition: "0.2s",
                  backgroundColor:
                    "#e33131",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.opacity =
                    "0.85")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.opacity =
                    "1")
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}