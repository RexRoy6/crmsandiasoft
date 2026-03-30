"use client";

import { useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";

export default function ChangePasswordForm({
    onSuccess,
}: {
    onSuccess?: (message: string) => void;
}) {

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        try {
            setError("");
            setSuccess("");

            if (!form.currentPassword || !form.newPassword) {
                setError("All fields are required");
                return;
            }

            setLoading(true);

            const res = await fetch("/api/auth/change-password", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to change password");
                setErrorCode(res.status);
                return;
            }

            const message = data.message || "Password updated successfully";

            setSuccess(message);

            // reset form
            setForm({
                currentPassword: "",
                newPassword: "",
            });

            // callback opcional
            onSuccess?.(message);

        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <h3>Change Password</h3>

            {error && <ErrorBox message={error} code={errorCode} />}

            {success && (
                <div
                    style={{
                        background: "#e6ffed",
                        color: "#067d3f",
                        padding: 12,
                        borderRadius: 8,
                    }}
                >
                    {success}
                </div>
            )}

            <input
                type="password"
                placeholder="Current password"
                value={form.currentPassword}
                onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                }
            />

            <input
                type="password"
                placeholder="New password"
                value={form.newPassword}
                onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                }
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                }}
            >
                {loading ? "Updating..." : "Update Password"}
            </button>
        </div>
    );
}