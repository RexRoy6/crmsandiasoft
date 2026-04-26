export const formatDate = (value: string | Date) => {
  if (typeof value === "string") {
    // 🔥 manejar ISO (con T)
    const datePart = value.includes("T")
      ? value.split("T")[0]
      : value.split(" ")[0];

    if (datePart.includes("-")) {
      const [year, month, day] = datePart.split("-").map(Number);

      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }
  }

  const date = new Date(value);

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (value: string | Date) => {
  if (typeof value === "string") {
    // ISO → split por T
    if (value.includes("T")) {
      const timePart = value.split("T")[1]; // "02:35:00.000Z"
      const [hours, minutes] = timePart.split(":");

      return `${hours}:${minutes}`;
    }

    // formato con espacio
    if (value.includes(" ")) {
      const timePart = value.split(" ")[1];
      const [hours, minutes] = timePart.split(":");

      return `${hours}:${minutes}`;
    }
  }

  const date = new Date(value);

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};