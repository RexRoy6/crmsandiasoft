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
}

export default function GoogleLikeCalendar() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/company/contracts", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setContracts(data);
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
    if (!contracts.length) return;

    const mapped: CalendarEvent[] = contracts.map((contract) => ({
      id: contract.id,
      title: `${contract.event.name} (${contract.client.name})`,
      date: new Date(contract.event.eventDate),
      status: contract.status,
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
      case "draft":
        return "#6b7280";
      case "active":
        return "#2563eb";
      case "cancelled":
        return "#dc2626";
      case "completed":
        return "#16a34a";
      default:
        return "#6b7280";
    }
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.leftHeader}>
          <button onClick={prevMonth}>◀</button>
          <button onClick={nextMonth}>▶</button>
          <h2 style={{ marginLeft: 10 }}>
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
                        backgroundColor: getColor(e.status),
                        cursor: "pointer",
                      }}
                    >
                      {e.title}
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

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 20, fontFamily: "Arial" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  leftHeader: { display: "flex", alignItems: "center", gap: 5 },
  todayBtn: { padding: "6px 12px", border: "1px solid #ccc" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    border: "1px solid #ddd",
  },
  dayHeader: {
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    background: "#f8f9fa",
  },
  cell: {
    height: 120,
    border: "1px solid #eee",
    padding: 4,
  },
  dayNumber: { fontSize: 12 },
  events: { display: "flex", flexDirection: "column", gap: 2 },
  event: {
    fontSize: 11,
    color: "white",
    padding: "2px 4px",
    borderRadius: 4,
  },
};
