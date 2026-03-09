"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import Link from "next/link";

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

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/company/clients", {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch clients");
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

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Clients</h1>

        <button onClick={() => setShowForm(true)}>
          + New Client
        </button>
      </div>

      {/* CREATE FORM */}

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

          <h3>Create Client</h3>

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <br />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <br />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <br />

          <button onClick={createClient}>
            Create
          </button>

          <button onClick={() => setShowForm(false)}>
            Cancel
          </button>

        </div>
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

            <div
              key={client.id}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >

              <strong>{client.name}</strong>

              <p>Phone: {client.phone}</p>

              <p>Email: {client.email}</p>

              <Link href={`/company/clients/${client.id}`}>
                <button>Manage</button>
              </Link>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}