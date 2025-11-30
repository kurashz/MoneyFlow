import { useState, useEffect, useRef, useMemo } from "react";
import type { Transaction, TransactionCreate } from "../types/transaction";
import { formatCurrency } from "../utils/dateUtils";

interface TotalAmountProps {
  transactions: Transaction[];
  onCreateTransaction?: (transaction: TransactionCreate) => Promise<void>;
}

// Безопасная функция для вычисления математических выражений
const evaluateExpression = (expression: string): number | null => {
  try {
    // Удаляем все пробелы
    const cleaned = expression.replace(/\s/g, "");
    
    // Проверяем, что строка содержит только числа, операторы и скобки
    if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) {
      return null;
    }
    
    // Используем Function constructor для безопасного вычисления
    // Это безопаснее, чем eval, так как мы проверяем входные данные
    const result = Function(`"use strict"; return (${cleaned})`)();
    
    if (typeof result !== "number" || !isFinite(result)) {
      return null;
    }
    
    return result;
  } catch {
    return null;
  }
};

export const TotalAmount = ({ transactions, onCreateTransaction }: TotalAmountProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокусируемся на input при начале редактирования
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Вычисляем итоговую сумму: доходы - расходы + корректировки
  const totalAmount = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const adjustment = transactions
      .filter((t) => t.type === "adjustment")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return income - expense + adjustment;
  }, [transactions]);

  const handleClick = () => {
    if (!isEditing) {
      setInputValue(totalAmount.toString());
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSave = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || !onCreateTransaction) {
      setIsEditing(false);
      setInputValue("");
      return;
    }
    
    let adjustmentAmount: number | null = null;
    
    // Проверяем, является ли ввод относительным значением (начинается с + или -)
    if (trimmedValue.startsWith("+") || trimmedValue.startsWith("-")) {
      // Это относительное изменение
      const evaluated = evaluateExpression(trimmedValue);
      if (evaluated !== null) {
        adjustmentAmount = evaluated;
      }
    } else {
      // Это абсолютное значение или выражение
      const evaluated = evaluateExpression(trimmedValue);
      if (evaluated !== null) {
        // Вычисляем разницу между желаемой суммой и текущей
        adjustmentAmount = evaluated - totalAmount;
      }
    }
    
    // Создаем транзакцию типа adjustment, если есть изменение
    if (adjustmentAmount !== null && adjustmentAmount !== 0 && onCreateTransaction) {
      const today = new Date().toISOString().split('T')[0];
      try {
        await onCreateTransaction({
          date: today,
          type: "adjustment",
          amount: adjustmentAmount, // Может быть положительным или отрицательным
          description: `Корректировка общей суммы`,
        });
        // Состояние обновится автоматически через пропсы transactions
      } catch (error) {
        console.error("Ошибка при создании корректировки:", error);
      }
    }
    
    setIsEditing(false);
    setInputValue("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Общая сумма
          </label>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Введите сумму или изменение (например: 10000 или +4000)"
            />
          ) : (
            <div
              onClick={handleClick}
              className="px-4 py-3 border border-gray-300 rounded-md text-2xl font-bold text-gray-800 min-h-[60px] flex items-center cursor-pointer hover:border-blue-500"
            >
              {formatCurrency(totalAmount)}
            </div>
          )}
        </div>
        <div className="ml-6 text-right">
          <div className="text-xs text-gray-400 mb-2">Детализация</div>
          {transactions.filter((t) => t.type === "income").length > 0 && (
            <div className="text-sm text-green-600 mb-1">
              +{formatCurrency(
                transactions
                  .filter((t) => t.type === "income")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}{" "}
              (доходы)
            </div>
          )}
          {transactions.filter((t) => t.type === "expense").length > 0 && (
            <div className="text-sm text-red-600 mb-1">
              -{formatCurrency(
                transactions
                  .filter((t) => t.type === "expense")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}{" "}
              (расходы)
            </div>
          )}
          {transactions.filter((t) => t.type === "adjustment").length > 0 && (
            <div className="text-sm text-gray-600 mb-1">
              {(() => {
                const adjustmentTotal = transactions
                  .filter((t) => t.type === "adjustment")
                  .reduce((sum, t) => sum + t.amount, 0);
                return adjustmentTotal >= 0 ? "+" : "";
              })()}
              {formatCurrency(
                Math.abs(
                  transactions
                    .filter((t) => t.type === "adjustment")
                    .reduce((sum, t) => sum + t.amount, 0)
                )
              )}{" "}
              (корректировки)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

