"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
    { name: "email", label: "Email" },
  ];

  //campos para serach y params
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  //

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/clients?search=${search}&page=${page}&limit=${limit}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        setError("Failed to fetch clients");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setClients(data.data);
      setPagination(data.pagination);
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

  //  RESET PAGE cuando cambia búsqueda
  useEffect(() => {
    setPage(1);
  }, [search]);

  //  FETCH (con debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  return (
    <div>
      <PageHeader
        title="Clients"
        buttonLabel="+ New Client"
        onClick={() => setShowForm(true)}
      />
      <SearchBar
        value={search}
        onChange={(value) => {
          setPage(1); // reset page
          setSearch(value);
        }}
        placeholder="Search clients..."
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

      {!loading && clients.length === 0 && <p>No clients found.</p>}

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
              content={
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                      }}
                    >
                      <span
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        Email:
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {client.email}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                      }}
                    >
                      <span
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        Phone:
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {client.phone}
                      </span>
                    </div>
                  </div>
                </>
              }
              actions={[
                {
                  label: "Manage →",
                  onClick: () => router.push(`/company/clients/${client.id}`),
                },
              ]}
            />
          ))}
          {/* pagination */}
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
          {/* pagination */}
        </div>
      )}
    </div>
  );
}
