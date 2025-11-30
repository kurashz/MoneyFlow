import { useState } from "react";
import type { Transaction } from "../types/transaction";
import { formatDate, formatCurrency } from "../utils/dateUtils";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

export const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  loading,
}: TransactionListProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      setDeletingId(id);
      try {
        onDelete && (await onDelete(id));
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Загрузка...</div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Транзакции не найдены
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === "income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type === "income" ? "Доход" : "Расход"}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </span>
                {transaction.category && (
                  <span className="text-sm text-gray-600">
                    {transaction.category}
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold">
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
              {transaction.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {transaction.description}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Редактировать
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  {deletingId === transaction.id ? "Удаление..." : "Удалить"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};



