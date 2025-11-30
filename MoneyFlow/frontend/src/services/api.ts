import axios from "axios";
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  StatisticsResponse,
} from "../types/transaction";

// Определяем базовый URL для API
// Пробуем использовать прокси Vite, если не работает - используем прямой URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 секунд таймаут
});

// Добавляем обработчик ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Ошибка сети: Backend сервер не запущен или недоступен");
      console.error("Убедитесь, что backend запущен на http://localhost:8000");
    }
    return Promise.reject(error);
  }
);

// Transactions API
export const transactionsApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    type?: "income" | "expense";
  }): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>("/transactions", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: TransactionCreate): Promise<Transaction> => {
    const response = await api.post<Transaction>("/transactions", transaction);
    return response.data;
  },

  update: async (
    id: number,
    transaction: TransactionUpdate
  ): Promise<Transaction> => {
    const response = await api.put<Transaction>(
      `/transactions/${id}`,
      transaction
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

// Statistics API
export const statisticsApi = {
  getByPeriod: async (
    startDate: string,
    endDate: string
  ): Promise<StatisticsResponse> => {
    const response = await api.get<StatisticsResponse>("/statistics/period", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getDaily: async (date: string): Promise<StatisticsResponse> => {
    const response = await api.get<StatisticsResponse>("/statistics/daily", {
      params: { date },
    });
    return response.data;
  },

  getWeekly: async (date: string): Promise<StatisticsResponse> => {
    const response = await api.get<StatisticsResponse>("/statistics/weekly", {
      params: { date },
    });
    return response.data;
  },

  getMonthly: async (date: string): Promise<StatisticsResponse> => {
    const response = await api.get<StatisticsResponse>("/statistics/monthly", {
      params: { date },
    });
    return response.data;
  },

  getSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<StatisticsResponse> => {
    const response = await api.get<StatisticsResponse>("/statistics/summary", {
      params: {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      },
    });
    return response.data;
  },
};

