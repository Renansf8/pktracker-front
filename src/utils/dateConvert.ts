export const convertBrDateToUs = (brDate: string): string => {
  try {
    const [day, month, year] = brDate.split("/");

    if (!day || !month || !year) {
      throw new Error("Invalid date format. Expected DD/MM/YYYY");
    }

    const paddedDay = day.padStart(2, "0");
    const paddedMonth = month.padStart(2, "0");

    const now = new Date();
    let hours = now.getHours() + 3;

    if (hours >= 24) {
      hours = hours - 24;
    }

    const brazilianHours = hours.toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return `${year}-${paddedMonth}-${paddedDay}T${brazilianHours}:${minutes}Z`;
  } catch (error) {
    console.error("Error converting date:", error);
    return "";
  }
};

/**
 * Interpreta a data do torneio no calendário local.
 * Strings só com `YYYY-MM-DD` viram meia-noite **local** — evita o bug de
 * `new Date("2025-03-15")` (UTC) cair no dia anterior no Brasil.
 */
export function parseTournamentDateLocal(dateInput: string | number): Date {
  if (typeof dateInput === "number") {
    return new Date(dateInput);
  }
  const s = String(dateInput).trim();
  const onlyDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (onlyDate) {
    const y = Number(onlyDate[1]);
    const m = Number(onlyDate[2]);
    const d = Number(onlyDate[3]);
    return new Date(y, m - 1, d);
  }
  /** DD/MM/YYYY (sem hora) — alguns payloads usam só parte da data. */
  const brOnly = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (brOnly) {
    const d = Number(brOnly[1]);
    const m = Number(brOnly[2]);
    const y = Number(brOnly[3]);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}

/** Mesmo dia civil que `ref` (padrão: hoje), no fuso local. */
export function isSameCalendarDayLocal(
  dateInput: string | number,
  ref: Date = new Date(),
): boolean {
  const d = parseTournamentDateLocal(dateInput);
  if (Number.isNaN(d.getTime())) {
    return false;
  }
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export const convertIsoDateToBr = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year} - ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error converting ISO date:", error);
    return "";
  }
};
