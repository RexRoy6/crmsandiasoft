"use client";

import { useEffect, useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ClientSearch from "@/app/components/crm/ClientSearch";
import InlineClientForm from "@/app/components/crm/InlineClientForm";
import ErrorBox from "@/app/components/ErrorBox";
import EventInfoCard from "@/app/components/crm/EventInfoCard";
import ContractItemCard from "@/app/components/crm/ContractItemCard";
import PaymentList from "@/app/components/crm/payments/PaymentList";
import PaymentForm from "@/app/components/crm/payments/PaymentForm";
export default function NewContractPage() {

    const [clientError, setClientError] = useState("");
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();


    //para buscar clientes
    const [search, setSearch] = useState("");
    //

    //es para crear un nuevo cliente
    const [showClientForm, setShowClientForm] = useState(false);


    //cosas para service:
    const [services, setServices] = useState<any[]>([]);
    const [companyServices, setCompanyServices] = useState<any[]>([]);
    const [showServiceForm, setShowServiceForm] = useState(false);

    const [serviceForm, setServiceForm] = useState({
        serviceId: "",
        quantity: "",
        unitPrice: "",
        serviceNotes: "",
        operationStart: "",
        operationEnd: "",
    });


    const [step, setStep] = useState<"event" | "services">("event");

    //cosas para payments
    const [payments, setPayments] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
 



    const [contractId, setContractId] = useState<number | null>(null);
    const [contract, setContract] = useState<any>(null);

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


    const [eventDateTime, setEventDateTime] = useState<string | null>(null);

    const resetAll = () => {
    // step
    setStep("event");

    // contract
    setContractId(null);
    setContract(null);

    // event form
    setForm({
        clientId: "",
        client: undefined,
        name: "",
        eventDate: "",
        eventTime: "",
        location: "",
        notes: "",
    });

    // client inline
    setClientForm({
        name: "",
        phone: "",
        email: "",
    });
    setShowClientForm(false);

    // services
    setServices([]);
    setCompanyServices([]);
    setShowServiceForm(false);

    setServiceForm({
        serviceId: "",
        quantity: "",
        unitPrice: "",
        serviceNotes: "",
        operationStart: "",
        operationEnd: "",
    });



    // errors
    setError("");
    setClientError("");

    // date
    setEventDateTime(null);
};


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

            const pad = (n: number) => String(n).padStart(2, "0");

            const formatted = `${dateTime.getFullYear()}-${pad(
                dateTime.getMonth() + 1
            )}-${pad(dateTime.getDate())} ${pad(dateTime.getHours())}:${pad(
                dateTime.getMinutes()
            )}:00`;
            setEventDateTime(formatted);

            const payload = {
                clientId: Number(form.clientId),
                name: form.name,
                eventDate: formatted,
                location: form.location,
                notes: form.notes,
            };

            if (!form.clientId) {
                setError("Client is required");
                return;
            }

            if (!form.name) {
                setError("Event name is required");
                return;
            }

            if (!form.eventDate || !form.eventTime) {
                setError("Event date and time are required");
                return;
            }

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
                    setError("Contract already exists for this event");
                    setErrorCode(409);
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

    //fetch contract
    const fetchContract = async () => {
        if (!contractId) return;

        try {
            const res = await fetch(`/api/company/contracts/${contractId}`, {
                credentials: "include",
            });

            if (!res.ok) return;

            const data = await res.json();
            setContract(data);
        } catch {
            setError("Failed to load contract");
        }
    };

    //services
    const fetchServices = async () => {
        if (!contractId) return;

        try {
            const res = await fetch(
                `/api/company/contracts/${contractId}/services`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const data = await res.json();
            setServices(data);
        } catch {
            setError("Failed to load services");
        }
    };
    //buscar servicios
    const fetchCompanyServices = async () => {
        try {
            const res = await fetch("/api/company/services", {
                credentials: "include",
            });

            if (!res.ok) return;

            const data = await res.json();
            setCompanyServices(data);
        } catch {
            setError("Failed to load service catalog");
        }
    };

    //crear/agreagar servicio
    const createService = async () => {
        if (!contractId) return;

        try {
            const combineDateTime = (time?: string) => {
                if (!time || !eventDateTime) return undefined;

                const date = new Date(eventDateTime);

                const [h, m] = time.split(":");

                date.setHours(Number(h));
                date.setMinutes(Number(m));
                date.setSeconds(0);

                return date.toISOString();
            };

            if (!serviceForm.serviceId) {
                setError("Service is required");
                return;
            }

            if (!serviceForm.quantity || Number(serviceForm.quantity) <= 0) {
                setError("Quantity must be greater than 0");
                return;
            }

            if (!serviceForm.unitPrice) {
                setError("Unit price is required");
                return;
            }


            const res = await fetch(
                `/api/company/contracts/${contractId}/services`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        serviceId: Number(serviceForm.serviceId),
                        quantity: Number(serviceForm.quantity),
                        unitPrice: Number(serviceForm.unitPrice),
                        serviceNotes: serviceForm.serviceNotes || undefined,
                        operationStart: combineDateTime(serviceForm.operationStart),
                        operationEnd: combineDateTime(serviceForm.operationEnd),
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                setError(data?.error || "Failed to add service");
                return;
            }

            setShowServiceForm(false);

            setServiceForm({
                serviceId: "",
                quantity: "",
                unitPrice: "",
                serviceNotes: "",
                operationStart: "",
                operationEnd: "",
            });

            fetchServices();

        } catch {
            setError("Connection error");
        }
    };



    const fetchPayments = async () => {
        if (!contractId) return;

        try {
            setLoadingPayments(true);

            const res = await fetch(
                `/api/company/contracts/${contractId}/payments`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const data = await res.json();

            setPayments(data.payments); // 👈 importante
        } catch {
            setError("Failed to load payments");
        } finally {
            setLoadingPayments(false);
        }
    };

    //service fields
    const serviceFields: Field[] = [
        {
            name: "serviceId",
            label: "Service",
            type: "select",
            options: companyServices.map((s) => ({
                value: String(s.id),
                label: `${s.name} ($${s.priceBase})`,
            })),
            onChange: (value) => {
                const service = companyServices.find(
                    (s) => String(s.id) === value
                );

                if (!service) return;

                setServiceForm((prev) => ({
                    ...prev,
                    serviceId: value,
                    unitPrice: String(service.priceBase),
                }));
            },
        },
        { name: "quantity", label: "Quantity", type: "number" },
        { name: "unitPrice", label: "Unit Price", type: "number" },
        { name: "serviceNotes", label: "Notes", type: "textarea" },
        { name: "operationStart", label: "Start Time", type: "time" },
        { name: "operationEnd", label: "End Time", type: "time" },
    ];



    useEffect(() => {
        if (step === "services" && contractId) {
            fetchServices();
            fetchCompanyServices();
            fetchContract();
            fetchPayments();
        }
    }, [step, contractId]);

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

                        {clientError && (
                            <p style={{ color: "var(--error-color)", fontSize: 12 }}>
                                {clientError}
                            </p>
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
                    {contract?.eventId && (
                        <EventInfoCard eventId={contract.eventId} />
                    )}
                    <h3>2. Services</h3>

                    <button
                        onClick={() => setShowServiceForm(true)}
                        style={{
                            marginBottom: 10,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "#2563eb",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        + Add Service
                    </button>

                    {showServiceForm && (
                        <CreateForm
                            title="Add Service"
                            fields={serviceFields}
                            form={serviceForm}
                            setForm={setServiceForm}
                            onSubmit={createService}
                            onCancel={() => setShowServiceForm(false)}
                        />
                    )}

                    {serviceForm.quantity && serviceForm.unitPrice && (
                        <p style={{ fontSize: 13 }}>
                            Subtotal: $
                            {Number(serviceForm.quantity) * Number(serviceForm.unitPrice)}
                        </p>
                    )}

                    {/* LIST */}
                    {services.length === 0 && !showServiceForm && (
                        <p>No services yet</p>
                    )}

                    {services.map((item) => (
                        <ContractItemCard
                            key={item.id}
                            item={item}
                            onDelete={async (id) => {
                                if (!confirm("Remove service?")) return;

                                try {
                                    const res = await fetch(`/api/company/contract-items/${id}`, {
                                        method: "DELETE",
                                        credentials: "include",
                                    });

                                    if (!res.ok) {
                                        const data = await res.json();
                                        setError(data?.error || "Failed to delete");
                                        return;
                                    }

                                    fetchServices();
                                } catch {
                                    setError("Connection error");
                                }
                            }}
                            onUpdate={async (id, data) => {
                                try {
                                    const toISO = (value?: any) => {
                                        if (!value) return undefined;

                                        const date = new Date(value);
                                        if (isNaN(date.getTime())) return undefined;

                                        return date.toISOString();
                                    };

                                    const res = await fetch(`/api/company/contract-items/${id}`, {
                                        method: "PATCH",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            ...data,
                                            operationStart: toISO(data.operationStart),
                                            operationEnd: toISO(data.operationEnd),
                                        }),
                                    });

                                    if (!res.ok) {
                                        setError("Failed to update");
                                        return;
                                    }

                                    fetchServices();
                                } catch {
                                    setError("Connection error");
                                }
                            }}
                        />
                    ))}

                    <hr style={{ margin: "20px 0" }} />

                 <h3>3. Payments</h3>

{/* 🔥 reutilizas todo */}
<PaymentForm
  contractId={String(contractId)}
  onSuccess={fetchPayments}
/>

{loadingPayments ? (
  <p style={{ fontSize: 12, color: "gray" }}>
    Loading payments...
  </p>
) : (
  <PaymentList payments={payments} />
)}


                    <button
    onClick={resetAll}
    style={{
        marginTop: 20,
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid var(--border-color)",
        background: "transparent",
        cursor: "pointer",
    }}
>
    + New Contract
</button>


                </div>
            )}
        </div>
    );
}