"use client";

import { useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ClientSearch from "@/app/components/crm/ClientSearch";

export default function NewContractPage() {
  const [step, setStep] = useState<"event" | "services">("event");

  const [contractId, setContractId] = useState<number | null>(null);

  const [form, setForm] = useState({
    clientId: "",
    client: undefined as any,
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    notes: "",
  });

  /* ---------- CREATE EVENT + CONTRACT ---------- */

  const createAll = async () => {
    try {
      // 1. crear evento
      const dateTime = new Date(`${form.eventDate}T${form.eventTime}`);

      const payload = {
        clientId: Number(form.clientId),
        name: form.name,
        eventDate: dateTime,
        location: form.location,
        notes: form.notes,
      };

      const eventRes = await fetch("/api/company/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!eventRes.ok) {
        alert("Error creating event");
        return;
      }

      const event = await eventRes.json();

      // 2. crear contrato draft
      const contractRes = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          status: "draft",
          totalAmount: 0,
        }),
      });

      if (!contractRes.ok) {
        const data = await contractRes.json();

        // 👇 manejas tu ConflictError aquí
        if (contractRes.status === 409) {
          alert("Contract already exists for this event");
          return;
        }

        alert("Error creating contract");
        return;
      }

      const contract = await contractRes.json();

      setContractId(contract.id);
      setStep("services");

    } catch (e) {
      console.error(e);
      alert("Connection error");
    }
  };

  /* ---------- FORM FIELDS ---------- */

  const fields: Field[] = [
    {
      name: "clientId",
      label: "Client",
      readOnly: true,
      after: (
        <>
          {form.client && (
            <div>
              <strong>{form.client.name}</strong>
            </div>
          )}

          <ClientSearch
            selected={form.clientId}
            onSelect={(client) => {
              setForm((prev) => ({
                ...prev,
                clientId: String(client.id),
                client,
              }));
            }}
          />
        </>
      ),
    },
    { name: "name", label: "Event name" },
    { name: "eventDate", label: "Date", type: "date" },
    { name: "eventTime", label: "Time", type: "time" },
    { name: "location", label: "Location" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  /* ---------- UI ---------- */

  return (
    <div style={{ padding: 20 }}>

      <h2 style={{ marginBottom: 20 }}>
        New Contract Flow
      </h2>

      {/* STEP 1 */}
      {step === "event" && (
        <CreateForm
          title="1. Create Event"
          fields={fields}
          form={form}
          setForm={setForm}
          onSubmit={createAll}
          onCancel={() => {}}
        />
      )}

      {/* STEP 2 */}
      {step === "services" && contractId && (
        <div
          style={{
            padding: 20,
            border: "1px solid var(--border-color)",
            borderRadius: 10,
          }}
        >
          <h3>2. Add Services</h3>

          <p>Contract ID: {contractId}</p>

          {/* 👉 aquí después conectamos tu endpoint */}
          <p style={{ fontSize: 13 }}>
            Aquí irá el listado + agregar servicios
          </p>

          <hr style={{ margin: "20px 0" }} />

          <h3>3. Payments</h3>

          <p style={{ fontSize: 13 }}>
            Aquí irá el listado + agregar pagos
          </p>
        </div>
      )}
    </div>
  );
}