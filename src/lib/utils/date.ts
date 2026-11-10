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
    return "Invalid deadline."
  }

  // Calculate base times in milliseconds.
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  // Calculate the time left until the deadline.
  const timeDiff = date.getTime() - Date.now();

  // Calculate the absolute time difference for overdue deadlines.
  const absTimeDiff = Math.abs(timeDiff);

  // If deadline has passed, display in overdue format.
  if (timeDiff <= 0) {
    if (absTimeDiff < minute) return `Just overdue`;
    if (absTimeDiff < hour) {
      const minOverdue = Math.ceil(absTimeDiff / minute);
      return `Overdue by ${minOverdue} min${minOverdue === 1 ? '' : 's'}`;
    }
    if (absTimeDiff < day) {
      const hoursOverdue = Math.ceil(absTimeDiff / hour);
      return `Overdue by ${hoursOverdue} hour${hoursOverdue === 1 ? '' : 's'}`;
    }
      
    const daysOverdue = Math.ceil(absTimeDiff / day);
    return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
  }
  
  // If time left is 3 days or less, display in phrase format.
  if (timeDiff < minute) return 'Due now';
  if (timeDiff < hour) {
    const minLeft = Math.ceil(timeDiff / minute);
    return `${minLeft} min${minLeft === 1 ? '' : 's'} left`;
  } 
  if (timeDiff < day) {
    const hoursLeft = Math.ceil(timeDiff / hour);
    return `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left`;
  } 
  if (timeDiff <= day * 3) {
    const daysLeft = Math.ceil(timeDiff / day);
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
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

export { formatDeadline };