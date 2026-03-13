"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorBox from "@/app/components/ErrorBox";
import DetailCard from "@/app/components/crm/DetailCard";

export default function ContractDetailPage() {

  const params = useParams();
  const router = useRouter();

  const contractId = params.contractId;

  const [contract, setContract] = useState<any>(null);

  const [form, setForm] = useState({
    status: "",
    totalAmount: "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const contractFields = [
    { name: "status", label: "Status" },
    { name: "totalAmount", label: "Total Amount", type: "number" },
  ];

  /* ---------- FETCH ---------- */

  const fetchContract = async () => {

    try {

      setLoading(true);

      const res = await fetch(`/api/company/contracts/${contractId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch contract");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setContract(data);

      setForm({
        status: data.status ?? "",
        totalAmount: data.totalAmount ?? "",
      });

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UPDATE ---------- */

  const updateContract = async () => {

    try {

      setSaving(true);
      setError("");

      const res = await fetch(`/api/company/contracts/${contractId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: form.status,
          totalAmount: Number(form.totalAmount),
        }),
      });

      if (!res.ok) {

        const data = await res.json();

        if (data?.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors)
            .flat()
            .join(", ");

          setError(messages);
        } else {
          setError("Update failed");
        }

        return;
      }

      await fetchContract();

      setEditing(false);

    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- DELETE ---------- */

  const deleteContract = async () => {

    if (!confirm("Delete this contract?")) return;

    try {

      const res = await fetch(`/api/company/contracts/${contractId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Delete failed");
        return;
      }

      router.push("/company/contracts");

    } catch {
      setError("Connection error");
    }
  };

  /* ---------- REACTIVATE ---------- */

  const reactivateContract = async () => {

    try {

      const res = await fetch(
        `/api/company/contracts/${contractId}?reactivate=true`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Reactivate failed");
        return;
      }

      await fetchContract();

    } catch {
      setError("Connection error");
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  return (
    <div>

      <h1>Contract Details</h1>

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading...</p>}

      {contract && (

        <DetailCard
          title={`Contract #${contract.id}`}
          fields={contractFields}
          data={contract}
          form={form}
          setForm={setForm}
          editing={editing}
          setEditing={setEditing}
          saving={saving}
          onSave={updateContract}
          onDelete={deleteContract}
          actions={[
  {
    label: "View Services",
    href: `/company/contracts/${contractId}/services`,
  },
  {
    label: "View Payments",
    href: `/company/contracts/${contractId}/payments`,
  },
  ...(contract.deletedAt
    ? [
        {
          label: "Reactivate",
          onClick: reactivateContract,
        },
      ]
    : []),
]}
        />

      )}

    </div>
  );
}