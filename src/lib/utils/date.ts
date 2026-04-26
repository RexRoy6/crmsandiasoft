export const formatDate = (value: string | Date) => {
    if (typeof value === "string" && value.includes("-")) {
        const [year, month, day] = value.split("-").map(Number);

        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }

    const date = new Date(value);

    return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// export const formatTime = (value: string | Date) => {
//   const date = new Date(value);

//   return date.toLocaleTimeString("es-MX", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
export const formatTime = (value: string | Date) => {
    if (typeof value === "string" && value.includes(" ")) {
        // formato: "YYYY-MM-DD HH:mm:ss"
        const timePart = value.split(" ")[1]; // "18:00:00"
        const [hours, minutes] = timePart.split(":");

        return `${hours}:${minutes}`;
    }

    const date = new Date(value);

    return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};