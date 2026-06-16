"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Contract {
  id: number;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  client: {
    id: number;
    name: string;
  };
  event: {
    id: number;
    name: string;
    eventDate: string;
    location?: string;
  };
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  location?: string;
}

export default function GoogleLikeCalendar() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  const styles = getThemeStyles(isDark);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/company/contracts", {
        credentials: "include",
      });

      if (!res.ok) return;
      const result = await res.json();

      setContracts(result.data);
    } catch {
      console.error("contracts error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (!Array.isArray(contracts) || contracts.length === 0) return;

    const mapped: CalendarEvent[] = contracts.map((contract) => ({
      id: contract.id,
      title: contract.event.name,
      date: new Date(contract.event.eventDate),
      status: contract.status,
      location: contract.event.location,
    }));

    setCalendarEvents(mapped);
  }, [contracts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEvents = (day: number) => {
    return calendarEvents.filter(
      (e) =>
        e.date.getDate() === day &&
        e.date.getMonth() === month &&
        e.date.getFullYear() === year,
    );
  };

  const getColor = (status: string) => {
    switch (status) {
      case "active":
        return "#2563eb";
      case "completed":
        return "#16a34a";
      case "cancelled":
        return "#dc2626";
      default:
        return "#9ca3af";
    }
  };

  const getSoftColor = (status: string) => {
    switch (status) {
      case "active":
        return "rgba(37, 99, 235, 0.12)";
      case "completed":
        return "rgba(22, 163, 74, 0.12)";
      case "cancelled":
        return "rgba(220, 38, 38, 0.12)";
      default:
        return "rgba(156, 163, 175, 0.12)";
    }
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.nav}>
          <button onClick={prevMonth} style={styles.navBtn}>
            ◀
          </button>
          <button onClick={nextMonth} style={styles.navBtn}>
            ▶
          </button>
          <h2 style={styles.title}>
            {currentDate.toLocaleString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>

        <button
          style={styles.todayBtn}
          onClick={() => setCurrentDate(new Date())}
        >
          Hoy
        </button>
      </div>

      <div style={styles.grid}>
        {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((d) => (
          <div key={d} style={styles.dayHeader}>
            {d}
          </div>
        ))}

        {days.map((day, i) => (
          <div key={i} style={styles.cell}>
            {day && (
              <>
                <div style={styles.dayNumber}>{day}</div>

                <div style={styles.events}>
                  {getEvents(day).map((e) => (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/company/contracts/${e.id}`)}
                      style={{
                        ...styles.event,
                        backgroundColor: getSoftColor(e.status),
                        borderLeft: `4px solid ${getColor(e.status)}`,
                      }}
                    >
                      <div style={styles.eventTitle}>{e.title}</div>
                      {e.location && (
                        <div style={styles.eventSub}>{e.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {loading && <p>Cargando...</p>}
    </div>
  );
}

const getThemeStyles = (
  isDark: boolean,
): Record<string, React.CSSProperties> => ({
  container: {
    padding: 20,
    fontFamily: "Arial",
    background: isDark ? "#0f172a" : "#f5f7fb",
    color: isDark ? "#e5e7eb" : "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  nav: { display: "flex", alignItems: "center", gap: 10 },
  navBtn: {
    border: "none",
    background: isDark ? "#1f2933" : "white",
    color: isDark ? "#e5e7eb" : "#111",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  title: { fontSize: 18, fontWeight: 600 },
  todayBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: isDark ? "#1f2933" : "white",
    color: isDark ? "#e5e7eb" : "#111",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    background: isDark ? "#020617" : "white",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  dayHeader: {
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    background: isDark ? "#1e293b" : "#f1f5f9",
    fontSize: 12,
  },
  cell: {
    minHeight: 110,
    border: isDark ? "1px solid #1e293b" : "1px solid #f1f1f1",
    padding: 6,
    background: isDark ? "#020617" : "white",
  },
  dayNumber: {
    fontSize: 12,
    marginBottom: 4,
    color: isDark ? "#94a3b8" : "#6b7280",
  },
  events: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  event: {
    padding: "4px 6px",
    borderRadius: 6,
    cursor: "pointer",
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: 600,
  },
  eventSub: {
    fontSize: 10,
    color: isDark ? "#94a3b8" : "#6b7280",
  },
});
