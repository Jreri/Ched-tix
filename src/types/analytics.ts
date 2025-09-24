
export interface AnalyticsDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

export interface CategoryDataPoint {
  name: string;
  tickets: number;
  revenue: number;
  events: number;
}

export interface DemographicDataPoint {
  name: string;
  value: number;
  percentage: number;
}

export interface TicketTypeDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface EventPerformance {
  id: string;
  title: string;
  date: string;
  price: number;
  soldTickets: number;
  capacity: number;
  percentageSold: number;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  category?: string;
}

export type TimeRange = "7days" | "30days" | "3months" | "12months" | "custom";
