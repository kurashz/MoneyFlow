import { useState, useEffect } from "react";
import { transactionsApi } from "../services/api";
import type { Transaction, TransactionCreate, TransactionUpdate } from "../types/transaction";

export const useTransactions = (params?: {
  start_date?: string;
  end_date?: string;
  type?: "income" | "expense";
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionsApi.getAll(params);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки транзакций");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.start_date, params?.end_date, params?.type]);

  const createTransaction = async (transaction: TransactionCreate) => {
    try {
      const newTransaction = await transactionsApi.create(transaction);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaction = async (id: number, transaction: TransactionUpdate) => {
    try {
      const updated = await transactionsApi.update(id, transaction);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await transactionsApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};



