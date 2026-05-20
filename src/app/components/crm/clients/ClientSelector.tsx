"use client";

import { useState } from "react";

import ClientSearch from "@/app/components/crm/ClientSearch";

import InlineClientForm from "@/app/components/crm/InlineClientForm";

import { createClient } from "@/services/clients/clientApi";

export default function ClientSelector({
  selected,
  onSelect,
  onClear,
}: {
  selected?: {
    id: number;
    name: string;
    phone: string;
  };

  onSelect: (client: any) => void;

  onClear?: () => void;
}) {
  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  async function handleCreateClient() {
    try {
      if (!form.name || !form.phone) {
        setError(
          "Name and phone are required"
        );

        return;
      }

      const newClient =
        await createClient(form);

      onSelect({
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone,
      });

      setShowForm(false);

      setForm({
        name: "",
        phone: "",
        email: "",
      });

      setError("");

    } catch (e: any) {

      setError(
        e.message ||
        "Failed to create client"
      );
    }
  }

  return (
    <div>
      {/* selected */}

      {selected && (
        <div
          style={{
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontWeight: 600,
            }}
          >
            ✅ {selected.name}
          </div>

          <div
            style={{
              fontSize: 12,
              color:
                "var(--text-secondary)",
            }}
          >
            {selected.phone}
          </div>
        </div>
      )}

      {/* search */}

      <ClientSearch
        selected={String(selected?.id || "")}
        onSelect={onSelect}
      />

      {/* clear */}

      {selected && (
        <button
          onClick={onClear}
          style={{
            marginTop: 6,
            fontSize: 12,
            color:
              "var(--error-color)",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          Change client
        </button>
      )}

      {/* create */}

      <div
        style={{
          marginTop: 10,
        }}
      >
        {!showForm && (
          <button
            onClick={() =>
              setShowForm(true)
            }
            style={{
              padding: "4px 8px",
              fontSize: 12,
              borderRadius: 6,
              border: "none",
              background:
                "transparent",
              color:
                "var(--primary-color)",
              cursor: "pointer",
            }}
          >
            + Create new client
          </button>
        )}

        {showForm && (
          <InlineClientForm
            form={form}
            setForm={setForm}
            onSubmit={
              handleCreateClient
            }
            onCancel={() =>
              setShowForm(false)
            }
          />
        )}

        {error && (
          <p
            style={{
              color:
                "var(--error-color)",
              fontSize: 12,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}