export const ymd = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/**
 * Calculate the "billing period" (21st to 20th) that contains the given date.
 * The billing period runs from the 21st of one month to the 20th of the next month.
 */
export const getBillingPeriodForDate = (date: Date): { dateDebut: string; dateFin: string } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if (day >= 21) {
    // Period: current month 21st to next month 20th
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return {
      dateDebut: ymd(year, month, 21),
      dateFin: ymd(nextYear, nextMonth, 20),
    };
  } else {
    // Period: previous month 21st to current month 20th
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return {
      dateDebut: ymd(prevYear, prevMonth, 21),
      dateFin: ymd(year, month, 20),
    };
  }
};

/**
 * Get the default date range: the billing period containing the date
 * 2 months ago from today. This is used as the default when no user
 * preference is stored in localStorage.
 */
export const getDefaultTwoMonthsAgoRange = (): { dateDebut: string; dateFin: string } => {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
  return getBillingPeriodForDate(twoMonthsAgo);
};

/** LocalStorage key suffix for timestamp storage. */
const TIMESTAMP_SUFFIX = "_ts";

/** Milliseconds in 3 days. */
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Save data to localStorage with a timestamp.
 * The data will expire after 3 days.
 */
export const saveWithTimestamp = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(key + TIMESTAMP_SUFFIX, String(Date.now()));
  } catch {
    // Ignore quota errors, etc.
  }
};

/**
 * Load data from localStorage if it's not older than 3 days.
 * Returns null if data doesn't exist, is invalid, or has expired.
 */
export const loadWithTimestamp = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    const tsRaw = localStorage.getItem(key + TIMESTAMP_SUFFIX);
    if (!raw || !tsRaw) return null;
    const timestamp = parseInt(tsRaw, 10);
    if (Number.isNaN(timestamp)) return null;
    if (Date.now() - timestamp > THREE_DAYS_MS) {
      // Expired: clean up
      localStorage.removeItem(key);
      localStorage.removeItem(key + TIMESTAMP_SUFFIX);
      return null;
    }
    return JSON.parse(raw);
  } catch {
    // Clean up corrupted data
    localStorage.removeItem(key);
    localStorage.removeItem(key + TIMESTAMP_SUFFIX);
    return null;
  }
};