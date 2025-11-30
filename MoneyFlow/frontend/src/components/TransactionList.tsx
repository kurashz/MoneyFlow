import { useState } from "react";
import type { Transaction } from "../types/transaction";
import { formatDate, formatCurrency } from "../utils/dateUtils";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

// Функция для получения цвета карточки на основе типа и категории
const getCardColorClasses = (transaction: Transaction): string => {
  // Корректировки - серый цвет
  if (transaction.type === "adjustment") {
    return "bg-gray-100 border-gray-300";
  }
  
  // Доходы - зеленый цвет
  if (transaction.type === "income") {
    return "bg-green-50 border-green-200";
  }
  
  // Расходы - цвет по категории
  if (transaction.type === "expense" && transaction.category) {
    const categoryColors: Record<string, string> = {
      "Еда": "bg-orange-100 border-orange-300",
      "Быт": "bg-red-50 border-red-200",
      "Непредвиденное": "bg-purple-50 border-purple-200",
      "Машина": "bg-blue-100 border-blue-600",
      "Подарки": "bg-pink-50 border-pink-200",
      "Развлечения": "bg-cyan-50 border-cyan-200",
      "Долг": "bg-gray-50 border-gray-200",
    };
    
    return categoryColors[transaction.category] || "bg-white border-gray-200";
  }
  
  // Дефолтный цвет для расходов без категории
  return "bg-white border-gray-200";
};

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
          className={`${getCardColorClasses(transaction)} border rounded-lg p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {transaction.type === "adjustment" ? (
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : null}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === "adjustment"
                      ? "bg-gray-200 text-gray-700"
                      : transaction.type === "income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type === "adjustment"
                    ? "Корректировка"
                    : transaction.type === "income"
                    ? "Доход"
                    : "Расход"}
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
                {transaction.type === "adjustment" 
                  ? (transaction.amount >= 0 ? "+" : "")
                  : transaction.type === "income"
                  ? "+"
                  : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
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



