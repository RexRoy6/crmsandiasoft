"use client";

import { useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";

import SearchBar from "@/app/components/crm/SearchBar";

import Pagination from "@/app/components/crm/Pagination";

import ErrorBox from "@/app/components/ErrorBox";

import ClientList from "./ClientList";

import ClientCreateForm from "./ClientCreateForm";

import { useClients } from "@/app/hooks/clients/useClients";


export default function ClientsModule() {
  const {
    clients,

    loading,

    error,

    search,
    setSearch,

    page,
    setPage,

    pagination,

    createClient,

    deleteClient,
  } = useClients();

  /* ---------- modal/form ---------- */

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  /* ---------- create ---------- */

  async function handleCreate() {
    if (!form.name || !form.phone) {
      return;
    }

    await createClient(form);

    setShowForm(false);

    setForm({
      name: "",
      phone: "",
      email: "",
    });
  }

  /* ---------- delete ---------- */

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Delete this client?"
    );

    if (!confirmed) return;

    await deleteClient(id);
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        buttonLabel="+ New Client"
        onClick={() => setShowForm(true)}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search clients..."
      />

      {showForm && (
        <ClientCreateForm
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {error && (
        <ErrorBox message={error} />
      )}

      {loading && (
        <p>Loading clients...</p>
      )}

      {!loading && (
        <>
          <ClientList
            clients={clients}
            onDelete={handleDelete}
          />

          <Pagination
            page={page}
            totalPages={
              pagination.totalPages
            }
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}