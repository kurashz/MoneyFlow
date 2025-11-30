import { useState, FormEvent, useEffect } from "react";
import type { TransactionCreate, TransactionUpdate, TransactionType } from "../types/transaction";
import { formatDateInput } from "../utils/dateUtils";

interface TransactionFormProps {
  onSubmit: (transaction: TransactionCreate | TransactionUpdate) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TransactionCreate>;
}

const EXPENSE_CATEGORIES = [
  "Еда",
  "Быт",
  "Непредвиденное",
  "Машина",
  "Подарки",
  "Развлечения",
  "Долг",
];

export const TransactionForm = ({
  onSubmit,
  onCancel,
  initialData,
}: TransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionCreate>({
    date: (initialData?.date && initialData.date.trim()) ? initialData.date : formatDateInput(new Date()),
    type: initialData?.type || "expense",
    amount: initialData?.amount || 0,
    category: initialData?.category || "",
    description: initialData?.description || "",
  });
  const [amountInput, setAmountInput] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для преобразования ошибки в строку
  const formatError = (error: any): string => {
    // Если это уже строка, возвращаем её
    if (typeof error === "string") {
      return error;
    }

    // Если это объект с detail (FastAPI validation error)
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // Если detail - массив объектов ошибок
      if (Array.isArray(detail)) {
        return detail
          .map((err: any) => {
            if (typeof err === "string") {
              return err;
            }
            // Форматируем объект ошибки
            const field = err.loc?.slice(1).join(".") || "поле";
            const message = err.msg || "Ошибка валидации";
            return `${field}: ${message}`;
          })
          .join("; ");
      }
      
      // Если detail - строка
      if (typeof detail === "string") {
        return detail;
      }
    }

    // Если есть message
    if (error?.message) {
      return error.message;
    }

    // Дефолтное сообщение
    return "Произошла ошибка при сохранении транзакции";
  };

  // Сброс категории при смене типа на доход
  useEffect(() => {
    if (formData.type === "income") {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
  }, [formData.type]);

  // Синхронизация формы с initialData при изменении (для редактирования)
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: (initialData.date && initialData.date.trim()) ? initialData.date : formatDateInput(new Date()),
        type: initialData.type || "expense",
        amount: initialData.amount || 0,
        category: initialData.category || "",
        description: initialData.description || "",
      });
      if (initialData.amount !== undefined) {
        setAmountInput(initialData.amount.toString());
      }
    }
  }, [initialData]);

  // Функция для вычисления выражения
  const calculateExpression = (expression: string): number | null => {
    if (!expression.startsWith("=")) {
      return null;
    }
    
    try {
      // Убираем знак = и пробелы
      const expr = expression.slice(1).trim();
      
      // Защита от выполнения опасных операций
      // Разрешаем только цифры, точки, операторы +, -, *, /, и скобки
      if (!/^[\d+\-*/().\s]+$/.test(expr)) {
        return null;
      }
      
      // Вычисляем выражение
      // Используем Function constructor для безопасного вычисления
      const result = Function(`"use strict"; return (${expr})`)();
      
      // Проверяем, что результат - число
      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return result;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Обработка изменения суммы
  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    
    // Если поле пустое, устанавливаем amount в 0
    if (value.trim() === "") {
      setFormData((prev) => ({ ...prev, amount: 0 }));
      return;
    }
    
    // Если начинается с =, пытаемся вычислить
    if (value.startsWith("=")) {
      const calculated = calculateExpression(value);
      if (calculated !== null) {
        setFormData((prev) => ({ ...prev, amount: calculated }));
      } else {
        // Если вычисление не удалось (пользователь еще печатает или выражение неверное)
        // Устанавливаем 0, чтобы показать, что выражение еще не вычислено
        setFormData((prev) => ({ ...prev, amount: 0 }));
      }
      return;
    }
    
    // Обычный ввод числа
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && isFinite(numValue)) {
      setFormData((prev) => ({ ...prev, amount: numValue }));
    } else {
      // Если это не число, оставляем текущее значение или 0
      setFormData((prev) => ({ ...prev, amount: prev.amount || 0 }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Валидация: категория обязательна для расходов
    if (formData.type === "expense" && !formData.category) {
      setError("Категория обязательна для расходов");
      setLoading(false);
      return;
    }

    // Валидация даты
    if (!formData.date || !formData.date.trim()) {
      setError("Дата обязательна");
      setLoading(false);
      return;
    }

    // Валидация суммы
    if (!amountInput.trim()) {
      setError("Сумма обязательна");
      setLoading(false);
      return;
    }

    let finalAmount = formData.amount;
    
    // Если введено выражение с =, пытаемся вычислить
    if (amountInput.trim().startsWith("=")) {
      const calculated = calculateExpression(amountInput.trim());
      if (calculated === null) {
        setError("Неверное выражение. Используйте формат: =50+30+20");
        setLoading(false);
        return;
      }
      finalAmount = calculated;
    } else {
      // Обычное число
      const numValue = parseFloat(amountInput.trim());
      if (isNaN(numValue) || !isFinite(numValue)) {
        setError("Введите корректную сумму");
        setLoading(false);
        return;
      }
      finalAmount = numValue;
    }

    // Для adjustment сумма может быть отрицательной, для остальных - только положительной
    if (formData.type !== "adjustment" && finalAmount <= 0) {
      setError("Сумма должна быть больше нуля");
      setLoading(false);
      return;
    }

    try {
      // Формируем данные для отправки
      let submitData: TransactionCreate | TransactionUpdate;
      
      if (initialData) {
        // Режим редактирования - используем TransactionUpdate
        // date теперь обязательное поле
        if (!formData.date || !formData.date.trim()) {
          setError("Дата обязательна");
          setLoading(false);
          return;
        }
        
        submitData = {
          date: formData.date.trim(),
          type: formData.type,
          amount: finalAmount,
        } as TransactionUpdate;

        // Обработка описания
        const trimmedDescription = formData.description?.trim();
        if (trimmedDescription) {
          submitData.description = trimmedDescription;
        } else {
          // При редактировании отправляем null для очистки описания, если оно было удалено
          submitData.description = null;
        }

        // Обработка категории
        if (formData.type === "expense") {
          // Для расходов: отправляем категорию или null при редактировании
          if (formData.category && formData.category.trim()) {
            submitData.category = formData.category.trim();
          } else {
            // При редактировании отправляем null, если категория не выбрана
            submitData.category = null;
          }
        } else {
          // Для доходов: при редактировании отправляем null для очистки категории
          submitData.category = null;
        }
      } else {
        // Режим создания - используем TransactionCreate
        submitData = {
          date: formData.date,
          type: formData.type,
          amount: finalAmount,
        } as TransactionCreate;

        // Обработка описания
        const trimmedDescription = formData.description?.trim();
        if (trimmedDescription) {
          submitData.description = trimmedDescription;
        }

        // Обработка категории
        if (formData.type === "expense" && formData.category && formData.category.trim()) {
          submitData.category = formData.category.trim();
        }
        // При создании дохода не отправляем поле category
      }

      await onSubmit(submitData);
      // Сброс формы после успешного создания
      if (!initialData) {
        setFormData({
          date: formatDateInput(new Date()),
          type: "expense",
          amount: 0,
          category: "",
          description: "",
        });
        setAmountInput("");
      }
    } catch (error: any) {
      console.error("Ошибка при создании транзакции:", error);
      if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
        setError("Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:8000");
      } else {
        setError(formatError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min="2020-01-01"
          max="2050-12-31"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Тип транзакции <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as TransactionType })
          }
          required
          disabled={formData.type === "adjustment"}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
          {formData.type === "adjustment" && (
            <option value="adjustment">Корректировка</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сумма
          {amountInput.trim().startsWith("=") && formData.amount > 0 && (
            <span className="text-gray-500 text-xs font-normal ml-2">
              = {formData.amount.toFixed(2)}
            </span>
          )}
        </label>
        <input
          type="text"
          value={amountInput}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Введите сумму или начните с = для вычисления"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Примеры: 100 или =50+30+20
        </p>
      </div>

      {formData.type === "expense" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите категорию</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
};

