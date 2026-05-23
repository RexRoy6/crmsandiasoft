"use client";

import { useEffect, useState } from "react";

import CreateForm, {
    Field,
} from "@/app/components/crm/CreateForm";

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


import {
    getEventFields,
} from "@/app/components/crm/events/getEventFields";

import {
    useEventForm,
} from "@/app/hooks/events/useEventForm";

import {
    useContract,
} from "@/app/hooks/contracts/useContract";


export default function NewContractPage() {


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


    const {
        contract,
        setContract,

        fetchContract,

    } = useContract(contractId);


    const {
        form,
        setForm,

        resetForm,

        createEvent,

        error: eventError,
        errorCode: eventErrorCode,

    } = useEventForm({

        onSuccess: ({ event, contract }) => {

            setContract(contract);

            setContractId(contract.id);

            setEventDateTime(
                event.eventDate
            );

            setStep("services");
        },
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

        resetForm();

        setServices([]);
        setCompanyServices([]);

        setPayments([]);

        setError("");

        setEventDateTime(null);
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

    const fields =
        getEventFields({
            form,
            setForm,
        });

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
                        onSubmit={createEvent}
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

            {(error || eventError) && (
                <ErrorBox
                    message={error || eventError}
                    code={errorCode || eventErrorCode}
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
                                ⚠️ Despues de agregar un pago a un servicio, se concidera iniciado el contrato ⚠️
                            </p>
                            <p>
                                ⚠️ Siendo este es el paso final de el registro rapido ⚠️
                            </p>
                            <p>
                                ℹ️ si deseas continuar con un registro nuevo refrezca la pagina 🔄
                            </p>
                            <p>
                                ℹ️ o darle click al boton de abajo ⬇️
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