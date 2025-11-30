import { useState } from "react";
import { formatDateInput, getWeekRange, getMonthRange } from "../utils/dateUtils";

export type PeriodType = "day" | "week" | "month" | "custom";

interface PeriodSelectorProps {
  periodType?: PeriodType;
  onPeriodChange: (type: PeriodType, startDate?: string, endDate?: string) => void;
}

export const PeriodSelector = ({ periodType = "month", onPeriodChange }: PeriodSelectorProps) => {
  const [customStartDate, setCustomStartDate] = useState(
    formatDateInput(new Date())
  );
  const [customEndDate, setCustomEndDate] = useState(
    formatDateInput(new Date())
  );

  const handlePeriodChange = (type: PeriodType) => {
    const today = new Date();

    switch (type) {
      case "day":
        onPeriodChange(type, formatDateInput(today), formatDateInput(today));
        break;
      case "week":
        const week = getWeekRange(today);
        onPeriodChange(
          type,
          formatDateInput(week.start),
          formatDateInput(week.end)
        );
        break;
      case "month":
        const month = getMonthRange(today);
        onPeriodChange(
          type,
          formatDateInput(month.start),
          formatDateInput(month.end)
        );
        break;
      case "custom":
        onPeriodChange(type, customStartDate, customEndDate);
        break;
    }
  };

  const handleCustomDateChange = () => {
    if (periodType === "custom") {
      onPeriodChange("custom", customStartDate, customEndDate);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handlePeriodChange("day")}
          className={`px-4 py-2 rounded-md ${
            periodType === "day"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          День
        </button>
        <button
          onClick={() => handlePeriodChange("week")}
          className={`px-4 py-2 rounded-md ${
            periodType === "week"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Неделя
        </button>
        <button
          onClick={() => handlePeriodChange("month")}
          className={`px-4 py-2 rounded-md ${
            periodType === "month"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Месяц
        </button>
        <button
          onClick={() => handlePeriodChange("custom")}
          className={`px-4 py-2 rounded-md ${
            periodType === "custom"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Произвольный период
        </button>
      </div>

      {periodType === "custom" && (
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Начало периода
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                handleCustomDateChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Конец периода
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                handleCustomDateChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

