export const formatDate = (value: string | Date) => {
  const date = new Date(value);
  if (!value) return "";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (value: string | Date) => {
  const date = new Date(value);

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
