export interface EventItem {
  id: string;
  title: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  icon: string;
  startTime?: string | null;
  endTime?: string | null;
  repeat?: string | null;
  seriesId?: string | null;
}