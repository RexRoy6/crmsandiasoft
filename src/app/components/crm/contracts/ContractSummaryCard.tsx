"use client";

import { formatDateTime }
from "@/lib/utils/date";

type Props = {
    contract: any;
};

export default function ContractSummaryCard({
    contract,
}: Props) {

    if (!contract) return null;

    const isDraft =
        contract.status === "draft";

    return (

        <div
            style={{
                marginBottom: 20,
                padding: 16,
                border:
                    "1px solid var(--border-color)",
                borderRadius: 10,
                background:
                    "var(--card-bg)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                }}
            >

                <h2 style={{ margin: 0 }}>
                    Contract #{contract.id}
                </h2>

                <span
                    style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,

                        background: isDraft
                            ? "#f59e0b22"
                            : "#16a34a22",

                        color: isDraft
                            ? "#fbbf24"
                            : "#4ade80",
                    }}
                >
                    {contract.status}
                </span>

            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 14,
                }}
            >

                <div>
                    <strong>Client:</strong>{" "}
                    {contract.client?.name}
                </div>

                <div>
                    <strong>Event:</strong>{" "}
                    {contract.event?.name}
                </div>

                <div>
                    <strong>Date:</strong>{" "}
                    {formatDateTime(
                        contract.event?.eventDate
                    )}
                </div>

                <div>
                    <strong>Location:</strong>{" "}
                    {contract.event?.location || "-"}
                </div>

                <div>
                    <strong>Total:</strong>{" "}
                    $
                    {Number(
                        contract.totalAmount || 0
                    ).toFixed(2)}
                </div>

            </div>

        </div>
    );
}