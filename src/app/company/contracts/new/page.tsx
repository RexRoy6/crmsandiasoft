"use client";

import { useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ClientSearch from "@/app/components/crm/ClientSearch";
import InlineClientForm from "@/app/components/crm/InlineClientForm";
import ErrorBox from "@/app/components/ErrorBox";
export default function NewContractPage() {

    const [clientError, setClientError] = useState("");

    const [clients, setClients] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();


    //para buscar clientes
    const [search, setSearch] = useState("");
    //

    //es para crear un nuevo cliente
    const [showClientForm, setShowClientForm] = useState(false);

    const [step, setStep] = useState<"event" | "services">("event");

    const [contractId, setContractId] = useState<number | null>(null);

    const [form, setForm] = useState({
        clientId: "",
        client: undefined as
            | {
                id: number;
                name: string;
                phone: string;
            }
            | undefined,
        name: "",
        eventDate: "",
        eventTime: "",
        location: "",
        notes: "",
    });

    //form para nuevo cx
    const [clientForm, setClientForm] = useState({
        name: "",
        phone: "",
        email: "",
    });

    //funcion para limpiar form
    const resetForm = () => {
        setForm({
            clientId: "",
            client: undefined,
            name: "",
            eventDate: "",
            eventTime: "",
            location: "",
            notes: "",
        });

        setClientForm({
            name: "",
            phone: "",
            email: "",
        });

        setShowClientForm(false);
        setClientError("");
    };

    //fucion para crear un cx

    const createClientInline = async () => {
        try {
            //if (!clientForm.name || !clientForm.phone || !clientForm.email) {
            if (!clientForm.name || !clientForm.phone) {
                setClientError("All client fields are required");
                return;
            }

            const res = await fetch("/api/company/clients", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(clientForm),
            });

            if (!res.ok) {
                setClientError("Failed to create client");

                setErrorCode(res.status);
                return;
            }

            setClientError("");

            const newClient = await res.json();

            // 🔥 clave: actualizar lista
            setClients((prev) => [...prev, newClient]);

            // 🔥 seleccionar automáticamente
            setForm((prev) => ({
                ...prev,
                clientId: String(newClient.id),
                client: {
                    id: newClient.id,
                    name: newClient.name,
                    phone: newClient.phone,
                },
            }));

            setShowClientForm(false);

            setClientForm({
                name: "",
                phone: "",
                email: "",
            });
        } catch {
            setError("Connection error");

        }
    };


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
                setError("Error creating event");
                setErrorCode(eventRes.status);
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

            resetForm();
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
                    {/* seleccionado */}
                    {form.client && (
                        <div style={{ fontSize: 14, marginBottom: 6 }}>
                            <div style={{ fontWeight: 600 }}>
                                ✅ {form.client.name}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                {form.client.phone}
                            </div>
                        </div>
                    )}

                    <ClientSearch
                        selected={form.clientId}
                        onSelect={(client) => {
                            setForm((prev) => ({
                                ...prev,
                                clientId: String(client.id),
                                client: {
                                    id: client.id,
                                    name: client.name,
                                    phone: client.phone,
                                },
                            }));
                        }}
                    />

                    {/* cambiar cliente */}
                    {form.clientId && (
                        <button
                            onClick={() =>
                                setForm((prev) => ({
                                    ...prev,
                                    clientId: "",
                                    client: undefined,
                                }))
                            }
                            style={{
                                marginTop: 6,
                                fontSize: 12,
                                color: "var(--error-color)",
                                //color: "#dc2626",
                                cursor: "pointer",
                                background: "none",
                                border: "none",
                            }}
                        >
                            Change client
                        </button>
                    )}

                    {/* 👇 tu create inline sigue funcionando */}
                    <div style={{ marginTop: 10 }}>
                        {!showClientForm && (
                            <button
                                onClick={() => setShowClientForm(true)}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: 12,
                                    borderRadius: 6,
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--primary-color)",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                + Create new client
                            </button>
                        )}

                        {showClientForm && (
                            <InlineClientForm
                                form={clientForm}
                                setForm={setClientForm}
                                onSubmit={createClientInline}
                                onCancel={() => setShowClientForm(false)}
                            />
                        )}
                    </div>
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
                    onCancel={resetForm}
                />
            )}

            {error && <ErrorBox message={error} code={errorCode} />}

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

                    <p style={{ fontSize: 12, color: "gray" }}>
                        Add services to build your contract total
                    </p>

                    <p>Contract ID: {contractId}</p>


                    <hr style={{ margin: "20px 0" }} />

                    <h3>3. Payments</h3>

                    <p style={{ fontSize: 12, color: "gray" }}>
                        Track payments from client
                    </p>
                </div>
            )}
        </div>
    );
}