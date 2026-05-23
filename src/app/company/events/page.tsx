"use client";

import ErrorBox from "@/app/components/ErrorBox";

import PageHeader from "@/app/components/crm/PageHeader";

import CreateForm from "@/app/components/crm/CreateForm";

import SearchBar from "@/app/components/crm/SearchBar";

import Pagination from "@/app/components/crm/Pagination";

import EventCard
  from "@/app/components/crm/events/EventCard";


import {
  useEventForm,
} from "@/app/hooks/events/useEventForm";

import {
  useEvents,
} from "@/app/hooks/events/useEvents";

import { useRouter }
  from "next/navigation";

import {
  getEventFields,
} from "@/app/components/crm/events/getEventFields";

export default function EventsPage() {

  const router = useRouter();

  /* ---------- FORM ---------- */

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

  /* ---------- EVENTS ---------- */

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

  /* ---------- FIELDS ---------- */

  const eventFields = getEventFields({
    form,
    setForm,
  });

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

      {/* CREATE */}

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

      {/* SUCCESS */}

      {createdContractId && (
        <div>
          <button
            onClick={() =>
              router.push(
                `/company/contracts/${createdContractId}/services`
              )
            }
          >
            Add services now
          </button>

          <button
            onClick={() => {
              setCreatedContractId(null);
              fetchEvents();
            }}
          >
            Go back
          </button>
        </div>
      )}

      {/* ERRORS */}

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

      {/* LOADING */}

      {loading && (
        <p>Loading events...</p>
      )}

      {/* EMPTY */}

      {!loading && events.length === 0 && (
        <p>No events found.</p>
      )}

      {/* LIST */}

      {!loading && events.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>

          {/* PAGINATION */}

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