/**
 * Formats a Date object as a local YYYY-MM-DD string.
 * This avoids the timezone shift issue inherent in .toISOString().
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current today's date in local YYYY-MM-DD format.
 */
export const getTodayLocalDate = (): string => {
  return formatLocalDate(new Date());
};
