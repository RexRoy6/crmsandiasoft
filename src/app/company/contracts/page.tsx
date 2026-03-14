"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";

export default function ContractsPage() {

    const [contracts, setContracts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
const [events, setEvents] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();


    /* create contract */
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        clientId: "",
        eventId: "",
        status: "draft",
        totalAmount: "",
    });

   const contractFields: Field[] = [

  {
    name: "clientId",
    label: "Client",
    type: "select",
    options: clients.map((client) => ({
      value: client.id,
      label: client.name,
    })),
  },

  {
    name: "eventId",
    label: "Event",
    type: "select",
    options: events.map((event) => ({
      value: event.id,
      label: `${event.name} (${event.client?.name})`,
    })),
  },

  { name: "status", label: "Status" },

  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
  },
];
    const fetchContracts = async () => {
        try {

            setLoading(true);

            const res = await fetch("/api/company/contracts", {
                credentials: "include",
            });

            if (!res.ok) {
                setError("Failed to fetch contracts");
                setErrorCode(res.status);
                return;
            }

            const data = await res.json();

            setContracts(data);

        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {

  try {

    const res = await fetch(
      "/api/company/clients",
      { credentials: "include" }
    );

    if (!res.ok) return;

    const data = await res.json();

    const activeClients = data.filter(
      (c: any) => !c.deletedAt
    );

    setClients(activeClients);

  } catch {}

};

const fetchEvents = async () => {

  try {

    const res = await fetch(
      "/api/company/events",
      { credentials: "include" }
    );

    if (!res.ok) return;

    const data = await res.json();

    const activeEvents = data.filter(
      (e: any) => !e.deleted
    );

    setEvents(activeEvents);

  } catch {}

};

    const createContract = async () => {
        try {

            const res = await fetch("/api/company/contracts", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientId: Number(form.clientId),
                    eventId: Number(form.eventId),
                    status: form.status,
                    totalAmount: Number(form.totalAmount),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(JSON.stringify(data.error) || "Failed to create contract");
                setErrorCode(res.status);
                return;
            }

            setShowForm(false);

            setForm({
                clientId: "",
                eventId: "",
                status: "draft",
                totalAmount: "",
            });

            fetchContracts();

        } catch {
            setError("Connection error");
        }
    };

    useEffect(() => {
        fetchContracts();
        fetchClients();
  fetchEvents();
    }, []);

    return (
        <div>

            <PageHeader
                title="Contracts"
                buttonLabel="+ New Contract"
                onClick={() => setShowForm(true)}
            />
            {showForm && (
                <CreateForm
                    title="Create Contract"
                    fields={contractFields}
                    form={form}
                    setForm={setForm}
                    onSubmit={createContract}
                    onCancel={() => setShowForm(false)}
                />
            )}


            {error && <ErrorBox message={error} code={errorCode} />}

            {loading && <p>Loading contracts...</p>}

            {!loading && contracts.length === 0 && (
                <p>No contracts found.</p>
            )}

            {!loading && contracts.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >

                    {contracts.map((contract) => (

                        <ListCard
                            key={contract.id}
                            title={`Contract #${contract.id}`}
                            extra={[
  `Client: ${contract.client?.name}`,
  `Event: ${contract.event?.name}`,
  `Status: ${contract.status}`,
  `Total: $${contract.totalAmount}`,
]}
                            link={`/company/contracts/${contract.id}`}
                        />

                    ))}

                </div>
            )}

        </div>
    );
}