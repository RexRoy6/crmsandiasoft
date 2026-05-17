"use client";

import { useEffect, useState } from "react";

export default function EventSearch({
    selected,
    onSelect,
}: {
    selected?: string;
    onSelect: (event: any) => void;
}) {

    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const timeout = setTimeout(() => {

            if (!search.trim()) {
                setResults([]);
                return;
            }

            fetchEvents();

        }, 300);

        return () => clearTimeout(timeout);

    }, [search]);

    const fetchEvents = async () => {

        try {

            setLoading(true);

            const res = await fetch(
                `/api/company/events?search=${encodeURIComponent(search)}`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {
                setResults([]);
                return;
            }

            const data = await res.json();

            setResults(data.data || []);

        } catch {

            setResults([]);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div style={{ marginTop: 10 }}>

            {/* INPUT */}

            {!selected && (
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search event..."
                    style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: 6,
                        border: "1px solid var(--border-color)",
                    }}
                />
            )}

            {/* LOADING */}

            {loading && (
                <p style={{ fontSize: 12 }}>
                    Searching...
                </p>
            )}

            {/* RESULTS */}

            {!selected && results.length > 0 && (

                <div
                    style={{
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        marginTop: 6,
                        maxHeight: 250,
                        overflowY: "auto",
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                    }}
                >

                    {results.map((event) => (

                        <div
                            key={event.id}
                            onClick={() => {
                                onSelect(event);
                                setResults([]);
                                setSearch("");
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "var(--bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "transparent")
                            }
                            style={{
                                padding: 10,
                                cursor: "pointer",
                                borderBottom:
                                    "1px solid var(--border-color)",
                            }}
                        >

                            {/* EVENT NAME */}

                            <div style={{ fontWeight: 500 }}>
                                {event.name}
                            </div>

                            {/* CLIENT */}

                            <div
                                style={{
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                👤 {event.client?.name}
                            </div>

                            {/* DATE */}

                            <div
                                style={{
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                📅{" "}
                                {new Date(
                                    event.eventDate
                                ).toLocaleString()}
                            </div>

                            {/* LOCATION */}

                            {event.location && (
                                <div
                                    style={{
                                        fontSize: 12,
                                        color:
                                            "var(--text-secondary)",
                                    }}
                                >
                                    📍 {event.location}
                                </div>
                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}