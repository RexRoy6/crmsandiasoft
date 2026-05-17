export const formatDate = (
  value: string | Date
) => {

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString(
    "es-MX",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )
}

export const formatTime = (
  value: string | Date
) => {

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleTimeString(
    "es-MX",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  )
}

export const formatDateTime = (
  value: string | Date
) => {
  return `${formatDate(value)} ${formatTime(value)}`;
};

export const toISODate = (
  value?: string | Date
) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};
export const toISOTime = (
  value?: string | Date
) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().split("T")[1];
};
export const toLocalInput = (
  iso?: string | Date
) => {
  if (!iso) return "";

  const date = new Date(iso);

  if (isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60000
  );

  return local.toISOString().slice(0, 16);
};

export const combineDateTime = (
  baseDate?: string | Date,
  time?: string
) => {
  if (!baseDate || !time) {
    return undefined;
  }

  const date = new Date(baseDate);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  const [hours, minutes] = time.split(":");

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString();
};