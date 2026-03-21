"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import { CONTRACT_STATUS } from "@/db/schema"
import SearchBar from "@/app/components/crm/SearchBar"
import Pagination from "@/app/components/crm/Pagination"


export default function ContractsPage() {

    const [contracts, setContracts] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();


    /* create contract */
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        eventId: "",
        status: "draft"
        // ,
        // totalAmount: "",
    });


    //seach params y pagiantion 
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState<any>(null)

    const contractFields: Field[] = [

        {
            name: "eventId",
            label: "Event",
            type: "select",
            options: events.map((event) => ({
                value: event.id,
                label: `${event.name} (${event.client?.name})`,
            })),
        },

        {
            name: "status",
            label: "Status",
            type: "select",
            options: CONTRACT_STATUS.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1)
            }))
        }
        //,

        // {
        //     name: "totalAmount",
        //     label: "Total Amount",
        //     type: "number",
        // },
    ];
    const fetchContracts = async () => {
        try {

            setLoading(true);

            const res = await fetch(
                `/api/company/contracts?search=${search}&page=${page}&limit=10`,
                {
                    credentials: "include",
                }
            )

            if (!res.ok) {
                setError("Failed to fetch contracts");
                setErrorCode(res.status);
                return;
            }

            const result = await res.json();

            setContracts(result.data);
            setPagination(result.pagination);


        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
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

        } catch { }

    };

    const createContract = async () => {

        const payload = {
            eventId: Number(form.eventId),
            status: form.status,
            totalAmount: 0//Number(form.totalAmount),
        }

        //console.log("Contract payload:", payload)



        try {

            const res = await fetch("/api/company/contracts", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    eventId: Number(form.eventId),
                    status: form.status,
                    totalAmount: 0//Number(form.totalAmount),
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
                eventId: "",
                status: "draft"
                //,
                //totalAmount: "",
            });

            fetchContracts();

        } catch {
            setError("Connection error");
        }
    };

    // fetch inicial (events)
    useEffect(() => {
        fetchEvents();
    }, []);

    // fetch contracts con search + pagination
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchContracts();
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, page]);

    function getStatusColor(status: string) {

        switch (status) {

            case "draft":
                return "#6b7280"   // gray

            case "active":
                return "#2563eb"   // blue

            case "cancelled":
                return "#dc2626"   // red

            case "completed":
                return "#16a34a"   // green

            default:
                return "#6b7280"
        }

    }
    return (
        <div>

            <PageHeader
                title="Contracts"
                buttonLabel="+ New Contract"
                onClick={() => setShowForm(true)}
            />

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by status, client, event or location"
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
                <>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {contracts.map((contract) => {

                            const progress =
                                contract.totalAmount > 0
                                    ? (contract.paidAmount / contract.totalAmount) * 100
                                    : 0

                            const statusColor = getStatusColor(contract.status)

                            return (
                                <div key={contract.id}>
                                    <ListCard
                                        title={`Contract #${contract.id}`}
                                        extra={[
                                            `Client: ${contract.client?.name}`,
                                            `Event: ${contract.event?.name}`,
                                            `Status: ${contract.status}`,
                                            `Total: $${contract.totalAmount}`,
                                            `Paid: $${contract.paidAmount}`,
                                            `Remaining: $${contract.remainingAmount}`,
                                        ]}
                                        link={`/company/contracts/${contract.id}`}
                                    />

                                    {/* Progress bar */}
                                    <div
                                        style={{
                                            background: "#e5e7eb",
                                            borderRadius: 6,
                                            height: 8,
                                            marginTop: 6,
                                            overflow: "hidden"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${progress}%`,
                                                background: statusColor,
                                                height: "100%",
                                                transition: "width 0.3s ease"
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 12,
                                            marginTop: 4,
                                            color: "#6b7280"
                                        }}
                                    >
                                        {Math.round(progress)}% paid
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* 👇 PAGINATION */}
                    {pagination && (
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

        </div>
    );
}