export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  created_at: string;
}

export interface TransactionCreate {
  date: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
}

export interface TransactionUpdate {
  date?: string;
  type?: TransactionType;
  amount?: number;
  category?: string | null;
  description?: string | null;
}

export interface DailyStatistics {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface StatisticsResponse {
  period_start: string;
  period_end: string;
  total_income: number;
  total_expense: number;
  balance: number;
  daily_statistics: DailyStatistics[];
}


