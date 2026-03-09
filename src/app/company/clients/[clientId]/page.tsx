"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorBox from "@/app/components/ErrorBox";
import DetailCard from "@/app/components/crm/DetailCard";
import Link from "next/link";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params.clientId;

  const [client, setClient] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const clientFields = [
    { name: "name", label: "Name" },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email" },
  ];

  const fetchClient = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/company/clients/${clientId}`, {
        credentials: "include",
      });

      const data = await res.json();

      setClient(data);

      setForm({
        name: data.name,
        phone: data.phone,
        email: data.email,
      });
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async () => {
    try {
      setSaving(true);

      await fetch(`/api/company/clients/${clientId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await fetchClient();

      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async () => {
    await fetch(`/api/company/clients/${clientId}`, {
      method: "DELETE",
      credentials: "include",
    });

    router.push("/company/clients");
  };

  useEffect(() => {
    fetchClient();
  }, []);

  return (
    <div>
      <h1>Client Details</h1>

      {error && <ErrorBox message={error} />}

      {loading && <p>Loading...</p>}

      {client && (

        <DetailCard
          title={client.name}
          fields={clientFields}
          data={client}
          form={form}
          setForm={setForm}
          editing={editing}
          setEditing={setEditing}
          saving={saving}
          onSave={updateClient}
          onDelete={deleteClient}
          actions={[
            {
              label: "View Events",
              href: `/company/clients/${clientId}/events`,
            },
          ]}
        />
      )}
    </div>
  );
}