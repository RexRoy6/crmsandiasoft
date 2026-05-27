"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils/date";
import CreateForm, {
    Field,
} from "@/app/components/crm/CreateForm";

type Props = {
    companyServices: any[];
    contract: any;
    onSubmit: (data: any) => Promise<boolean | void>;
};

const initialForm = {
    serviceId: "",
    quantity: "",
    unitPrice: "",
    serviceNotes: "",
    operationStart: "",
    operationEnd: "",
};

export default function ContractServiceForm({
    companyServices,
    contract,
    onSubmit,
}: Props) {

    const [showForm, setShowForm] =
        useState(false);

    const [form, setForm] =
        useState(initialForm);

    const handleServiceChange = (
        serviceId: string
    ) => {

        const service =
            companyServices.find(
                (s) =>
                    String(s.id) === serviceId
            );

        if (!service) return;

        setForm((prev) => ({
            ...prev,
            serviceId,
            unitPrice: String(
                service.priceBase
            ),
        }));
    };

    const fields: Field[] = [
        {
            name: "serviceId",
            label: "Service",
            type: "select",
            options:
                companyServices.map((s) => ({
                    value: String(s.id),
                    label:
                        `${s.name} ($${s.priceBase})`,
                })),
            onChange: handleServiceChange,

            required: true,
        },
        {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
        },
        {
            name: "unitPrice",
            label: "Unit Price",
            type: "number",
        },
        {
            name: "serviceNotes",
            label: "Notes",
            type: "textarea",
        },
        {
            name: "operationStart",
            label: "Start Time",
            type: "time",
            required: true,
        },
        {
            name: "operationEnd",
            label: "End Time",
            type: "time",
            required: true,
        },
    ];

    const selectedService =
        useMemo(() => {

            return companyServices.find(
                (s) =>
                    String(s.id) ===
                    form.serviceId
            );

        }, [
            companyServices,
            form.serviceId,
        ]);

    const subtotal =
        Number(form.quantity || 0) *
        Number(form.unitPrice || 0);

    async function handleSubmit() {

        const success =
            await onSubmit(form);

        if (!success) return;

        setShowForm(false);

        setForm(initialForm);
    }

    function handleCancel() {

        setShowForm(false);

        setForm(initialForm);
    }

    return (
        <div
            style={{
                marginBottom: 20,
            }}
        >

            <button
                onClick={() =>
                    setShowForm(true)
                }
                style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                    marginBottom: 10,
                }}
            >
                + Add Service
            </button>

            {showForm && (
                <CreateForm
                    title="Add Service to Contract"
                    fields={fields}
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            {selectedService && (
                <div
                    style={{
                        marginTop: 10,
                        padding: 12,
                        border:
                            "1px solid var(--border-color)",
                        borderRadius: 8,
                    }}
                >

                    <p
                        style={{
                            fontSize: 12,
                            color:
                                "var(--text-secondary)",
                            marginBottom: 6,
                        }}
                    >
                        📅 Event date:
                        {" "}
                        {formatDate(contract?.event?.eventDate)}
                    </p>

                    <p
                        style={{
                            marginBottom: 6,
                        }}
                    >
                        Stock available:
                        {" "}
                        {
                            selectedService.stockTotal
                        }
                    </p>

                    {subtotal > 0 && (
                        <p
                            style={{
                                fontWeight: 600,
                            }}
                        >
                            Subtotal:
                            {" "}
                            ${subtotal}
                        </p>
                    )}

                </div>
            )}

        </div>
    );
}