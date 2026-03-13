"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ErrorBox from "@/app/components/ErrorBox";

export default function ContractPaymentsPage() {

    const params = useParams();
    const contractId = params.contractId;

    const [payments, setPayments] = useState<any[]>([])
    const [contractTotal, setContractTotal] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)
    const [remainingAmount, setRemainingAmount] = useState(0)

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        currency: "MXN",
        paymentMethod: "cash"
    });

    const fields: Field[] = [
        {
            name: "amount",
            label: "Amount",
            type: "number"
        },
        {
            name: "currency",
            label: "Currency"
        },
        {
            name: "paymentMethod",
            label: "Payment Method"
        }
    ];

    async function fetchPayments() {

        try {

            setLoading(true);

            const res = await fetch(
                `/api/company/contracts/${contractId}/payments`,
                { credentials: "include" }
            );

            if (!res.ok) {
                setError("Failed to fetch payments");
                setErrorCode(res.status);
                return;
            }

            const data = await res.json()

            setPayments(data.payments)
            setContractTotal(data.contractTotal)
            setPaidAmount(data.paidAmount)
            setRemainingAmount(data.remainingAmount)

        } catch {

            setError("Connection error");

        } finally {

            setLoading(false);

        }

    }

    async function createPayment() {

        try {

            const res = await fetch(
                `/api/company/contracts/${contractId}/payments`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        amount: Number(form.amount),
                        currency: form.currency,
                        paymentMethod: form.paymentMethod
                    })
                }
            );

            if (!res.ok) {

                const data = await res.json();

                setError(
                    JSON.stringify(data.error) ||
                    "Failed to create payment"
                );

                setErrorCode(res.status);

                return;

            }

            setShowForm(false);

            setForm({
                amount: "",
                currency: "MXN",
                paymentMethod: "cash"
            });

            fetchPayments();

        } catch {

            setError("Connection error");

        }

    }

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div>

            <PageHeader
                title={`Contract ${contractId} Payments`}
                buttonLabel="+ Add Payment"
                onClick={() => setShowForm(true)}
            />
            <div
                style={{
                    background: "#f4f4f4",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 20
                }}
            >

                <p><strong>Contract Total:</strong> ${contractTotal}</p>
                <p><strong>Paid:</strong> ${paidAmount}</p>
                <p><strong>Remaining:</strong> ${remainingAmount}</p>

            </div>

            {showForm && (
                <CreateForm
                    title="Add Payment"
                    fields={fields}
                    form={form}
                    setForm={setForm}
                    onSubmit={createPayment}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {error && (
                <ErrorBox
                    message={error}
                    code={errorCode}
                />
            )}

            {loading && <p>Loading payments...</p>}

            {!loading && payments.length === 0 && (
                <p>No payments yet.</p>
            )}

            {!loading && payments.length > 0 && (

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10
                    }}
                >

                    {payments.map((payment) => (

                        <ListCard
                            key={payment.id}
                            title={`Payment #${payment.id}`}
                            extra={[
                                `Amount: $${payment.amount}`,
                                `Currency: ${payment.currency}`,
                                `Method: ${payment.paymentMethod}`,
                                `Date: ${new Date(payment.createdAt).toLocaleDateString()}`
                            ]}
                            link={`#`}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}