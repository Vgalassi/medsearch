export function formatDay(value: string, lenght: "short" | "long" | "narrow" | undefined) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: lenght,
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}