export interface SalesDay {
  date: string; // ISO yyyy-mm-dd
  revenue: number;
  orders: number;
}

export interface SalesSummary {
  days: SalesDay[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  /** revenue change vs the previous period of the same length, as a fraction */
  changeVsPrevious: number;
}

export type CustomerTier = "gold" | "silver" | "bronze";

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: CustomerTier;
  visits: number;
  lifetimeSpend: number;
  lastVisit: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  error: string;
}
