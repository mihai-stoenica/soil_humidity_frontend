export const formatTime = (isoString: string) => {
  const utcString = isoString.endsWith("Z") ? isoString : isoString + "Z";

  const date = new Date(utcString);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
