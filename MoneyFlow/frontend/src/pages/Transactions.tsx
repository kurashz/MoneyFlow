import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import { Modal } from "../components/Modal";
import type { Transaction, TransactionCreate, TransactionUpdate } from "../types/transaction";
import { formatDateInput } from "../utils/dateUtils";

export const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterType, setFilterType] = useState<"income" | "expense" | undefined>();

  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    start_date: filterStartDate || undefined,
    end_date: filterEndDate || undefined,
    type: filterType,
  });

  const handleCreate = async (transaction: TransactionCreate) => {
    await createTransaction(transaction);
    setShowForm(false);
  };

  const handleUpdate = async (transaction: TransactionUpdate) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transaction);
      setEditingTransaction(null);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleResetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterType(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Транзакции</h1>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Добавить транзакцию
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingTransaction ? "Редактировать транзакцию" : "Новая транзакция"}
      >
        <TransactionForm
          onSubmit={editingTransaction ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          initialData={
            editingTransaction
              ? {
                  date: formatDateInput(editingTransaction.date),
                  type: editingTransaction.type,
                  amount: editingTransaction.amount,
                  category: editingTransaction.category,
                  description: editingTransaction.description,
                }
              : undefined
          }
        />
      </Modal>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Фильтры</h2>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Сбросить фильтры
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Начало периода
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Конец периода
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип
            </label>
            <select
              value={filterType || ""}
              onChange={(e) =>
                setFilterType(
                  e.target.value
                    ? (e.target.value as "income" | "expense")
                    : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={deleteTransaction}
        loading={loading}
      />
    </div>
  );
};

