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
