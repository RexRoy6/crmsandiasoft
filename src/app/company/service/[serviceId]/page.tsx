"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorBox from "@/app/components/ErrorBox";

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();

    const serviceId = params.serviceId;

    const [service, setService] = useState<any>(null);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);


    //form de edicion:
    const [form, setForm] = useState({
        name: "",
        description: "",
        stockTotal: 0,
        priceBase: "",
    });

    //update
    const [saving, setSaving] = useState(false);


    const fetchService = async () => {
        try {
            setLoading(true);

            const res = await fetch(`/api/company/services/${serviceId}`, {
                credentials: "include",
            });

            if (!res.ok) {
                setError("Failed to fetch service");
                setErrorCode(res.status);
                return;
            }

            const data = await res.json();

            setService(data);

            setForm({
                name: data.name,
                description: data.description,
                stockTotal: data.stockTotal,
                priceBase: data.priceBase,
            });


        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    //update service
    const updateService = async () => {
        try {
            setSaving(true);
            setError("");

            const res = await fetch(`/api/company/services/${serviceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Update failed");
                return;
            }

            await fetchService();
            setEditing(false);

        } catch {
            setError("Connection error");
        } finally {
            setSaving(false);
        }
    };

    //soft delete
    const deleteService = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/company/services/${serviceId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                setError("Delete failed");
                return;
            }

            router.push("/company/service");

        } catch {
            setError("Connection error");
        }
    };
    //reactiate service:
    const reactivateService = async () => {
        try {
            const res = await fetch(
                `/api/company/services/${serviceId}?reactivate=true`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                setError("Reactivate failed");
                return;
            }

            await fetchService();

        } catch {
            setError("Connection error");
        }
    };


    useEffect(() => {
        fetchService();
    }, []);

    useEffect(() => {
        if (service) {
            setForm({
                name: service.name ?? "",
                description: service.description ?? "",
                stockTotal: service.stockTotal ?? 0,
                priceBase: service.priceBase ?? "",
            });
        }
    }, [service]);

    return (
        <div>
            <h1>Service Details</h1>

            {error && <ErrorBox message={error} code={errorCode} />}

            {loading && <p>Loading...</p>}

            {service && (
                <div
                    style={{
                        background: "white",
                        padding: 20,
                        borderRadius: 10,
                        marginTop: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        maxWidth: 400,
                    }}
                >

                    {/* VIEW MODE */}
                    {!editing && (
                        <>
                            <h2>{service.name}</h2>

                            <p>{service.description}</p>

                            <p>Stock: {service.stockTotal}</p>

                            <p>Price: ${service.priceBase}</p>

                            <div style={{ display: "flex", gap: 10 }}>

                                <button onClick={() => setEditing(true)}>
                                    Edit
                                </button>

                                <button
                                    onClick={deleteService}
                                    style={{ background: "red", color: "white" }}
                                >
                                    Delete
                                </button>

                                {service.deletedAt && (
                                    <button onClick={reactivateService}>
                                        Reactivate
                                    </button>
                                )}

                            </div>
                        </>
                    )}

                    {/* EDIT MODE */}
                    {editing && (
                        <>
                            <h2>Edit Service</h2>

                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Name"
                            />

                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                placeholder="Description"
                            />

                            <input
                                type="number"
                                value={form.stockTotal}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        stockTotal: Number(e.target.value),
                                    })
                                }
                            />

                            <input
                                value={form.priceBase}
                                onChange={(e) =>
                                    setForm({ ...form, priceBase: e.target.value })
                                }
                            />

                            <div style={{ display: "flex", gap: 10 }}>

                                <button onClick={updateService} disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </button>

                                <button onClick={() => setEditing(false)}>
                                    Cancel
                                </button>

                            </div>
                        </>
                    )}

                </div>
            )}
        </div>
    );
}