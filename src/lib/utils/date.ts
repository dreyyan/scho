import { MINUTE, HOUR, DAY } from "../constants/date";

/**
 * Formats a deadline into a user-friendly date or relative time.
 *
 * @param deadline The deadline in string format.
 * @returns The user-appropriate formatted deadline.
 */
function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "No deadline.";

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return "Invalid deadline.";
  }

  // Calculate the time left until the deadline.
  const timeDiff = date.getTime() - Date.now();

  // Calculate the absolute time difference for overdue deadlines.
  const absTimeDiff = Math.abs(timeDiff);

  // If deadline has passed, display in overdue format.
  if (timeDiff <= 0) {
    if (absTimeDiff < MINUTE) return `Just overdue`;
    if (absTimeDiff < HOUR) {
      const minOverdue = Math.ceil(absTimeDiff / MINUTE);
      return `Overdue by ${minOverdue} min${minOverdue === 1 ? "" : "s"}`;
    }
    if (absTimeDiff < DAY) {
      const hoursOverdue = Math.ceil(absTimeDiff / HOUR);
      return `Overdue by ${hoursOverdue} hour${hoursOverdue === 1 ? "" : "s"}`;
    }

    const daysOverdue = Math.ceil(absTimeDiff / DAY);
    return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? "" : "s"}`;
  }

  // If time left is 3 days or less, display in phrase format.
  if (timeDiff < MINUTE) return "Due now";
  if (timeDiff < HOUR) {
    const minLeft = Math.ceil(timeDiff / MINUTE);
    return `${minLeft} min${minLeft === 1 ? "" : "s"} left`;
  }
  if (timeDiff < DAY) {
    const hoursLeft = Math.ceil(timeDiff / HOUR);
    return `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} left`;
  }
  if (timeDiff <= DAY * 3) {
    const daysLeft = Math.ceil(timeDiff / DAY);
    return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  }

  // Else, display in full date and time format.
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Convert deadline to local DateTime.
 *
 * @param deadline The deadline in string format.
 * @returns The deadline in local DateTime.
 */
const toDateTimeLocal = (deadline: string): string => {
  const date = new Date(deadline);

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
};

export { formatDeadline, toDateTimeLocal };
