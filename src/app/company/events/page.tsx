"use client";

import { useEffect, useState } from "react";

import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import type { Field } from "@/app/components/crm/CreateForm";

import ClientSelector
  from "@/app/components/crm/clients/ClientSelector";

import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";

import { useRouter } from "next/navigation";

import {
  formatDate,
  formatTime,
} from "@/lib/utils/date";

import {
  useEventForm,
} from "@/app/hooks/events/useEventForm";
import {
  useEvents,
} from "@/app/hooks/events/useEvents";


export default function EventsPage() {

  const router = useRouter();

  /* ---------- FORM HOOK ---------- */

  const {
    form,
    setForm,

    showForm,
    setShowForm,

    createdContractId,
    setCreatedContractId,

    createEvent,
    resetForm,

    error,
    errorCode,

  } = useEventForm();


  const {
    events,
    loading,

    error: eventsError,
    errorCode: eventsErrorCode,

    search,
    setSearch,

    page,
    setPage,

    pagination,

    fetchEvents,
  } = useEvents();

  /* ---------- FORM FIELDS ---------- */

  const eventFields: Field[] = [
    {
      name: "clientId",

      label: "Client",

      readOnly: true,

      after: (
        <ClientSelector
          selected={form.client}

          onSelect={(client) => {
            setForm((prev) => ({
              ...prev,

              clientId: String(client.id),

              client: {
                id: client.id,
                name: client.name,
                phone: client.phone,
              },
            }));
          }}

          onClear={() => {
            setForm((prev) => ({
              ...prev,

              clientId: "",

              client: undefined,
            }));
          }}
        />
      ),
    },

    {
      name: "name",
      label: "Event Name",
    },

    {
      name: "eventDate",

      label: "Event Date",

      type: "date",

      after: (
        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          {form.eventDate
            ? `📅 Fecha seleccionada: ${formatDate(form.eventDate)}`
            : "📅 Selecciona una fecha"}
        </p>
      ),
    },

    {
      name: "eventTime",
      label: "Event Time",
      type: "time",
    },

    {
      name: "location",
      label: "Location",
    },

    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];


  /* ---------- UI ---------- */

  return (
    <div>

      <PageHeader
        title="Events"
        buttonLabel="+ New Event"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search events, clients or location"
      />

      {/* ---------- CREATE FORM ---------- */}

      {showForm && (
        <CreateForm
          title="Create Event"

          fields={eventFields}

          form={form}

          setForm={setForm}

          onSubmit={createEvent}

          onCancel={() => {
            resetForm();
            setShowForm(false);
          }}
        />
      )}

      {/* ---------- SUCCESS ---------- */}

      {createdContractId && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
          }}
        >
          <p style={{ marginBottom: 10 }}>
            ✔ Event created
          </p>

          <p style={{ marginBottom: 16 }}>
            ✔ Contract created
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={() =>
                router.push(
                  `/company/contracts/${createdContractId}/services`
                )
              }
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Add services now
            </button>

            <button
              onClick={() => {
                setCreatedContractId(null);
                fetchEvents();
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Go back to events
            </button>
          </div>
        </div>
      )}

      {/* ---------- ERROR ---------- */}

      {eventsError && (
        <ErrorBox
          message={eventsError}
          code={eventsErrorCode}
        />
      )}

      {error && (
        <ErrorBox
          message={error}
          code={errorCode}
        />
      )}

      {/* ---------- LOADING ---------- */}

      {loading && (
        <p>Loading events...</p>
      )}

      {/* ---------- EMPTY ---------- */}

      {!loading && events.length === 0 && (
        <p>No events found.</p>
      )}

      {/* ---------- LIST ---------- */}

      {!loading && events.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {events.map((event) => {

              const contract =
                event.contract;

              return (
                <ListCard
                  key={event.id}

                  title={event.name}

                  subtitle={event.client?.name}

                  content={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >

                      {/* DATE */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Date
                        </span>

                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--text-primary)",
                          }}
                        >
                          {formatDate(event.eventDate)}
                          {" · "}
                          {formatTime(event.eventDate)}
                        </span>
                      </div>

                      {/* LOCATION */}

                      {event.location && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Location
                          </span>

                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--text-primary)",
                            }}
                          >
                            {event.location}
                          </span>
                        </div>
                      )}

                      {/* NOTES */}

                      {event.notes && (
                        <div
                          style={{
                            marginTop: 4,
                            padding: "8px 10px",
                            background: "var(--bg-secondary)",
                            borderRadius: 8,
                            border:
                              "1px solid var(--bg-secondary)",
                            fontSize: 12,
                            color: "var(--text-primary)",
                          }}
                        >
                          {event.notes}
                        </div>
                      )}
                    </div>
                  }

                  actions={[
                    ...(contract
                      ? [
                        {
                          label: "View Contract",

                          onClick: () =>
                            router.push(
                              `/company/contracts/${contract.id}/services`
                            ),
                        },
                      ]
                      : []),

                    {
                      label: "Manage →",

                      onClick: () =>
                        router.push(
                          `/company/clients/${event.client.id}/events/${event.id}`
                        ),
                    },
                  ]}
                />
              );
            })}
          </div>

          {/* ---------- PAGINATION ---------- */}

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