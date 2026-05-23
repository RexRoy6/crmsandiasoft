"use client";

import { useState } from "react";

import { createEvent } from "@/lib/api/events";
import { createContract } from "@/lib/api/contracts";

export interface EventFormClient {
  id: number;
  name: string;
  phone: string;
}

export interface EventFormState {
  clientId: string;

  client?: EventFormClient;

  name: string;

  eventDate: string;

  eventTime: string;

  location: string;

  notes: string;
}

const initialForm: EventFormState = {
  clientId: "",

  client: undefined,

  name: "",

  eventDate: "",

  eventTime: "",

  location: "",

  notes: "",
};

export function useEventForm() {
  const [form, setForm] =
    useState<EventFormState>(initialForm);

  const [showForm, setShowForm] =
    useState(false);

  const [createdContractId, setCreatedContractId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  /* ---------- RESET ---------- */

  const resetForm = () => {
    setForm(initialForm);
  };

  /* ---------- CREATE EVENT ---------- */

  const handleCreateEvent = async () => {
    try {
      setLoading(true);

      setError("");
      setErrorCode(undefined);

      /* ---------- DATETIME ---------- */

      const dateTime = new Date(
        `${form.eventDate}T${form.eventTime}`
      );

      const pad = (n: number) =>
        String(n).padStart(2, "0");

      const formatted = `${dateTime.getFullYear()}-${pad(
        dateTime.getMonth() + 1
      )}-${pad(dateTime.getDate())} ${pad(
        dateTime.getHours()
      )}:${pad(dateTime.getMinutes())}:00`;

      /* ---------- CREATE EVENT ---------- */

      const event = await createEvent({
        clientId: Number(form.clientId),

        name: form.name,

        eventDate: formatted,

        location: form.location,

        notes: form.notes,
      });

      /* ---------- CREATE CONTRACT ---------- */

      const contract = await createContract({
        eventId: event.id,

        status: "draft",

        totalAmount: 0,
      });

      /* ---------- SUCCESS ---------- */

      setCreatedContractId(contract.id);

      setShowForm(false);

      resetForm();

    } catch (err: any) {
      setError(
        err?.message || "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,

    showForm,
    setShowForm,

    createdContractId,
    setCreatedContractId,

    loading,

    createEvent: handleCreateEvent,

    resetForm,

    error,
    errorCode,
  };
}