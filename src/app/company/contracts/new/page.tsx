"use client";

import { useEffect, useState } from "react";

import CreateForm, {
    Field,
} from "@/app/components/crm/CreateForm";

import ClientSearch
    from "@/app/components/crm/ClientSearch";

import InlineClientForm
    from "@/app/components/crm/InlineClientForm";

import ErrorBox
    from "@/app/components/ErrorBox";

import PaymentList
    from "@/app/components/crm/payments/PaymentList";

import PaymentForm
    from "@/app/components/crm/payments/PaymentForm";

import EventSearch
    from "@/app/components/crm/events/EventSearch";

import {
    resumeContractDraft,
} from "@/services/contracts/resumeContractDraft";

import ContractServiceForm
    from "@/app/components/crm/contracts/ContractServiceForm";

import ContractServicesList
    from "@/app/components/crm/contracts/ContractServicesList";

import ContractSummaryCard
    from "@/app/components/crm/contracts/ContractSummaryCard";

export default function NewContractPage() {

    const [clientError, setClientError] =
        useState("");

    const [error, setError] =
        useState("");

    const [errorCode, setErrorCode] =
        useState<number | undefined>();

    const parseError = (
        error: any,
        fallback = "Unexpected error"
    ) => {

        if (!error)
            return fallback;

        if (typeof error === "string")
            return error;

        if (Array.isArray(error))
            return error.join(", ");

        if (typeof error === "object") {

            if (error.fieldErrors) {

                const messages =
                    Object.values(error.fieldErrors)
                        .flat()
                        .filter(Boolean);

                if (messages.length)
                    return messages.join(", ");
            }

            if (error.message)
                return String(error.message);
        }

        return fallback;
    };

    // client
    const [showClientForm, setShowClientForm] =
        useState(false);

    // services
    const [services, setServices] =
        useState<any[]>([]);

    const [companyServices, setCompanyServices] =
        useState<any[]>([]);

    // flow
    const [step, setStep] =
        useState<"event" | "services">("event");

    // payments
    const [payments, setPayments] =
        useState<any[]>([]);

    const [loadingPayments, setLoadingPayments] =
        useState(false);

    // contract
    const [contractId, setContractId] =
        useState<number | null>(null);

    const [contract, setContract] =
        useState<any>(null);

    // event form
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

    // new client form
    const [clientForm, setClientForm] =
        useState({
            name: "",
            phone: "",
            email: "",
        });

    const [eventDateTime, setEventDateTime] =
        useState<string | null>(null);

    const resetAll = () => {

        setStep("event");

        setContractId(null);
        setContract(null);

        localStorage.removeItem(
            "activeContractDraft"
        );

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

        setServices([]);
        setCompanyServices([]);

        setPayments([]);

        setError("");
        setClientError("");

        setEventDateTime(null);
    };

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

    const createClientInline = async () => {

        try {

            if (
                !clientForm.name ||
                !clientForm.phone
            ) {

                setClientError(
                    "All client fields are required"
                );

                return;
            }

            const res = await fetch(
                "/api/company/clients",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clientForm),
                }
            );

            if (!res.ok) {

                setClientError(
                    "Failed to create client"
                );

                setErrorCode(res.status);

                return;
            }

            setClientError("");

            const newClient =
                await res.json();

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

    const createAll = async () => {

        try {

            const dateTime =
                new Date(
                    `${form.eventDate}T${form.eventTime}`
                );

            const pad = (n: number) =>
                String(n).padStart(2, "0");

            const formatted =
                `${dateTime.getFullYear()}-${pad(
                    dateTime.getMonth() + 1
                )}-${pad(dateTime.getDate())} ${pad(
                    dateTime.getHours()
                )}:${pad(
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

            if (
                !form.eventDate ||
                !form.eventTime
            ) {

                setError(
                    "Event date and time are required"
                );

                return;
            }

            const eventRes = await fetch(
                "/api/company/events",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!eventRes.ok) {

                setError("Error creating event");

                setErrorCode(eventRes.status);

                return;
            }

            const event =
                await eventRes.json();

            const contractRes = await fetch(
                "/api/company/contracts",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        eventId: event.id,
                        status: "draft",
                        totalAmount: 0,
                    }),
                }
            );

            if (!contractRes.ok) {

                const data =
                    await contractRes.json();

                if (
                    contractRes.status === 409
                ) {

                    setError(
                        "Contract already exists for this event"
                    );

                    setErrorCode(409);

                    return;
                }

                setError(
                    parseError(
                        data?.error,
                        "Error creating contract"
                    )
                );

                return;
            }

            const contract =
                await contractRes.json();

            resetForm();

            setContract(contract);

            setContractId(contract.id);

            setStep("services");

        } catch (e) {

            console.error(e);

            setError("Connection error");
        }
    };

    const fetchContract = async () => {

        if (!contractId) return;

        try {

            const res = await fetch(
                `/api/company/contracts/${contractId}`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data =
                await res.json();

            setContract(data);

        } catch {

            setError(
                "Failed to load contract"
            );
        }
    };

    const fetchServices = async () => {

        if (!contractId) return;

        try {

            const res = await fetch(
                `/api/company/contracts/${contractId}/services`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data =
                await res.json();

            setServices(data);

        } catch {

            setError(
                "Failed to load services"
            );
        }
    };

    const fetchCompanyServices = async () => {

        try {

            const res = await fetch(
                "/api/company/services/active",
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data =
                await res.json();

            setCompanyServices(data);

        } catch {

            setError(
                "Failed to load service catalog"
            );
        }
    };

    const fetchPayments = async () => {

        if (!contractId) return;

        try {

            setLoadingPayments(true);

            const res = await fetch(
                `/api/company/contracts/${contractId}/payments`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data =
                await res.json();

            setPayments(data.payments);

        } catch {

            setError(
                "Failed to load payments"
            );

        } finally {

            setLoadingPayments(false);
        }
    };

    const continueExistingEvent = async (
        event: any
    ) => {

        try {

            const result =
                await resumeContractDraft(
                    event.id
                );

            setContractId(
                result.contract.id
            );

            setContract(
                result.contract
            );

            setEventDateTime(
                event.eventDate
            );

            setStep("services");

        } catch (e: any) {

            setError(
                e.message ||
                "Connection error"
            );
        }
    };

    useEffect(() => {

        if (
            !contractId ||
            !contract
        ) return;

        if (
            contract.status !== "draft"
        ) {

            localStorage.removeItem(
                "activeContractDraft"
            );

            return;
        }

        localStorage.setItem(
            "activeContractDraft",
            String(contractId)
        );

    }, [contractId, contract]);

    useEffect(() => {

        const saved =
            localStorage.getItem(
                "activeContractDraft"
            );

        if (!saved) return;

        const restore = async () => {

            try {

                const res = await fetch(
                    `/api/company/contracts/${saved}`,
                    {
                        credentials: "include",
                    }
                );

                const contract =
                    await res.json();

                if (
                    contract.status !== "draft"
                ) {

                    localStorage.removeItem(
                        "activeContractDraft"
                    );

                    return;
                }

                setContractId(contract.id);

                setContract(contract);

                setEventDateTime(
                    contract.event?.eventDate ||
                    null
                );

                setStep("services");

                setError("");

            } catch (e) {

                console.error(e);
            }
        };

        restore();

    }, []);

    useEffect(() => {

        if (
            step === "services" &&
            contractId
        ) {

            fetchServices();
            fetchCompanyServices();
            fetchContract();
            fetchPayments();
        }

    }, [step, contractId]);

    const fields: Field[] = [
        {
            name: "clientId",
            label: "Client",
            readOnly: true,
            after: (
                <>
                    {form.client && (
                        <div
                            style={{
                                fontSize: 14,
                                marginBottom: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 600,
                                }}
                            >
                                ✅ {form.client.name}
                            </div>

                            <div
                                style={{
                                    fontSize: 12,
                                    color:
                                        "var(--text-secondary)",
                                }}
                            >
                                {form.client.phone}
                            </div>
                        </div>
                    )}

                    <ClientSearch
                        selected={form.clientId}
                        onSelect={(client) => {

                            setForm((prev) => ({
                                ...prev,
                                clientId:
                                    String(client.id),
                                client: {
                                    id: client.id,
                                    name: client.name,
                                    phone: client.phone,
                                },
                            }));
                        }}
                    />

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

                    <div
                        style={{
                            marginTop: 10,
                        }}
                    >
                        {!showClientForm && (
                            <button
                                onClick={() =>
                                    setShowClientForm(true)
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
                                onSubmit={
                                    createClientInline
                                }
                                onCancel={() =>
                                    setShowClientForm(false)
                                }
                            />
                        )}

                        {clientError && (
                            <p
                                style={{
                                    color:
                                        "var(--error-color)",
                                    fontSize: 12,
                                }}
                            >
                                {clientError}
                            </p>
                        )}
                    </div>
                </>
            ),
        },
        {
            name: "name",
            label: "Event name",
        },
        {
            name: "eventDate",
            label: "Date",
            type: "date",
        },
        {
            name: "eventTime",
            label: "Time",
            type: "time",
        },
        {
            name: "location",
            label: "Location",
        },
        {
            name: "notes",
            label: "Notes",
            type: "textarea",
        },
    ];

    return (
        <div style={{ padding: 20 }}>

            <h2
                style={{
                    marginBottom: 20,
                }}
            >
                New Contract Flow
            </h2>

            {step === "event" && (

                <>
                    <CreateForm
                        title="1. Create Event"
                        fields={fields}
                        form={form}
                        setForm={setForm}
                        onSubmit={createAll}
                        onCancel={resetForm}
                    />

                    <hr
                        style={{
                            margin: "30px 0",
                        }}
                    />

                    <div>
                        <div
                            style={{
                                padding: 20,
                                border:
                                    "1px solid var(--border-color)",
                                borderRadius: 10,
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: 10,
                                }}
                            >
                                Continue Existing Event
                            </h3>

                            <p
                                style={{
                                    fontSize: 13,
                                    color:
                                        "var(--text-secondary)",
                                    marginBottom: 10,
                                }}
                            >
                                Search for an existing event and continue the contract flow.
                            </p>

                            <EventSearch
                                onSelect={
                                    continueExistingEvent
                                }
                            />
                        </div>
                    </div>
                </>
            )}

            {error && (
                <ErrorBox
                    message={error}
                    code={errorCode}
                />
            )}

            {step === "services" &&
                contractId && (
                    <>
                        <ContractSummaryCard
                            contract={contract}
                        />
                        <div
                            style={{
                                padding: 20,
                                border:
                                    "1px solid var(--border-color)",
                                borderRadius: 10,
                            }}
                        >
                            <h3>
                                2. Services
                            </h3>

                            <ContractServiceForm
                                companyServices={
                                    companyServices
                                }
                                contract={contract}
                                onSubmit={async (data) => {

                                    try {

                                        const eventDate =
                                            contract?.event?.eventDate
                                                ?.split("T")[0];

                                        const operationStart =
                                            data.operationStart
                                                ? new Date(
                                                    `${eventDate}T${data.operationStart}`
                                                ).toISOString()
                                                : undefined;

                                        const operationEnd =
                                            data.operationEnd
                                                ? new Date(
                                                    `${eventDate}T${data.operationEnd}`
                                                ).toISOString()
                                                : undefined;

                                        const payload = {
                                            serviceId: Number(data.serviceId),
                                            quantity: Number(data.quantity),
                                            unitPrice: Number(data.unitPrice),
                                            serviceNotes: data.serviceNotes,

                                            operationStart,
                                            operationEnd,
                                        };

                                        // console.log("RAW FORM DATA", data);
                                        // console.log("EVENT DATE", eventDate);
                                        // console.log("PAYLOAD", payload);

                                        const res = await fetch(
                                            `/api/company/contracts/${contractId}/services`,
                                            {
                                                method: "POST",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify(payload),
                                            }
                                        );

                                        if (!res.ok) {

                                            const result = await res.json();

                                            setError(
                                                parseError(
                                                    result?.error,
                                                    "Failed to add service"
                                                )
                                            );

                                            return false;
                                        }

                                        setError("");

                                        await fetchServices();

                                        return true;

                                    } catch (e) {

                                        console.error(e);

                                        setError("Connection error");

                                        return false;
                                    }
                                }}
                            />

                            <ContractServicesList
                                services={services}
                                loading={false}
                                onDelete={async (id) => {

                                    if (
                                        !confirm(
                                            "Remove service?"
                                        )
                                    ) return;

                                    try {

                                        const res =
                                            await fetch(
                                                `/api/company/contract-items/${id}`,
                                                {
                                                    method: "DELETE",
                                                    credentials: "include",
                                                }
                                            );

                                        if (!res.ok) {

                                            const data =
                                                await res.json();

                                            setError(
                                                parseError(
                                                    data?.error,
                                                    "Failed to delete"
                                                )
                                            );

                                            return;
                                        }

                                        setError("");

                                        fetchServices();

                                    } catch {

                                        setError(
                                            "Connection error"
                                        );
                                    }
                                }}
                                onUpdate={async (
                                    id,
                                    data
                                ) => {

                                    try {

                                        const res =
                                            await fetch(
                                                `/api/company/contract-items/${id}`,
                                                {
                                                    method: "PATCH",
                                                    credentials: "include",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify(data),
                                                }
                                            );

                                        if (!res.ok) {

                                            const result =
                                                await res.json();

                                            setError(
                                                parseError(
                                                    result?.error,
                                                    "Failed to update"
                                                )
                                            );

                                            return;
                                        }

                                        setError("");

                                        fetchServices();

                                    } catch {

                                        setError(
                                            "Connection error"
                                        );
                                    }
                                }}
                            />

                            <hr
                                style={{
                                    margin:
                                        "20px 0",
                                }}
                            />

                            <h3>
                                3. Payments
                            </h3>

                            <PaymentForm
                                contractId={String(contractId)}
                                onSuccess={fetchPayments}
                            />

                            {loadingPayments ? (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "gray",
                                    }}
                                >
                                    Loading payments...
                                </p>
                            ) : (
                                <PaymentList
                                    payments={payments}
                                />
                            )}
                            <p>
                                ⚠️ Este es el paso final de el registro rapido ⚠️
                            </p>
                            <p>
                                ⚠️ si deseas continuar con un registro nuevo refrezca la pagina 🔄
                            </p>
                            <p>
                                ⚠️ o darle click al boton de abajo ⬇️
                            </p>

                        </div>
                        <button
                            onClick={resetAll}
                            style={{
                                marginTop: 20,
                                padding:
                                    "10px 14px",
                                borderRadius: 8,
                                border:
                                    "1px solid var(--border-color)",
                                background:
                                    "transparent",
                                cursor: "pointer",
                            }}
                        >
                            🏁 ir a Crear contrato desde cero
                        </button>

                    </>
                )}
        </div>
    );
}