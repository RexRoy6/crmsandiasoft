"use client";

import { useEffect, useState } from "react";

import type {
  EventListItem,
  EventsResponse,
  EventPagination,
} from "@/types/event";

export function useEvents() {
  const [events, setEvents] =
  useState<EventListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<EventPagination | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/events?search=${search}&page=${page}&limit=8`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Failed to fetch events");
        setErrorCode(res.status);
        return;
      }

      const result: EventsResponse = await res.json();

      setEvents(result.data);
      setPagination(result.pagination);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  return {
    events,
    loading,

    error,
    errorCode,

    search,
    setSearch,

    page,
    setPage,

    pagination,

    fetchEvents,
  };
}