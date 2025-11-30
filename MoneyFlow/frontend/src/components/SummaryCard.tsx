import { formatCurrency } from "../utils/dateUtils";

interface SummaryCardProps {
  title: string;
  income: number;
  expense: number;
  balance: number;
}

export const SummaryCard = ({
  title,
  income,
  expense,
  balance,
}: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Доходы:</span>
          <span className="text-green-600 font-semibold text-lg">
            {formatCurrency(income)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Расходы:</span>
          <span className="text-red-600 font-semibold text-lg">
            {formatCurrency(expense)}
          </span>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Баланс:</span>
          <span
            className={`font-bold text-xl ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  );
};



