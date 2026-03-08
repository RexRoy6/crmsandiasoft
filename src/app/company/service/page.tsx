"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import Link from "next/link";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);
    //para crear servicios
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        stockTotal: 1,
        priceBase: "",
    });


    const fetchServices = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/company/services", {
                credentials: "include",
            });

            if (!res.ok) {
                setError("Failed to fetch services");
                setErrorCode(res.status);
                return;
            }

            const data = await res.json();

            setServices(data);
        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const createService = async () => {
        try {
            const res = await fetch("/api/company/services", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                setError("Failed to create service");
                setErrorCode(res.status);
                return;
            }

            setShowForm(false);

            setForm({
                name: "",
                description: "",
                stockTotal: 1,
                priceBase: "",
            });

            fetchServices(); // refresh list
        } catch {
            setError("Connection error");
        }
    };


    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Services</h1>
                {showForm && (
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 10,
                            marginBottom: 30,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        }}
                    >
                        <h3>Create Service</h3>

                        <input
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />

                        <br />

                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />

                        <br />

                        <input
                            type="number"
                            placeholder="Stock"
                            value={form.stockTotal}
                            onChange={(e) =>
                                setForm({ ...form, stockTotal: Number(e.target.value) })
                            }
                        />

                        <br />

                        <input
                            placeholder="Base Price"
                            value={form.priceBase}
                            onChange={(e) =>
                                setForm({ ...form, priceBase: e.target.value })
                            }
                        />

                        <br />

                        <button onClick={createService}>Create</button>

                        <button onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                )}


                <button onClick={() => setShowForm(true)}>+ New Service</button>
            </div>

            {error && <ErrorBox message={error} code={errorCode} />}

            {loading && <p>Loading services...</p>}

            {!loading && services.length === 0 && <p>No services found.</p>}

            {!loading && services.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {services.map((service) => (
                        <div
                            key={service.id}
                            style={{
                                background: "white",
                                padding: 20,
                                borderRadius: 10,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            <strong>{service.name}</strong>

                            <p>{service.description}</p>

                            <p>Stock: {service.stockTotal}</p>

                            <p>Price: ${service.priceBase}</p>

                            <Link href={`/company/service/${service.id}`}>
                                <button>Manage</button>
                            </Link>



                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}