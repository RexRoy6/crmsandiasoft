"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import Link from "next/link";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";

export default function ClientsPage() {

    const [clients, setClients] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);

    /* create client */
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
    });

    //campos para formulario de clientes
    const clientFields = [
        { name: "name", label: "Name" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email" }
    ];

    const fetchClients = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/company/clients", {
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json();

                console.log("Create client error:", data);

                setError(
                    data?.error?.fieldErrors
                        ? JSON.stringify(data.error.fieldErrors)
                        : "Failed to create client"
                );

                setErrorCode(res.status);
                return;
            }

            const data = await res.json();

            setClients(data);

        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const createClient = async () => {
        try {

            if (!form.name || !form.phone || !form.email) {
                setError("All fields are required");
                return;
            }

            const res = await fetch("/api/company/clients", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                setError("Failed to create client");
                setErrorCode(res.status);
                return;
            }

            setShowForm(false);

            setForm({
                name: "",
                phone: "",
                email: "",
            });

            fetchClients();

        } catch {
            setError("Connection error");
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div>

            <PageHeader
                title="Clients"
                buttonLabel="+ New Client"
                onClick={() => setShowForm(true)}
            />

            {showForm && (
                <CreateForm
                    title="Create Client"
                    fields={clientFields}
                    form={form}
                    setForm={setForm}
                    onSubmit={createClient}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {error && <ErrorBox message={error} code={errorCode} />}

            {loading && <p>Loading clients...</p>}

            {!loading && clients.length === 0 && (
                <p>No clients found.</p>
            )}

            {!loading && clients.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {clients.map((client) => (
                        <ListCard
                            key={client.id}
                            title={client.name}
                            //description={service.description}
                            extra={[
                                `Phone: ${client.phone}`,
                                `Email: ${client.email}`,
                            ]}
                            link={`/company/clients/${client.id}`}
                        />
                    ))}

                </div>
            )}

        </div>
    );
}